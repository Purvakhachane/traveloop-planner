/* ============================================================
   TRAVELOOP – Itinerary View Screen
   ============================================================ */

const ItineraryViewScreen = {
  _tripId: null,
  _viewMode: 'timeline', // 'timeline' | 'list'

  render(tripId) {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    this._tripId = tripId || trips[0]?.id || null;

    if (!this._tripId) return `<div class="empty-state"><div class="empty-state-icon">🗺️</div><div class="empty-state-title">No trips found</div><button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Create a Trip</button></div>`;

    const trip = DB.getTrip(this._tripId);
    const stops = DB.getTripStops(this._tripId);
    const totalCost = stops.reduce((s, st) => s + (st.activities || []).reduce((a, ac) => a + ac.cost, 0), 0);
    const totalActivities = stops.reduce((s, st) => s + (st.activities || []).length, 0);

    return `
    <div>
      <!-- Trip Selector -->
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px; flex-wrap:wrap;">
        <select class="form-input" onchange="ItineraryViewScreen.switchTrip(this.value)" style="max-width:280px;">
          ${trips.map(t => `<option value="${t.id}" ${t.id===this._tripId?'selected':''}>${t.emoji||'✈️'} ${t.name}</option>`).join('')}
        </select>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('itinerary-builder', '${this._tripId}')">✏️ Edit Itinerary</button>
        ${trip?.isPublic ? `<button class="btn btn-green btn-sm" onclick="App.navigate('shared', '${this._tripId}')">🌐 Share</button>` : ''}
      </div>

      <!-- Header -->
      <div class="itinerary-view-header">
        <div style="font-size:56px; margin-bottom:12px; position:relative;">${trip?.emoji || '✈️'}</div>
        <div class="itinerary-view-title">${trip?.name || 'Trip'}</div>
        <div class="itinerary-view-meta">
          📅 ${this._fmtRange(trip?.startDate, trip?.endDate)} &nbsp;·&nbsp;
          📍 ${stops.length} ${stops.length===1?'city':'cities'} &nbsp;·&nbsp;
          🎯 ${totalActivities} activities &nbsp;·&nbsp;
          💰 $${totalCost.toLocaleString()} planned
        </div>
        <div class="view-controls">
          <div class="tabs">
            <button class="tab-btn ${this._viewMode==='timeline'?'active':''}" onclick="ItineraryViewScreen.setView('timeline')">📅 Timeline</button>
            <button class="tab-btn ${this._viewMode==='list'?'active':''}" onclick="ItineraryViewScreen.setView('list')">📋 List</button>
          </div>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('budget', '${this._tripId}')">💰 Budget</button>
        </div>
      </div>

      <!-- Content -->
      ${this._viewMode === 'timeline' ? this._renderTimeline(stops) : this._renderList(stops)}

      <!-- Bottom Actions -->
      <div style="display:flex; gap:12px; margin-top:28px; flex-wrap:wrap;">
        <button class="btn btn-ghost" onclick="App.navigate('packing', '${this._tripId}')">🎒 Packing List</button>
        <button class="btn btn-ghost" onclick="App.navigate('notes', '${this._tripId}')">📝 Trip Notes</button>
        <button class="btn btn-ghost" onclick="App.navigate('budget', '${this._tripId}')">💰 Budget</button>
        ${trip?.isPublic ? `<button class="btn btn-green" onclick="App.navigate('shared', '${this._tripId}')">🌐 Share Trip</button>` : ''}
      </div>
    </div>`;
  },

  _renderTimeline(stops) {
    if (stops.length === 0) return `<div class="empty-state"><div class="empty-state-icon">📍</div><div class="empty-state-title">No stops added</div><button class="btn btn-primary" onclick="App.navigate('itinerary-builder', '${this._tripId}')" style="margin-top:16px;">Add Stops</button></div>`;
    return `
    <div class="timeline">
      ${stops.map((stop, i) => `
        <div class="timeline-item">
          <div class="timeline-dot" title="Stop ${i+1}">${stop.flag || '📍'}</div>
          <div class="timeline-content">
            <div class="day-group">
              <div class="day-group-header">
                <div class="day-number-badge">${i + 1}</div>
                <div>
                  <strong>${stop.city}, ${stop.country}</strong>
                  <span style="color:var(--text-muted); font-weight:400; margin-left:10px; font-size:13px;">
                    ${this._fmtDate(stop.startDate)} → ${this._fmtDate(stop.endDate)}
                  </span>
                </div>
                <span class="badge badge-grey" style="margin-left:auto;">${(stop.activities||[]).length} activities</span>
              </div>
              <div class="day-group-body">
                ${(stop.activities || []).length === 0
                  ? `<p style="color:var(--text-muted); font-size:14px; text-align:center; padding:12px;">No activities planned for this stop.</p>`
                  : (stop.activities || []).map(act => `
                    <div class="day-activity-block">
                      <div class="day-activity-icon" style="background:rgba(79,172,254,0.1);">${act.icon}</div>
                      <div class="day-activity-info">
                        <div class="day-activity-name">${act.name}</div>
                        <div class="day-activity-detail">
                          <span class="badge badge-grey">${act.type}</span>
                          ${act.duration ? `<span style="color:var(--text-muted);">⏱ ${act.duration}</span>` : ''}
                        </div>
                      </div>
                      <div class="day-activity-cost">$${act.cost}</div>
                    </div>`).join('')}
                <div style="display:flex; justify-content:flex-end; margin-top:8px; font-size:13px; color:var(--text-muted);">
                  Stop total: <strong style="color:var(--accent-green); margin-left:6px;">$${(stop.activities||[]).reduce((s,a)=>s+a.cost,0)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
  },

  _renderList(stops) {
    if (stops.length === 0) return `<div class="empty-state"><div class="empty-state-icon">📍</div><div class="empty-state-title">No stops added</div></div>`;
    return `
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${stops.map((stop, i) => `
        <div class="card">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px;">
            <span style="font-size:28px;">${stop.flag || '📍'}</span>
            <div>
              <div style="font-size:18px; font-weight:700;">${stop.city}, ${stop.country}</div>
              <div style="font-size:13px; color:var(--text-muted);">${this._fmtDate(stop.startDate)} → ${this._fmtDate(stop.endDate)}</div>
            </div>
            <div style="margin-left:auto; text-align:right;">
              <div style="font-size:20px; font-weight:800; color:var(--accent-green); font-family:'Outfit',sans-serif;">$${(stop.activities||[]).reduce((s,a)=>s+a.cost,0)}</div>
              <div style="font-size:12px; color:var(--text-muted);">${(stop.activities||[]).length} activities</div>
            </div>
          </div>
          ${(stop.activities||[]).length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${(stop.activities||[]).map(act => `
                <div style="display:flex; align-items:center; gap:10px; padding:8px 10px; background:rgba(255,255,255,0.03); border-radius:8px; font-size:14px;">
                  <span>${act.icon}</span>
                  <span style="flex:1;">${act.name}</span>
                  <span class="badge badge-grey">${act.type}</span>
                  <span style="color:var(--accent-green); font-weight:600;">$${act.cost}</span>
                </div>`).join('')}
            </div>
          ` : `<p style="color:var(--text-muted); font-size:14px;">No activities planned.</p>`}
        </div>
      `).join('')}
    </div>`;
  },

  setView(mode) { this._viewMode = mode; App.rerender(); },
  switchTrip(id) { this._tripId = id; App.rerender(); },
  _fmtDate(d) { if (!d) return 'TBD'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); },
  _fmtRange(s, e) {
    if (!s) return 'No dates'; 
    const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
  }
};
