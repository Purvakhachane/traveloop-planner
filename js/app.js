/* ============================================================
   TRAVELOOP – Main App Router & Controller
   ============================================================ */

const App = {
  currentScreen: null,
  currentParam: null,
  sidebarOpen: false,

  screens: {
    'auth': { render: () => AuthScreen.render(), title: 'Sign In', noAuth: true, fullWidth: true },
    'dashboard': { render: () => DashboardScreen.render(), title: 'Dashboard', navId: 'nav-dashboard' },
    'trips': { render: () => TripsScreen.render(), title: 'My Trips', navId: 'nav-trips' },
    'create-trip': { render: (p) => CreateTripScreen.render(p), title: 'Create Trip', navId: 'nav-create', afterRender: () => CreateTripScreen.afterRender() },
    'itinerary-builder': { render: (p) => ItineraryBuilderScreen.render(p), title: 'Itinerary Builder' },
    'itinerary-view': { render: (p) => ItineraryViewScreen.render(p), title: 'Itinerary View' },
    'city-search': { render: () => CitySearchScreen.render(), title: 'Explore Cities', navId: 'nav-cities' },
    'activity-search': { render: (p) => ActivitySearchScreen.render(p), title: 'Activities', navId: 'nav-activities' },
    'budget': { render: (p) => BudgetScreen.render(p), title: 'Budget Planner', afterRender: () => BudgetScreen.afterRender() },
    'packing': { render: (p) => PackingScreen.render(p), title: 'Packing Checklist' },
    'shared': { render: (p) => SharedScreen.render(p), title: 'Shared Itinerary' },
    'profile': { render: () => ProfileScreen.render(), title: 'Profile & Settings', navId: 'nav-profile' },
    'notes': { render: (p) => NotesScreen.render(p), title: 'Trip Notes' },
    'admin': { render: () => AdminScreen.render(), title: 'Admin Dashboard', navId: 'nav-admin', afterRender: () => AdminScreen.afterRender() },
  },

  init() {
    // Determine initial screen
    const user = DB.getCurrentUser();
    const token = localStorage.getItem('tl_auth_token');
    
    if (token) {
      API.setToken(token);
    }

    if (!user || !token) {
      this.navigate('auth');
    } else {
      this.navigate('dashboard');
    }
  },

  async navigate(screenName, param = null) {
    const screenDef = this.screens[screenName];
    if (!screenDef) { console.error('Unknown screen:', screenName); return; }

    // Auth guard
    const user = DB.getCurrentUser();
    if (!screenDef.noAuth && !user) { this.navigate('auth'); return; }

    this.currentScreen = screenName;
    this.currentParam = param;

    const isAuth = screenDef.noAuth;
    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');
    const mainContent = document.querySelector('.main-content');
    const container = document.getElementById('screen-container');

    // Show/hide chrome
    if (isAuth) {
      sidebar.classList.add('hidden');
      topbar.classList.add('hidden');
      mainContent.classList.add('full-width');
    } else {
      sidebar.classList.remove('hidden');
      topbar.classList.remove('hidden');
      mainContent.classList.remove('full-width');
      document.getElementById('topbar-title').textContent = screenDef.title;
      if (user) {
        document.getElementById('topbar-avatar').textContent = user.name[0].toUpperCase();
      }
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (screenDef.navId) {
      const navEl = document.getElementById(screenDef.navId);
      if (navEl) navEl.classList.add('active');
    }

    // Show loading state
    container.innerHTML = `<div class="loading-screen" style="height:400px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:20px;">
      <div class="loader"></div>
      <div style="color:var(--text-muted); font-size:14px; animate:pulse 1.5s infinite;">Preparing your journey...</div>
    </div>`;

    // Render screen with error boundary
    try {
      const html = await screenDef.render(param);
      container.innerHTML = html;
      container.style.animation = 'none';
      container.offsetHeight; // reflow
      container.style.animation = '';
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        this.navigate('auth');
        return;
      }
      console.error('Screen render error [' + screenName + ']:', err);
      container.innerHTML = `<div class="empty-state" style="padding:80px 20px;">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Oops! Something went wrong</div>
        <div class="empty-state-desc" style="color:var(--accent-coral);">${err.message}</div>
        <button class="btn btn-primary" onclick="App.navigate('dashboard')" style="margin-top:20px;">← Go to Dashboard</button>
      </div>`;
    }

    // Run afterRender hooks
    if (screenDef.afterRender) {
      setTimeout(() => { try { screenDef.afterRender(); } catch(e) { console.warn('afterRender error:', e); } }, 50);
    }

    // Scroll to top
    container.scrollTop = 0;
    window.scrollTo(0, 0);

    // Close mobile sidebar on navigate
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('mobile-open');
    }
  },

  rerender() {
    this.navigate(this.currentScreen, this.currentParam);
  },

  logout() {
    DB.clearCurrentUser();
    API.setToken(null);
    this.navigate('auth');
    this.toast('Logged out. Safe travels! ✈️', 'info');
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      sidebar.classList.add('mobile-open');
      sidebar.classList.remove('hidden');
    } else {
      sidebar.classList.remove('mobile-open');
    }
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3100);
  },

  openModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-content').innerHTML = '';
  },
};

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) App.closeModal();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') App.closeModal();
});

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
