/* ============================================================
   TRAVELOOP – My Trips Screen
   ============================================================ */

const TripsScreen = {
  _filter: 'all',
  _search: '',

  render() {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);

    return `
    <div>
      <div class="page-header flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <h1>🗺️ My <span class="text-gradient">Trips</span></h1>
          <p>${trips.length} trip${trips.length !== 1 ? 's' : ''} planned</p>
        </div>
        <button class="btn btn-primary" onclick="App.navigate('create-trip')">✈️ Plan New Trip</button>
      </div>

      <!-- Toolbar -->
      <div class="trips-toolbar">
        <div class="search-bar" style="flex:1; max-width:380px;">
          <span class="search-bar-icon">🔍</span>
          <input type="text" placeholder="Search trips..." id="trips-search"
            oninput="TripsScreen.setSearch(this.value)"
            value="${this._search}" />
        </div>
        <div class="filter-chips">
          <button class="filter-chip ${this._filter==='all'?'active':''}" onclick="TripsScreen.setFilter('all')">All</button>
          <button class="filter-chip ${this._filter==='planning'?'active':''}" onclick="TripsScreen.setFilter('planning')">Planning</button>
          <button class="filter-chip ${this._filter==='upcoming'?'active':''}" onclick="TripsScreen.setFilter('upcoming')">Upcoming</button>
          <button class="filter-chip ${this._filter==='completed'?'active':''}" onclick="TripsScreen.setFilter('completed')">Completed</button>
        </div>
      </div>

      <!-- Trips Grid -->
      <div class="trips-grid" id="trips-grid">
        ${this._renderGrid(trips)}
      </div>
    </div>`;
  },

  _renderGrid(trips) {
    let filtered = trips;
    if (this._filter !== 'all') filtered = filtered.filter(t => t.status === this._filter);
    if (this._search) {
      const q = this._search.toLowerCase();
      filtered = filtered.filter(t => t.name.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q));
    }
    if (filtered.length === 0) return `
      <div class="empty-state" style="grid-column:1/-1; padding:60px;">
        <div class="empty-state-icon">🧳</div>
        <div class="empty-state-title">No trips found</div>
        <div class="empty-state-desc">Try adjusting your filters or create a new trip.</div>
        <button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Plan a Trip</button>
      </div>`;
    return filtered.map(trip => this._renderCard(trip)).join('');
  },

  _renderCard(trip) {
    const stops = DB.getTripStops(trip.id);
    const statusColors = { upcoming: 'badge-blue', completed: 'badge-green', planning: 'badge-amber' };
    const coverGradients = ['trip-cover-1','trip-cover-2','trip-cover-3','trip-cover-4','trip-cover-5','trip-cover-6'];
    const grad = trip.coverGradient || coverGradients[Math.abs(trip.id.charCodeAt(5)%6)];
    return `
    <div class="trip-card">
      <div class="trip-card-cover">
        <div class="trip-card-cover-gradient ${grad}">${trip.emoji || '✈️'}</div>
        <div class="trip-card-status">
          <span class="badge ${statusColors[trip.status] || 'badge-grey'}">${trip.status || 'planning'}</span>
        </div>
        ${trip.isPublic ? '<div style="position:absolute;top:12px;left:12px;"><span class="public-badge">🌐 Public</span></div>' : ''}
      </div>
      <div class="trip-card-body">
        <div class="trip-card-name" title="${trip.name}">${trip.name}</div>
        <div class="trip-card-meta">
          <span>📅 ${this._fmtRange(trip.startDate, trip.endDate)}</span>
          <span>📍 ${stops.length} city${stops.length !== 1 ? 's' : ''}</span>
          ${trip.budget ? `<span>💰 $${trip.budget.toLocaleString()}</span>` : ''}
        </div>
        ${trip.description ? `<p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${trip.description}</p>` : ''}
        <div class="trip-card-actions">
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('itinerary-builder', '${trip.id}')">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('budget', '${trip.id}')">💰 Budget</button>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('itinerary-view', '${trip.id}')">👁️ View</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="TripsScreen.deleteTrip('${trip.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    </div>`;
  },

  setFilter(f) {
    this._filter = f;
    App.rerender();
  },
  setSearch(v) {
    this._search = v;
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    document.getElementById('trips-grid').innerHTML = this._renderGrid(trips);
  },
  deleteTrip(id) {
    const trip = DB.getTrip(id);
    if (!trip) return;
    App.openModal(`
      <h2 style="margin-bottom:16px;">Delete Trip</h2>
      <p style="color:var(--text-secondary); margin-bottom:24px;">Are you sure you want to delete <strong>"${trip.name}"</strong>? This action cannot be undone.</p>
      <div style="display:flex; gap:12px;">
        <button class="btn btn-danger" onclick="TripsScreen._confirmDelete('${id}')">🗑️ Delete</button>
        <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
      </div>
    `);
  },
  _confirmDelete(id) {
    DB.deleteTrip(id);
    App.closeModal();
    App.toast('Trip deleted', 'info');
    App.rerender();
  },
  _fmtRange(start, end) {
    if (!start) return 'No dates';
    const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
  }
};
