/* ============================================================
   TRAVELOOP – City Search Screen
   ============================================================ */

const CitySearchScreen = {
  _query: '',
  _region: 'All',
  _costFilter: 'All',

  render() {
    const regions = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Oceania'];
    const costs = ['All', 'Low', 'Medium', 'High'];
    const filtered = this._getFiltered();

    return `
    <div>
      <div class="page-header">
        <h1>🏙️ Explore <span class="text-gradient">Cities</span></h1>
        <p>Discover ${CITIES_DATA.length} destinations around the world</p>
      </div>

      <!-- Search -->
      <div class="search-bar" style="max-width:480px; margin-bottom:20px;">
        <span class="search-bar-icon">🔍</span>
        <input type="text" placeholder="Search cities or countries..." id="city-search-input"
          oninput="CitySearchScreen.setQuery(this.value)"
          value="${this._query}" />
      </div>

      <!-- Region Filters -->
      <div style="margin-bottom:12px;">
        <div style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:8px; letter-spacing:0.05em; text-transform:uppercase;">Region</div>
        <div class="filter-chips">
          ${regions.map(r => `<button class="filter-chip ${this._region===r?'active':''}" onclick="CitySearchScreen.setRegion('${r}')">${r}</button>`).join('')}
        </div>
      </div>
      <div style="margin-bottom:24px;">
        <div style="font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:8px; letter-spacing:0.05em; text-transform:uppercase;">Budget Level</div>
        <div class="filter-chips">
          ${costs.map(c => `<button class="filter-chip ${this._costFilter===c?'active':''}" onclick="CitySearchScreen.setCost('${c}')">${c}</button>`).join('')}
        </div>
      </div>

      <!-- Results Count -->
      <div style="font-size:14px; color:var(--text-muted); margin-bottom:16px;">${filtered.length} destination${filtered.length!==1?'s':''} found</div>

      <!-- Cities Grid -->
      <div class="cities-grid" id="cities-grid">
        ${filtered.length === 0
          ? `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">🌍</div><div class="empty-state-title">No cities found</div><div class="empty-state-desc">Try a different search or filter.</div></div>`
          : filtered.map(city => this._renderCityCard(city)).join('')}
      </div>
    </div>`;
  },

  _renderCityCard(city) {
    const costColors = { Low: 'badge-green', Medium: 'badge-amber', High: 'badge-coral' };
    const popularityColor = city.popularity >= 90 ? 'var(--accent-green)' : city.popularity >= 80 ? 'var(--accent-amber)' : 'var(--text-muted)';
    return `
    <div class="city-card" onclick="CitySearchScreen.viewCity('${city.id}')">
      <div class="city-card-flag">${city.flag}</div>
      <div class="city-card-body">
        <div class="city-card-name">${city.name}</div>
        <div class="city-card-country">${city.country} · ${city.region}</div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px; line-height:1.5;">${city.description}</p>
        <div class="city-card-stats">
          <span class="badge ${costColors[city.costIndex] || 'badge-grey'}">${city.costIndex} Cost</span>
          <span style="font-size:12px; color:${popularityColor}; font-weight:600;">★ ${city.popularity}%</span>
          <span style="font-size:12px; color:var(--text-muted);">$${city.avgCostPerDay}/day</span>
        </div>
        <button class="btn btn-primary btn-sm" style="width:100%; margin-top:12px;" onclick="event.stopPropagation(); CitySearchScreen.addToTrip('${city.id}')">
          + Add to Trip
        </button>
      </div>
    </div>`;
  },

  _getFiltered() {
    let result = [...CITIES_DATA];
    if (this._query) {
      const q = this._query.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
    }
    if (this._region !== 'All') result = result.filter(c => c.region === this._region);
    if (this._costFilter !== 'All') result = result.filter(c => c.costIndex === this._costFilter);
    return result.sort((a, b) => b.popularity - a.popularity);
  },

  setQuery(v) { this._query = v; document.getElementById('cities-grid').innerHTML = this._getFiltered().map(c => this._renderCityCard(c)).join('') || `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-state-icon">🌍</div><div class="empty-state-title">No cities found</div></div>`; },
  setRegion(r) { this._region = r; App.rerender(); },
  setCost(c) { this._costFilter = c; App.rerender(); },

  viewCity(id) {
    const city = CITIES_DATA.find(c => c.id === id);
    const cityActivities = ACTIVITIES_DATA.filter(a => a.cityId === id);
    if (!city) return;
    App.openModal(`
      <div style="text-align:center; margin-bottom:24px;">
        <div style="font-size:56px; margin-bottom:8px;">${city.flag}</div>
        <h2 style="font-size:26px;">${city.name}</h2>
        <p style="color:var(--text-muted);">${city.country} · ${city.region}</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px; text-align:center;">
        <div style="padding:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-glass);">
          <div style="font-size:22px; font-weight:800; font-family:'Outfit',sans-serif; color:var(--accent-primary);">$${city.avgCostPerDay}</div>
          <div style="font-size:12px; color:var(--text-muted);">Per Day</div>
        </div>
        <div style="padding:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-glass);">
          <div style="font-size:22px; font-weight:800; font-family:'Outfit',sans-serif; color:var(--accent-green);">★${city.popularity}%</div>
          <div style="font-size:12px; color:var(--text-muted);">Popularity</div>
        </div>
        <div style="padding:14px; background:var(--bg-card); border-radius:12px; border:1px solid var(--border-glass);">
          <div style="font-size:22px; font-weight:800; font-family:'Outfit',sans-serif; color:var(--accent-amber);">${city.costIndex}</div>
          <div style="font-size:12px; color:var(--text-muted);">Cost Level</div>
        </div>
      </div>
      <p style="color:var(--text-secondary); font-size:15px; line-height:1.6; margin-bottom:20px;">${city.description}</p>
      ${cityActivities.length > 0 ? `
        <div style="margin-bottom:20px;">
          <h4 style="margin-bottom:12px; font-size:15px;">Top Activities</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${cityActivities.slice(0,4).map(a => `
              <div style="display:flex; align-items:center; gap:10px; padding:10px; background:var(--bg-card); border-radius:10px; font-size:14px;">
                <span>${a.icon}</span><span style="flex:1;">${a.name}</span>
                <span class="badge badge-grey">${a.type}</span>
                <span style="color:var(--accent-green); font-weight:600;">$${a.cost}</span>
              </div>`).join('')}
          </div>
        </div>
      ` : ''}
      <button class="btn btn-primary" style="width:100%;" onclick="CitySearchScreen.addToTrip('${city.id}'); App.closeModal();">+ Add to My Trip</button>
    `);
  },

  addToTrip(cityId) {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    const city = CITIES_DATA.find(c => c.id === cityId);
    if (!city) return;
    if (trips.length === 0) { App.toast('Create a trip first!', 'info'); App.navigate('create-trip'); return; }
    if (trips.length === 1) {
      this._doAdd(trips[0].id, city);
      return;
    }
    App.openModal(`
      <h2 style="margin-bottom:20px;">Add ${city.flag} ${city.name} to trip:</h2>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${trips.map(t => `
          <button class="btn btn-ghost" style="justify-content:flex-start; gap:10px;" onclick="CitySearchScreen._doAdd('${t.id}', {id:'${city.id}', name:'${city.name}', country:'${city.country}', flag:'${city.flag}'}); App.closeModal();">
            ${t.emoji||'✈️'} ${t.name}
          </button>`).join('')}
      </div>
    `);
  },

  async _doAdd(tripId, city) {
    try {
      const trip = await API.getTrip(tripId);
      const stops = trip.stops || [];
      stops.push({
        city: city.name, country: city.country, flag: city.flag,
        startDate: '', endDate: '', activities: []
      });
      await API.saveItinerary(tripId, stops);
      App.toast(`${city.flag} ${city.name} added! Set dates in builder.`, 'success');
      App.navigate('itinerary-builder', tripId);
    } catch (err) {
      App.toast(err.message, 'error');
    }
  }
};
