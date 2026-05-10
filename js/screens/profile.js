/* ============================================================
   TRAVELOOP – User Profile / Settings Screen
   ============================================================ */

const ProfileScreen = {
  _editing: false,

  render() {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    const allStops = trips.flatMap(t => DB.getTripStops(t.id));
    const totalStops = allStops.length;
    const totalBudget = trips.reduce((s, t) => s + (t.budget || 0), 0);
    const completedTrips = trips.filter(t => t.status === 'completed').length;

    // Build favourite cities (unique cities from all stops)
    const citySeen = {};
    const favouriteCities = [];
    allStops.forEach(s => {
      if (s.city && !citySeen[s.city]) {
        citySeen[s.city] = true;
        favouriteCities.push({ city: s.city, flag: s.flag || '📍', country: s.country || '' });
      }
    });

    return `
    <div>
      <div class="page-header">
        <h1>👤 Profile & <span class="text-gradient">Settings</span></h1>
        <p>Manage your account and preferences</p>
      </div>

      <div class="profile-layout">
        <!-- Avatar & Stats Sidebar -->
        <div>
          <div class="profile-avatar-section">
            <div class="profile-avatar-circle" title="Your Avatar">
              ${user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div class="profile-name">${user.name}</div>
            <div class="profile-email">${user.email}</div>
            <div style="margin-bottom:20px;">
              <span class="badge badge-blue">Member since ${new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {month:'short',year:'numeric'})}</span>
            </div>
            <div class="profile-stats-mini">
              <div class="profile-stat-mini">
                <div class="profile-stat-mini-value text-gradient">${trips.length}</div>
                <div class="profile-stat-mini-label">Trips</div>
              </div>
              <div class="profile-stat-mini">
                <div class="profile-stat-mini-value text-gradient-sunset">${totalStops}</div>
                <div class="profile-stat-mini-label">Cities</div>
              </div>
              <div class="profile-stat-mini">
                <div class="profile-stat-mini-value" style="background:var(--gradient-green);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${completedTrips}</div>
                <div class="profile-stat-mini-label">Done</div>
              </div>
            </div>
          </div>

          <!-- Visited Cities -->
          <div class="card" style="margin-top:16px;">
            <h4 style="margin-bottom:12px; font-size:15px;">⭐ My Cities</h4>
            ${favouriteCities.length === 0
              ? `<p style="color:var(--text-muted); font-size:14px;">Add cities to your trips to see them here!</p>`
              : `<div style="display:flex; flex-direction:column; gap:6px;">
                  ${favouriteCities.slice(0, 6).map(c => `
                    <div style="display:flex; align-items:center; gap:10px; font-size:14px; padding:8px 10px; background:var(--bg-card); border-radius:8px; border:1px solid var(--border-glass);">
                      <span>${c.flag}</span>
                      <span style="flex:1;">${c.city}</span>
                      <span style="font-size:12px; color:var(--text-muted);">${c.country}</span>
                    </div>`).join('')}
                </div>`}
          </div>

          <!-- Budget Overview -->
          <div class="card" style="margin-top:16px;">
            <h4 style="margin-bottom:12px; font-size:15px;">💰 Budget Summary</h4>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:14px; color:var(--text-secondary);">
              <div style="display:flex; justify-content:space-between;">
                <span>Total Budget:</span>
                <strong style="color:var(--accent-green);">$${totalBudget.toLocaleString()}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Avg per Trip:</span>
                <strong style="color:var(--accent-primary);">$${trips.length > 0 ? Math.round(totalBudget / trips.length).toLocaleString() : 0}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Panels -->
        <div>
          <!-- Edit Profile -->
          <div class="card" style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
              <h3 style="font-size:18px;">✏️ Edit Profile</h3>
              ${!this._editing ? `<button class="btn btn-ghost btn-sm" onclick="ProfileScreen.startEdit()">✏️ Edit</button>` : ''}
            </div>
            ${this._editing ? `
              <form style="display:flex; flex-direction:column; gap:16px;" onsubmit="ProfileScreen.saveProfile(event)">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-input" id="profile-name" value="${user.name}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-input" id="profile-email" value="${user.email}" required />
                </div>
                <div class="form-group">
                  <label class="form-label">New Password <span style="color:var(--text-muted); font-weight:400;">(optional)</span></label>
                  <input type="password" class="form-input" id="profile-password" placeholder="Leave blank to keep current password" />
                </div>
                <div style="display:flex; gap:12px;">
                  <button type="submit" class="btn btn-primary">💾 Save Changes</button>
                  <button type="button" class="btn btn-ghost" onclick="ProfileScreen.cancelEdit()">Cancel</button>
                </div>
              </form>
            ` : `
              <div style="display:flex; flex-direction:column; gap:14px; font-size:15px;">
                <div style="display:flex; gap:16px; align-items:center; padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-glass);">
                  <span style="color:var(--text-muted); width:70px; flex-shrink:0; font-size:13px; font-weight:600;">NAME</span>
                  <strong style="color:var(--text-primary);">${user.name}</strong>
                </div>
                <div style="display:flex; gap:16px; align-items:center; padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-glass);">
                  <span style="color:var(--text-muted); width:70px; flex-shrink:0; font-size:13px; font-weight:600;">EMAIL</span>
                  <strong style="color:var(--text-primary);">${user.email}</strong>
                </div>
                <div style="display:flex; gap:16px; align-items:center; padding:12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-glass);">
                  <span style="color:var(--text-muted); width:70px; flex-shrink:0; font-size:13px; font-weight:600;">JOINED</span>
                  <strong style="color:var(--text-primary);">${new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'})}</strong>
                </div>
              </div>
            `}
          </div>

          <!-- App Preferences -->
          <div class="card" style="margin-bottom:20px;">
            <h3 style="font-size:18px; margin-bottom:20px;">⚙️ Preferences</h3>
            <div style="display:flex; flex-direction:column; gap:18px;">

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-glass);">
                <div>
                  <div style="font-weight:600; font-size:14px; margin-bottom:3px;">Currency</div>
                  <div style="font-size:13px; color:var(--text-muted);">Display currency for budgets and costs</div>
                </div>
                <select class="form-input" style="width:130px;" onchange="App.toast('Preference saved ✅', 'success')">
                  <option value="USD">🇺🇸 USD ($)</option>
                  <option value="EUR">🇪🇺 EUR (€)</option>
                  <option value="GBP">🇬🇧 GBP (£)</option>
                  <option value="INR">🇮🇳 INR (₹)</option>
                  <option value="JPY">🇯🇵 JPY (¥)</option>
                </select>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-glass);">
                <div>
                  <div style="font-weight:600; font-size:14px; margin-bottom:3px;">Language</div>
                  <div style="font-size:13px; color:var(--text-muted);">Interface language</div>
                </div>
                <select class="form-input" style="width:130px;" onchange="App.toast('Language updated ✅', 'success')">
                  <option>🇺🇸 English</option>
                  <option>🇪🇸 Español</option>
                  <option>🇫🇷 Français</option>
                  <option>🇩🇪 Deutsch</option>
                  <option>🇯🇵 日本語</option>
                </select>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--border-glass);">
                <div>
                  <div style="font-weight:600; font-size:14px; margin-bottom:3px;">Email Notifications</div>
                  <div style="font-size:13px; color:var(--text-muted);">Trip reminders and travel alerts</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-muted);">
                  <span>Off</span>
                  <div id="notif-toggle" style="width:44px; height:24px; background:var(--gradient-primary); border-radius:12px; cursor:pointer; position:relative; transition:all 0.3s;" onclick="ProfileScreen.toggleNotif()">
                    <div style="width:18px; height:18px; background:white; border-radius:50%; position:absolute; top:3px; right:3px; transition:all 0.3s;"></div>
                  </div>
                  <span style="color:var(--accent-green);">On</span>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0;">
                <div>
                  <div style="font-weight:600; font-size:14px; margin-bottom:3px;">Public Profile</div>
                  <div style="font-size:13px; color:var(--text-muted);">Let others discover your shared trips</div>
                </div>
                <span class="badge badge-green">🌐 Enabled</span>
              </div>
            </div>
          </div>

          <!-- My Trips Quick Access -->
          <div class="card" style="margin-bottom:20px;">
            <h3 style="font-size:18px; margin-bottom:16px;">🗺️ My Trips</h3>
            ${trips.length === 0
              ? `<div style="text-align:center; padding:20px;"><p style="color:var(--text-muted); margin-bottom:16px;">No trips yet</p><button class="btn btn-primary btn-sm" onclick="App.navigate('create-trip')">Create First Trip</button></div>`
              : `<div style="display:flex; flex-direction:column; gap:8px;">
                  ${trips.slice(0, 5).map(t => `
                    <div style="display:flex; align-items:center; gap:12px; padding:10px 12px; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-glass); cursor:pointer;" onclick="App.navigate('itinerary-view', '${t.id}')">
                      <span style="font-size:20px;">${t.emoji || '✈️'}</span>
                      <span style="flex:1; font-weight:600; font-size:14px;">${t.name}</span>
                      <span class="badge ${t.status === 'completed' ? 'badge-green' : t.status === 'upcoming' ? 'badge-blue' : 'badge-amber'}">${t.status || 'planning'}</span>
                      <span style="font-size:12px; color:var(--text-muted);">${t.budget ? '$' + t.budget.toLocaleString() : 'No budget'}</span>
                    </div>`).join('')}
                  ${trips.length > 5 ? `<button class="btn btn-ghost btn-sm" onclick="App.navigate('trips')">View all ${trips.length} trips →</button>` : ''}
                </div>`}
          </div>

          <!-- Danger Zone -->
          <div class="card" style="border-color:rgba(247,121,125,0.25); background:rgba(247,121,125,0.03);">
            <h3 style="font-size:18px; margin-bottom:8px; color:var(--accent-coral);">⚠️ Danger Zone</h3>
            <p style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">These actions are irreversible. Please proceed with caution.</p>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              <button class="btn btn-danger" onclick="ProfileScreen.clearData()">🗑️ Clear All Trip Data</button>
              <button class="btn btn-danger" onclick="App.toast('Please contact support to delete your account.', 'info')">❌ Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  toggleNotif() { App.toast('Notification preference saved', 'success'); },
  startEdit() { this._editing = true; App.rerender(); },
  cancelEdit() { this._editing = false; App.rerender(); },

  saveProfile(e) {
    e.preventDefault();
    const user = DB.getCurrentUser();
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const password = document.getElementById('profile-password').value;
    if (!name || !email) { App.toast('Name and email are required', 'error'); return; }
    const users = DB.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx < 0) return;
    users[idx].name = name;
    users[idx].email = email;
    if (password) users[idx].password = password;
    DB.saveUsers(users);
    DB.setCurrentUser(users[idx]);
    this._editing = false;
    App.toast('Profile updated! ✅', 'success');
    App.rerender();
  },

  clearData() {
    App.openModal(`
      <h2 style="margin-bottom:16px;">🗑️ Clear All Trip Data?</h2>
      <p style="color:var(--text-secondary); margin-bottom:24px; line-height:1.6;">This will permanently delete all your trips, stops, packing lists, and notes. Your account credentials will remain.</p>
      <div style="display:flex; gap:12px;">
        <button class="btn btn-danger" onclick="ProfileScreen._doClearData()">Yes, Delete Everything</button>
        <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
      </div>
    `);
  },

  _doClearData() {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    trips.forEach(t => DB.deleteTrip(t.id));
    App.closeModal();
    App.toast('All trip data cleared', 'info');
    App.rerender();
  }
};
