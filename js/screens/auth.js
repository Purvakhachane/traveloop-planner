/* ============================================================
   TRAVELOOP – Auth Screen (Login / Signup)
   ============================================================ */

const AuthScreen = {
  render() {
    return `
    <div class="auth-screen">
      <div class="auth-card">
        <div class="auth-logo">
          <span class="auth-logo-icon">✈️</span>
          <div class="auth-logo-text">Traveloop</div>
          <div class="auth-logo-tagline">Your journey begins here</div>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" id="auth-tab-login" onclick="AuthScreen.switchTab('login')">Sign In</button>
          <button class="auth-tab" id="auth-tab-signup" onclick="AuthScreen.switchTab('signup')">Create Account</button>
        </div>

        <!-- Login Form -->
        <div id="auth-login-form">
          <form class="auth-form" onsubmit="AuthScreen.login(event)">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="login-email" placeholder="your@email.com" value="demo@traveloop.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="login-password" placeholder="Enter your password" value="demo123" required autocomplete="current-password" />
            </div>
            <div style="text-align:right; margin-top:-8px;">
              <a href="#" style="font-size:13px; color:var(--accent-primary);">Forgot Password?</a>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" id="login-btn" style="width:100%; margin-top:8px;">
              ✈️ &nbsp; Sign In & Fly
            </button>
          </form>
          <div class="auth-footer">
            <span style="color:var(--text-muted); font-size:12px;">Demo: demo@traveloop.com / demo123</span>
          </div>
        </div>

        <!-- Signup Form -->
        <div id="auth-signup-form" class="hidden">
          <form class="auth-form" onsubmit="AuthScreen.signup(event)">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="signup-name" placeholder="Alex Rivera" required autocomplete="name" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="signup-email" placeholder="your@email.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="signup-password" placeholder="Create a strong password" required autocomplete="new-password" />
            </div>
            <button type="submit" class="btn btn-sunset btn-lg" id="signup-btn" style="width:100%; margin-top:8px;">
              🚀 &nbsp; Start Exploring
            </button>
          </form>
        </div>
      </div>
    </div>`;
  },

  switchTab(tab) {
    const loginEl = document.getElementById('auth-login-form');
    const signupEl = document.getElementById('auth-signup-form');
    const loginTab = document.getElementById('auth-tab-login');
    const signupTab = document.getElementById('auth-tab-signup');
    if (tab === 'login') {
      loginEl.classList.remove('hidden');
      signupEl.classList.add('hidden');
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
    } else {
      loginEl.classList.add('hidden');
      signupEl.classList.remove('hidden');
      loginTab.classList.remove('active');
      signupTab.classList.add('active');
    }
  },

  login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const users = DB.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { App.toast('Invalid email or password', 'error'); return; }
    DB.setCurrentUser(user);
    App.toast(`Welcome back, ${user.name}! 🌍`, 'success');
    App.navigate('dashboard');
  },

  signup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const users = DB.getUsers();
    if (users.find(u => u.email === email)) { App.toast('Email already registered', 'error'); return; }
    const user = { id: DB.uuid(), name, email, password, createdAt: new Date().toISOString() };
    users.push(user);
    DB.saveUsers(users);
    DB.setCurrentUser(user);
    App.toast(`Welcome to Traveloop, ${name}! ✈️`, 'success');
    App.navigate('dashboard');
  }
};
