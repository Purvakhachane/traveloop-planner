/* ============================================================
   TRAVELOOP – Dashboard / Home Screen
   ============================================================ */

const DashboardScreen = {
  async render() {
    const user = DB.getCurrentUser();
    const data = await API.getDashboardData();
    
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const recentTrips = data.recentTrips || [];

    const popularDestinations = CITIES_DATA.slice(0,6);

    return `
    <div>
      <!-- Hero -->
      <div class="dashboard-hero">
        <div class="hero-greeting">${greeting}, ${user.name.split(' ')[0]} 👋</div>
        <h1 class="hero-title">Ready for your next<br><span class="text-gradient">adventure?</span></h1>
        <p class="hero-subtitle">Plan multi-city itineraries, track budgets, and share unforgettable journeys with the world.</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" onclick="App.navigate('create-trip')">✈️ Plan New Trip</button>
          <button class="btn btn-ghost btn-lg" onclick="App.navigate('city-search')">🔍 Explore Cities</button>
        </div>
        <div class="dashboard-hero-emoji">🌍</div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card blue">
          <div class="stat-icon">🗺️</div>
          <div class="stat-value text-gradient">${data.totalTrips}</div>
          <div class="stat-label">Total Trips</div>
        </div>
        <div class="stat-card coral">
          <div class="stat-icon">📍</div>
          <div class="stat-value text-gradient-sunset">${data.upcomingCount}</div>
          <div class="stat-label">Upcoming</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">💰</div>
          <div class="stat-value" style="background:var(--gradient-purple);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">$${data.plannedBudget.toLocaleString()}</div>
          <div class="stat-label">Planned Budget</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">💳</div>
          <div class="stat-value" style="background:var(--gradient-green);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">$${data.actualCost.toLocaleString()}</div>
          <div class="stat-label">Actual Cost</div>
        </div>
      </div>

      <!-- Recent Trips -->
      <div class="dashboard-section">
        <div class="flex justify-between items-center" style="margin-bottom:16px;">
          <div class="section-heading" style="flex:1;">🧳 Recent Trips</div>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('trips')">View All →</button>
        </div>
        ${recentTrips.length === 0 ? `
          <div class="empty-state" style="padding:40px;">
            <div class="empty-state-icon">🧳</div>
            <div class="empty-state-title">No trips yet</div>
            <div class="empty-state-desc">Start planning your first adventure!</div>
            <button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Plan Your First Trip</button>
          </div>
        ` : `
          <div class="recent-trips-row">
            ${recentTrips.map(trip => this._renderTripCard(trip)).join('')}
          </div>
        `}
      </div>

      <!-- Quick Actions -->
      <div class="dashboard-section">
        <div class="section-heading">⚡ Quick Actions</div>
        <div class="quick-actions">
          <div class="quick-action-card" onclick="App.navigate('create-trip')">
            <div class="quick-action-icon">➕</div>
            <div class="quick-action-label">New Trip</div>
          </div>
          <div class="quick-action-card" onclick="App.navigate('city-search')">
            <div class="quick-action-icon">🏙️</div>
            <div class="quick-action-label">Find Cities</div>
          </div>
          <div class="quick-action-card" onclick="App.navigate('activity-search')">
            <div class="quick-action-icon">🎯</div>
            <div class="quick-action-label">Activities</div>
          </div>
          <div class="quick-action-card" onclick="App.navigate('budget')">
            <div class="quick-action-icon">💳</div>
            <div class="quick-action-label">Budget Planner</div>
          </div>
          <div class="quick-action-card" onclick="App.navigate('packing')">
            <div class="quick-action-icon">🎒</div>
            <div class="quick-action-label">Packing List</div>
          </div>
          <div class="quick-action-card" onclick="App.navigate('notes')">
            <div class="quick-action-icon">📝</div>
            <div class="quick-action-label">Trip Notes</div>
          </div>
        </div>
      </div>

      <!-- Popular Destinations -->
      <div class="dashboard-section">
        <div class="section-heading">🔥 Popular Destinations</div>
        <div class="popular-destinations">
          ${popularDestinations.map(city => `
            <div class="destination-card" onclick="App.navigate('city-search')" style="background:var(--bg-card); border:1px solid var(--border-glass);">
              <div class="destination-bg">${city.flag}</div>
              <div class="destination-overlay"></div>
              <div class="destination-info">
                <div class="destination-name">${city.name}</div>
                <div class="destination-country">${city.country} · $${city.avgCostPerDay}/day</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>`;
  },

  _renderTripCard(trip) {
    const statusColors = { upcoming: 'badge-blue', completed: 'badge-green', planning: 'badge-amber' };
    return `
    <div class="trip-card" onclick="App.navigate('itinerary-view', '${trip.id}')">
      <div class="trip-card-cover">
        <div class="trip-card-cover-gradient ${trip.coverGradient || 'trip-cover-1'}">${trip.emoji || '✈️'}</div>
        <div class="trip-card-status">
          <span class="badge ${statusColors[trip.status] || 'badge-grey'}">${trip.status || 'planning'}</span>
        </div>
      </div>
      <div class="trip-card-body">
        <div class="trip-card-name">${trip.name}</div>
        <div class="trip-card-meta">
          <span>📅 ${this._formatDateRange(trip.startDate, trip.endDate)}</span>
          ${trip.budget ? `<span>💰 $${trip.budget.toLocaleString()}</span>` : ''}
        </div>
        <div class="trip-card-actions">
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); App.navigate('itinerary-builder', '${trip.id}')">✏️ Edit</button>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); App.navigate('itinerary-view', '${trip.id}')">👁️ View</button>
        </div>
      </div>
    </div>`;
  },

  _formatDateRange(start, end) {
    if (!start) return 'No dates set';
    const s = new Date(start);
    const e = end ? new Date(end) : null;
    const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
  }
};
