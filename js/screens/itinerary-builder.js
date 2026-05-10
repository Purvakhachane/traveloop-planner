/* ============================================================
   TRAVELOOP – Itinerary Builder Screen
   ============================================================ */

const ItineraryBuilderScreen = {
  _tripId: null,
  _expandedStop: null,

  async render(tripId) {
    const trips = await API.getTrips();
    this._tripId = tripId || trips[0]?.id || null;

    if (!this._tripId) return `
      <div class="empty-state">
        <div class="empty-state-icon">🗺️</div>
        <div class="empty-state-title">No Trip Selected</div>
        <div class="empty-state-desc">Create a trip first to start building your itinerary.</div>
        <button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Create a Trip</button>
      </div>`;

    const trip = await API.getTrip(this._tripId);
    const stops = trip.stops || [];

    return `
    <div>
      <div class="page-header flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <h1>🏗️ Itinerary <span class="text-gradient">Builder</span></h1>
          <p>Build your day-by-day trip plan</p>
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-ghost" onclick="App.navigate('create-trip', '${this._tripId}')">✏️ Edit Trip</button>
          <button class="btn btn-primary" onclick="App.navigate('itinerary-view', '${this._tripId}')">👁️ Preview</button>
        </div>
      </div>

      <!-- Trip Selector -->
      <div class="trip-selector">
        <label>✈️ Trip:</label>
        <select class="form-input" onchange="ItineraryBuilderScreen.switchTrip(this.value)" style="max-width:300px;">
          ${trips.map(t => `<option value="${t.id}" ${t.id===this._tripId?'selected':''}>${t.name}</option>`).join('')}
        </select>
        <span class="badge badge-blue">📍 ${stops.length} stop${stops.length!==1?'s':''}</span>
        ${trip?.startDate ? `<span class="badge badge-grey">📅 ${this._fmtDate(trip.startDate)} – ${this._fmtDate(trip.endDate)}</span>` : ''}
      </div>

      <div class="builder-layout">
        <!-- Stops List -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="font-size:17px;">📍 Trip Stops</h3>
            <button class="btn btn-primary btn-sm" onclick="ItineraryBuilderScreen.openAddStop()">+ Add Stop</button>
          </div>
          <div id="stops-list">
            ${stops.length === 0 ? `
              <div class="empty-state" style="padding:48px;">
                <div class="empty-state-icon">📍</div>
                <div class="empty-state-title">No stops yet</div>
                <div class="empty-state-desc">Add your first city stop to start building your itinerary.</div>
                <button class="btn btn-primary" onclick="ItineraryBuilderScreen.openAddStop()" style="margin-top:16px;">Add First Stop</button>
              </div>
            ` : stops.map((stop, i) => this._renderStopCard(stop, i)).join('')}
          </div>
        </div>

        <!-- Sidebar Panel -->
        <div>
          <div class="card card-glow" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px; font-size:16px;">📊 Trip Summary</h3>
            ${trip ? `
              <div style="display:flex; flex-direction:column; gap:10px; font-size:14px; color:var(--text-secondary);">
                <div style="display:flex; justify-content:space-between;">
                  <span>Total Cities:</span>
                  <strong style="color:var(--text-primary);">${stops.length}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Total Activities:</span>
                  <strong style="color:var(--text-primary);">${stops.reduce((s,st)=>s+(st.activities?.length||0),0)}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Activities Cost:</span>
                  <strong style="color:var(--accent-green);">$${stops.reduce((s,st)=>s+(st.activities||[]).reduce((a,ac)=>a+ac.cost,0),0)}</strong>
                </div>
                ${trip.budget ? `
                <div style="border-top:1px solid var(--border-glass); padding-top:10px; display:flex; justify-content:space-between;">
                  <span>Budget:</span>
                  <strong style="color:var(--accent-primary);">$${trip.budget.toLocaleString()}</strong>
                </div>` : ''}
              </div>
            ` : ''}
          </div>

          <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:14px; font-size:16px;">⚡ Quick Add City</h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${CITIES_DATA.slice(0,6).map(city => `
                <button class="btn btn-ghost btn-sm" style="justify-content:flex-start; gap:10px;"
                  onclick="ItineraryBuilderScreen.quickAddCity('${city.id}')">
                  ${city.flag} ${city.name}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <button class="btn btn-ghost" onclick="App.navigate('budget', '${this._tripId}')">💰 Budget Breakdown</button>
            <button class="btn btn-ghost" onclick="App.navigate('packing', '${this._tripId}')">🎒 Packing List</button>
            <button class="btn btn-ghost" onclick="App.navigate('notes', '${this._tripId}')">📝 Trip Notes</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  _renderStopCard(stop, index) {
    const isExpanded = this._expandedStop === stop.id;
    const activities = stop.activities || [];
    return `
    <div class="stop-card" id="stop-${stop.id}">
      <div class="stop-card-header" onclick="ItineraryBuilderScreen.toggleStop('${stop.id}')">
        <div class="stop-number">${index + 1}</div>
        <div style="flex:1;">
          <div class="stop-name">${stop.flag || '📍'} ${stop.city}, ${stop.country}</div>
          <div class="stop-dates">${this._fmtDate(stop.startDate)} → ${this._fmtDate(stop.endDate)} · ${activities.length} activities</div>
        </div>
        <span style="color:var(--text-muted); font-size:12px;">${isExpanded ? '▲' : '▼'}</span>
        <button class="btn btn-danger btn-sm btn-icon" onclick="event.stopPropagation();ItineraryBuilderScreen.deleteStop('${stop.id}')" title="Remove stop">✕</button>
      </div>
      ${isExpanded ? `
      <div class="stop-body">
        <div class="stop-activities-list" id="activities-${stop.id}">
          ${activities.length === 0
            ? `<p style="color:var(--text-muted); font-size:14px; text-align:center; padding:16px;">No activities yet</p>`
            : activities.map(act => `
            <div class="stop-activity-item">
              <span>${act.icon || '🎯'}</span>
              <span style="flex:1;">${act.name}</span>
              <span class="badge badge-grey">${act.type}</span>
              <span style="color:var(--accent-green); font-weight:600; font-size:13px;">$${act.cost}</span>
              <span class="stop-activity-remove" onclick="ItineraryBuilderScreen.removeActivity('${stop.id}','${act.id}')">✕</span>
            </div>`).join('')}
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="ItineraryBuilderScreen.openAddActivity('${stop.id}')">+ Add Activity</button>
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('activity-search', '${this._tripId}')">🔍 Browse Activities</button>
        </div>
      </div>` : ''}
    </div>`;
  },

  toggleStop(id) {
    this._expandedStop = this._expandedStop === id ? null : id;
    App.rerender();
  },

  switchTrip(id) { this._tripId = id; App.rerender(); },

  quickAddCity(cityId) {
    const city = CITIES_DATA.find(c => c.id === cityId);
    if (!city) return;
    this._addStop(city);
  },

  openAddStop() {
    App.openModal(`
      <h2 style="margin-bottom:24px;">📍 Add City Stop</h2>
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="form-group">
          <label class="form-label">Select City</label>
          <select class="form-input" id="modal-city">
            <option value="">Choose a city...</option>
            ${CITIES_DATA.map(c => `<option value="${c.id}">${c.flag} ${c.name}, ${c.country}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Arrival Date</label>
            <input type="date" class="form-input" id="modal-stop-start" />
          </div>
          <div class="form-group">
            <label class="form-label">Departure Date</label>
            <input type="date" class="form-input" id="modal-stop-end" />
          </div>
        </div>
        <div style="display:flex; gap:12px; margin-top:8px;">
          <button class="btn btn-primary" onclick="ItineraryBuilderScreen.saveStop()">Add Stop ✓</button>
          <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
        </div>
      </div>
    `);
  },

  saveStop() {
    const cityId = document.getElementById('modal-city').value;
    const startDate = document.getElementById('modal-stop-start').value;
    const endDate = document.getElementById('modal-stop-end').value;
    if (!cityId) { App.toast('Please select a city', 'error'); return; }
    const city = CITIES_DATA.find(c => c.id === cityId);
    this._addStop(city, startDate, endDate);
    App.closeModal();
  },

  async _addStop(city, startDate='', endDate='') {
    const trip = await API.getTrip(this._tripId);
    const stops = trip.stops || [];
    
    stops.push({
      city: city.name, country: city.country, flag: city.flag,
      startDate, endDate, activities: []
    });

    try {
      await API.saveItinerary(this._tripId, stops);
      App.toast(`${city.flag} ${city.name} added!`, 'success');
      App.rerender();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async deleteStop(id) {
    const trip = await API.getTrip(this._tripId);
    const stops = (trip.stops || []).filter(s => String(s.id) !== String(id));
    
    try {
      await API.saveItinerary(this._tripId, stops);
      App.toast('Stop removed', 'info');
      App.rerender();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async openAddActivity(stopId) {
    const trip = await API.getTrip(this._tripId);
    const stop = (trip.stops || []).find(s => s.id === stopId);
    const cityActivities = ACTIVITIES_DATA.filter(a => {
      const city = CITIES_DATA.find(c => c.name === stop?.city);
      return city && a.cityId === city.id;
    });
    const allActivities = cityActivities.length > 0 ? cityActivities : ACTIVITIES_DATA.slice(0, 8);
    App.openModal(`
      <h2 style="margin-bottom:24px;">🎯 Add Activity – ${stop?.city}</h2>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${allActivities.map(act => `
          <div class="activity-card" style="cursor:pointer;" onclick="ItineraryBuilderScreen.addActivity('${stopId}', '${act.id}')">
            <div class="activity-icon" style="background:rgba(79,172,254,0.1);">${act.icon}</div>
            <div class="activity-info">
              <div class="activity-name">${act.name}</div>
              <div class="activity-meta">
                <span class="badge badge-grey">${act.type}</span>
                <span>⏱ ${act.duration}</span>
                <span style="color:var(--accent-green); font-weight:600;">$${act.cost}</span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm">+ Add</button>
          </div>
        `).join('')}
        <div style="border-top:1px solid var(--border-glass); padding-top:16px; margin-top:8px;">
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">Add a custom activity:</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <input type="text" class="form-input" id="custom-act-name" placeholder="Activity name" style="flex:1; min-width:140px;" />
            <input type="number" class="form-input" id="custom-act-cost" placeholder="Cost $" style="width:90px;" min="0" />
            <button class="btn btn-green btn-sm" onclick="ItineraryBuilderScreen.addCustomActivity('${stopId}')">Add</button>
          </div>
        </div>
      </div>
    `);
  },

  async addActivity(stopId, actId) {
    const act = ACTIVITIES_DATA.find(a => a.id === actId);
    const trip = await API.getTrip(this._tripId);
    const stops = trip.stops || [];
    const stop = stops.find(s => String(s.id) === String(stopId));
    
    if (!stop || !act) return;
    stop.activities.push({ name: act.name, type: act.type, cost: act.cost, icon: act.icon, duration: act.duration });
    
    try {
      await API.saveItinerary(this._tripId, stops);
      App.closeModal();
      App.toast(`${act.icon} ${act.name} added!`, 'success');
      App.rerender();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async addCustomActivity(stopId) {
    const name = document.getElementById('custom-act-name').value.trim();
    const cost = parseFloat(document.getElementById('custom-act-cost').value) || 0;
    if (!name) { App.toast('Enter activity name', 'error'); return; }
    
    const trip = await API.getTrip(this._tripId);
    const stops = trip.stops || [];
    const stop = stops.find(s => String(s.id) === String(stopId));
    if (!stop) return;
    
    stop.activities.push({ name, type: 'Custom', cost, icon: '🎯', duration: '2h' });
    
    try {
      await API.saveItinerary(this._tripId, stops);
      App.closeModal();
      App.toast(`🎯 ${name} added!`, 'success');
      App.rerender();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  async removeActivity(stopId, actId) {
    const trip = await API.getTrip(this._tripId);
    const stops = trip.stops || [];
    const stop = stops.find(s => String(s.id) === String(stopId));
    if (!stop) return;
    stop.activities = (stop.activities || []).filter(a => String(a.id) !== String(actId));
    
    try {
      await API.saveItinerary(this._tripId, stops);
      App.rerender();
    } catch (err) {
      App.toast(err.message, 'error');
    }
  },

  _fmtDate(d) {
    if (!d) return 'TBD';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};
