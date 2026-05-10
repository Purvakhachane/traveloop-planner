/* ============================================================
   TRAVELOOP – Admin / Analytics Dashboard Screen
   ============================================================ */

const AdminScreen = {
  render() {
    const allTrips = DB.getTrips();
    const allUsers = DB.getUsers();
    const allStops = DB.getStops();
    const totalActivities = allStops.reduce((s, st) => s + (st.activities || []).length, 0);
    const totalBudget = allTrips.reduce((s, t) => s + (t.budget || 0), 0);
    const avgBudget = allTrips.length > 0 ? Math.round(totalBudget / allTrips.length) : 0;
    const publicTrips = allTrips.filter(t => t.isPublic).length;
    const completedTrips = allTrips.filter(t => t.status === 'completed').length;

    // City popularity from stops
    const cityCount = {};
    allStops.forEach(s => { if (s.city) cityCount[s.city] = (cityCount[s.city] || 0) + 1; });
    const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // Activity type distribution
    const typeCount = {};
    allStops.forEach(s => (s.activities || []).forEach(a => {
      typeCount[a.type] = (typeCount[a.type] || 0) + 1;
    }));
    const topTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // Status distribution
    const statusCount = { planning: 0, upcoming: 0, completed: 0 };
    allTrips.forEach(t => { const k = t.status || 'planning'; statusCount[k] = (statusCount[k] || 0) + 1; });

    return `
    <div>
      <div class="page-header flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <h1>📊 Analytics <span class="text-gradient">Dashboard</span></h1>
          <p style="display:flex; align-items:center; gap:8px;">Platform insights & usage statistics &nbsp;<span class="live-dot"></span>&nbsp; Live</p>
        </div>
        <span class="badge badge-purple">👑 Admin View</span>
      </div>

      <!-- Primary Stats Row -->
      <div class="admin-stats-row" style="margin-bottom:20px;">
        <div class="stat-card blue">
          <div class="stat-icon">👥</div>
          <div class="stat-value text-gradient">${allUsers.length}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card coral">
          <div class="stat-icon">🗺️</div>
          <div class="stat-value text-gradient-sunset">${allTrips.length}</div>
          <div class="stat-label">Total Trips</div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">📍</div>
          <div class="stat-value" style="background:var(--gradient-purple);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${allStops.length}</div>
          <div class="stat-label">City Stops</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">💰</div>
          <div class="stat-value" style="background:var(--gradient-green);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">$${(totalBudget / 1000).toFixed(1)}k</div>
          <div class="stat-label">Total Budget</div>
        </div>
      </div>

      <!-- Secondary Stats Row -->
      <div class="grid-4" style="margin-bottom:28px;">
        <div class="card" style="text-align:center; padding:20px;">
          <div style="font-size:28px; font-weight:800; color:var(--accent-primary); font-family:'Outfit',sans-serif; margin-bottom:4px;">${totalActivities}</div>
          <div style="font-size:13px; color:var(--text-muted);">🎯 Activities Planned</div>
        </div>
        <div class="card" style="text-align:center; padding:20px;">
          <div style="font-size:28px; font-weight:800; color:var(--accent-amber); font-family:'Outfit',sans-serif; margin-bottom:4px;">$${avgBudget.toLocaleString()}</div>
          <div style="font-size:13px; color:var(--text-muted);">💵 Avg Trip Budget</div>
        </div>
        <div class="card" style="text-align:center; padding:20px;">
          <div style="font-size:28px; font-weight:800; color:var(--accent-green); font-family:'Outfit',sans-serif; margin-bottom:4px;">${publicTrips}</div>
          <div style="font-size:13px; color:var(--text-muted);">🌐 Public Trips</div>
        </div>
        <div class="card" style="text-align:center; padding:20px;">
          <div style="font-size:28px; font-weight:800; color:var(--accent-purple); font-family:'Outfit',sans-serif; margin-bottom:4px;">${completedTrips}</div>
          <div style="font-size:13px; color:var(--text-muted);">✅ Trips Completed</div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="admin-charts-row">
        <div class="chart-wrapper">
          <div class="chart-title">📈 Platform Growth (Cumulative Trips)</div>
          <div style="height:230px; position:relative;">
            <canvas id="admin-growth-chart"></canvas>
          </div>
        </div>
        <div class="chart-wrapper">
          <div class="chart-title">🥧 Trip Status Distribution</div>
          <div style="height:230px; position:relative;">
            <canvas id="admin-status-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="admin-charts-row" style="margin-bottom:28px;">
        <div class="chart-wrapper">
          <div class="chart-title">📊 Top Destinations (by stops)</div>
          <div style="height:230px; position:relative;">
            <canvas id="admin-cities-chart"></canvas>
          </div>
        </div>
        <div class="chart-wrapper">
          <div class="chart-title">🎯 Activity Types Distribution</div>
          <div style="height:230px; position:relative;">
            <canvas id="admin-types-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Top Cities Table -->
      <div style="margin-bottom:28px;">
        <div class="section-heading">🏆 Most Popular Destinations Worldwide</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Destination</th>
                <th>Region</th>
                <th>Cost/Day</th>
                <th>Cost Level</th>
                <th>Popularity</th>
              </tr>
            </thead>
            <tbody>
              ${CITIES_DATA.sort((a, b) => b.popularity - a.popularity).slice(0, 10).map((city, i) => {
                const costColors = { Low: 'badge-green', Medium: 'badge-amber', High: 'badge-coral' };
                return `
                <tr>
                  <td>
                    <strong style="color:${i === 0 ? 'var(--accent-amber)' : i === 1 ? 'var(--text-secondary)' : i === 2 ? 'var(--accent-coral)' : 'var(--text-muted)'}; font-size:16px;">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}</strong>
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-size:22px;">${city.flag}</span>
                      <div>
                        <div style="font-weight:700; color:var(--text-primary);">${city.name}</div>
                        <div style="font-size:12px; color:var(--text-muted);">${city.country}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-grey">${city.region}</span></td>
                  <td style="color:var(--accent-green); font-weight:600;">$${city.avgCostPerDay}/day</td>
                  <td><span class="badge ${costColors[city.costIndex] || 'badge-grey'}">${city.costIndex}</span></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div class="progress-bar" style="width:100px;">
                        <div class="progress-fill" style="width:${city.popularity}%;"></div>
                      </div>
                      <span style="font-size:13px; font-weight:600; color:var(--accent-primary);">${city.popularity}%</span>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Activities Table -->
      <div style="margin-bottom:28px;">
        <div class="section-heading">🎯 Featured Activities</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Type</th>
                <th>City</th>
                <th>Duration</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              ${ACTIVITIES_DATA.slice(0, 8).map(act => {
                const city = CITIES_DATA.find(c => c.id === act.cityId);
                const typeColors = { Sightseeing: 'badge-blue', Culture: 'badge-purple', Food: 'badge-coral', Adventure: 'badge-green', Nature: 'badge-green', Experience: 'badge-amber', History: 'badge-amber' };
                return `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <span style="font-size:20px;">${act.icon}</span>
                      <strong style="color:var(--text-primary);">${act.name}</strong>
                    </div>
                  </td>
                  <td><span class="badge ${typeColors[act.type] || 'badge-grey'}">${act.type}</span></td>
                  <td>${city ? city.flag + ' ' + city.name : '–'}</td>
                  <td style="color:var(--text-secondary);">⏱ ${act.duration}</td>
                  <td style="color:${act.cost === 0 ? 'var(--accent-green)' : 'var(--text-primary)'}; font-weight:600;">${act.cost === 0 ? 'Free' : '$' + act.cost}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users Table -->
      <div>
        <div class="section-heading">👥 User Management</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Trips</th>
                <th>Cities</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allUsers.map(u => {
                const userTrips = DB.getUserTrips(u.id);
                const userStops = userTrips.flatMap(t => DB.getTripStops(t.id));
                return `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <div style="width:36px; height:36px; background:var(--gradient-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0;">${u.name ? u.name[0].toUpperCase() : 'U'}</div>
                      <strong style="color:var(--text-primary);">${u.name}</strong>
                    </div>
                  </td>
                  <td style="color:var(--text-secondary);">${u.email}</td>
                  <td><span class="badge badge-blue">${userTrips.length} trips</span></td>
                  <td><span class="badge badge-purple">${userStops.length} cities</span></td>
                  <td style="color:var(--text-muted);">${new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td><span class="badge badge-green" style="display:inline-flex; align-items:center; gap:5px;"><span class="live-dot" style="width:6px;height:6px;"></span> Active</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  },

  afterRender() {
    try {
      const allTrips = DB.getTrips();
      const allStops = DB.getStops();

      // City count for bar chart
      const cityCount = {};
      allStops.forEach(s => { if (s.city) cityCount[s.city] = (cityCount[s.city] || 0) + 1; });
      const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

      // Activity type count for pie chart
      const typeCount = {};
      allStops.forEach(s => (s.activities || []).forEach(a => {
        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
      }));
      const topTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

      // Status distribution
      const statusCount = { planning: 0, upcoming: 0, completed: 0 };
      allTrips.forEach(t => { const k = t.status || 'planning'; statusCount[k] = (statusCount[k] || 0) + 1; });

      // 1. Growth line chart (simulated)
      Charts.line('admin-growth-chart',
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        [{
          label: 'Cumulative Trips',
          data: [2, 5, 8, 12, 18, 24, 31, 38, 44, 52, 60, 72],
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79,172,254,0.1)',
          borderWidth: 2, tension: 0.4, fill: true,
          pointBackgroundColor: '#4facfe',
        }]
      );

      // 2. Status pie chart
      Charts.pie('admin-status-chart',
        ['Planning', 'Upcoming', 'Completed'],
        [
          statusCount.planning || 1,
          statusCount.upcoming || 1,
          statusCount.completed || 1
        ],
        ['#fda085', '#4facfe', '#43e97b']
      );

      // 3. Cities bar chart
      if (topCities.length > 0) {
        Charts.bar('admin-cities-chart',
          topCities.map(c => c[0]),
          [Charts.makeBarDataset('Times Added', topCities.map(c => c[1]), 'rgb(79,172,254)')]
        );
      } else {
        // Use sample CITIES_DATA for demo
        const sample = CITIES_DATA.slice(0, 6);
        Charts.bar('admin-cities-chart',
          sample.map(c => c.name),
          [Charts.makeBarDataset('Popularity Score', sample.map(c => Math.round(c.popularity)), 'rgb(79,172,254)')]
        );
      }

      // 4. Activity types pie chart
      if (topTypes.length > 0) {
        Charts.pie('admin-types-chart',
          topTypes.map(t => t[0]),
          topTypes.map(t => t[1]),
          ['#4facfe', '#f7797d', '#43e97b', '#a855f7', '#fda085', '#00f2fe']
        );
      } else {
        // Demo data
        Charts.pie('admin-types-chart',
          ['Sightseeing', 'Culture', 'Food', 'Adventure', 'Nature', 'Experience'],
          [8, 6, 5, 4, 3, 2],
          ['#4facfe', '#f7797d', '#43e97b', '#a855f7', '#fda085', '#00f2fe']
        );
      }
    } catch (err) {
      console.warn('Admin charts error:', err);
    }
  }
};
