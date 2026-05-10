/* ============================================================
   TRAVELOOP – Activity Search Screen
   ============================================================ */

const ActivitySearchScreen = {
  _query: '',
  _type: 'All',
  _maxCost: 999,

  render() {
    const types = ['All', 'Sightseeing', 'Culture', 'Food', 'Adventure', 'Nature', 'Experience', 'History', 'Architecture', 'Tour'];
    const filtered = this._getFiltered();

    return `
    <div>
      <div class="page-header">
        <h1>🎯 Browse <span class="text-gradient">Activities</span></h1>
        <p>Discover ${ACTIVITIES_DATA.length} amazing experiences across ${CITIES_DATA.length} cities</p>
      </div>

      <!-- Search & Filters -->
      <div class="activity-filters-bar">
        <div class="search-bar" style="flex:1; max-width:380px;">
          <span class="search-bar-icon">🔍</span>
          <input type="text" placeholder="Search activities..." id="act-search"
            oninput="ActivitySearchScreen.setQuery(this.value)" value="${this._query}" />
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:14px; color:var(--text-secondary);">
          Max Cost: <strong style="color:var(--accent-primary);">$${this._maxCost >= 999 ? '∞' : this._maxCost}</strong>
          <input type="range" min="0" max="200" step="10"
            value="${this._maxCost >= 999 ? 200 : this._maxCost}"
            oninput="ActivitySearchScreen.setCost(this.value)"
            style="width:120px; accent-color:var(--accent-primary);" />
        </div>
      </div>

      <!-- Type Filters -->
      <div class="filter-chips" style="margin-bottom:24px;">
        ${types.map(t => `<button class="filter-chip ${this._type===t?'active':''}" onclick="ActivitySearchScreen.setType('${t}')">${t}</button>`).join('')}
      </div>

      <div style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">${filtered.length} activit${filtered.length!==1?'ies':'y'} found</div>

      <!-- Activities List -->
      <div class="activities-list" id="activities-list">
        ${this._renderList(filtered)}
      </div>
    </div>`;
  },

  _renderList(activities) {
    if (activities.length === 0) return `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-title">No activities found</div>
        <div class="empty-state-desc">Try adjusting your filters.</div>
      </div>`;
    return activities.map(act => {
      const city = CITIES_DATA.find(c => c.id === act.cityId);
      const typeColors = { Sightseeing:'badge-blue', Culture:'badge-purple', Food:'badge-coral', Adventure:'badge-green', Nature:'badge-green', Experience:'badge-amber', History:'badge-amber', Architecture:'badge-purple' };
      return `
      <div class="activity-card">
        <div class="activity-icon" style="background:rgba(79,172,254,0.1);">${act.icon}</div>
        <div class="activity-info">
          <div class="activity-name">${act.name}</div>
          <div class="activity-meta">
            <span class="badge ${typeColors[act.type] || 'badge-grey'}">${act.type}</span>
            ${city ? `<span>${city.flag} ${city.name}</span>` : ''}
            <span>⏱ ${act.duration}</span>
          </div>
          ${act.description ? `<p style="font-size:13px; color:var(--text-muted); margin-top:6px; line-height:1.5;">${act.description}</p>` : ''}
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="font-size:20px; font-weight:800; font-family:'Outfit',sans-serif; color:${act.cost===0?'var(--accent-green)':'var(--text-primary)'};">${act.cost===0?'Free':'$'+act.cost}</div>
          <button class="btn btn-primary btn-sm" style="margin-top:8px;" onclick="ActivitySearchScreen.addToTrip('${act.id}')">+ Add to Trip</button>
        </div>
      </div>`;
    }).join('');
  },

  _getFiltered() {
    let result = [...ACTIVITIES_DATA];
    if (this._query) {
      const q = this._query.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || (a.description||'').toLowerCase().includes(q));
    }
    if (this._type !== 'All') result = result.filter(a => a.type === this._type);
    if (this._maxCost < 999) result = result.filter(a => a.cost <= this._maxCost);
    return result;
  },

  setQuery(v) { this._query = v; this._refresh(); },
  setType(t) { this._type = t; App.rerender(); },
  setCost(v) { this._maxCost = parseInt(v) >= 200 ? 999 : parseInt(v); this._refresh(); },
  _refresh() {
    const el = document.getElementById('activities-list');
    if (el) el.innerHTML = this._renderList(this._getFiltered());
  },

  addToTrip(actId) {
    const act = ACTIVITIES_DATA.find(a => a.id === actId);
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    if (!act || trips.length === 0) { App.toast('Create a trip first!', 'info'); return; }

    // Choose trip and stop
    const stops = trips.flatMap(t => DB.getTripStops(t.id).map(s => ({ ...s, tripName: t.name })));
    if (stops.length === 0) { App.toast('Add cities to your trip first!', 'info'); App.navigate('itinerary-builder'); return; }

    App.openModal(`
      <h2 style="margin-bottom:8px;">Add ${act.icon} ${act.name}</h2>
      <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">Select a trip stop to add this activity:</p>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${stops.map(s => `
          <button class="btn btn-ghost" style="justify-content:flex-start; gap:10px;" onclick="ActivitySearchScreen._doAdd('${actId}','${s.id}')">
            ${s.flag||'📍'} ${s.city} <span style="color:var(--text-muted); font-size:12px;">(${s.tripName})</span>
          </button>`).join('')}
      </div>
    `);
  },

  async _doAdd(actId, stopId) {
    const act = ACTIVITIES_DATA.find(a => a.id === actId);
    if (!act) return;

    try {
      // Find which trip this stop belongs to
      const trips = await API.getTrips();
      let targetTrip = null;
      let stopFound = null;

      for (const t of trips) {
        const fullTrip = await API.getTrip(t.id);
        const stops = fullTrip.stops || [];
        const stop = stops.find(s => String(s.id) === String(stopId));
        if (stop) {
          targetTrip = fullTrip;
          stopFound = stop;
          break;
        }
      }

      if (!targetTrip || !stopFound) {
        App.toast('Could not find stop', 'error');
        return;
      }

      if ((stopFound.activities || []).find(a => a.name === act.name)) {
        App.toast('Already added to this stop', 'info');
        App.closeModal();
        return;
      }

      stopFound.activities = [...(stopFound.activities || []), { 
        name: act.name, type: act.type, cost: act.cost, icon: act.icon, duration: act.duration 
      }];
      
      await API.saveItinerary(targetTrip.id, targetTrip.stops);
      App.closeModal();
      App.toast(`${act.icon} ${act.name} added to ${stopFound.city}!`, 'success');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  }
};
