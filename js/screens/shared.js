/* ============================================================
   TRAVELOOP – Shared / Public Itinerary View Screen
   ============================================================ */

const SharedScreen = {
  _tripId: null,

  render(tripId) {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id).filter(t => t.isPublic);
    this._tripId = tripId || trips[0]?.id || null;

    if (!this._tripId && trips.length === 0) return `
      <div class="empty-state">
        <div class="empty-state-icon">🌐</div>
        <div class="empty-state-title">No Public Trips</div>
        <div class="empty-state-desc">Make a trip public to share it with friends and the community!</div>
        <button class="btn btn-primary" onclick="App.navigate('trips')" style="margin-top:16px;">Go to My Trips</button>
      </div>`;

    const trip = DB.getTrip(this._tripId);
    if (!trip) return `<div class="empty-state"><div class="empty-state-icon">❌</div><div class="empty-state-title">Trip not found</div></div>`;

    const stops = DB.getTripStops(this._tripId);
    const totalCost = stops.reduce((s, st) => s + (st.activities||[]).reduce((a,ac)=>a+ac.cost,0), 0);
    const totalActivities = stops.reduce((s, st) => s + (st.activities||[]).length, 0);
    const shareUrl = `traveloop.app/share/${trip.id}`;

    return `
    <div>
      ${trips.length > 1 ? `
        <div style="margin-bottom:20px;">
          <select class="form-input" style="max-width:280px;" onchange="SharedScreen.switchTrip(this.value)">
            ${trips.map(t => `<option value="${t.id}" ${t.id===this._tripId?'selected':''}>${t.emoji||'✈️'} ${t.name}</option>`).join('')}
          </select>
        </div>
      ` : ''}

      <!-- Hero -->
      <div class="shared-hero">
        <span class="shared-hero-icon">${trip.emoji || '✈️'}</span>
        <h1 class="shared-hero-title">${trip.name}</h1>
        <div class="shared-hero-meta">
          📅 ${this._fmtRange(trip.startDate, trip.endDate)} &nbsp;·&nbsp;
          📍 ${stops.length} cities &nbsp;·&nbsp;
          🎯 ${totalActivities} activities &nbsp;·&nbsp;
          💰 ~$${totalCost.toLocaleString()} activities
        </div>
        ${trip.description ? `<p style="color:rgba(255,255,255,0.7); font-size:15px; max-width:500px; margin:0 auto 20px; position:relative; line-height:1.6;">${trip.description}</p>` : ''}

        <!-- Share URL -->
        <div class="share-url-box">
          <span>🔗</span>
          <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${shareUrl}</span>
          <button class="btn btn-primary btn-sm" onclick="SharedScreen.copyLink('${shareUrl}')">Copy</button>
        </div>

        <!-- Actions -->
        <div class="shared-actions">
          <button class="btn btn-primary" onclick="SharedScreen.copyLink('${shareUrl}')">📋 Copy Link</button>
          <button class="btn btn-ghost" onclick="SharedScreen.shareTwitter('${trip.name}', '${shareUrl}')">🐦 Twitter</button>
          <button class="btn btn-ghost" onclick="SharedScreen.shareWhatsApp('${trip.name}', '${shareUrl}')">💬 WhatsApp</button>
          <button class="btn btn-green" onclick="SharedScreen.copyTrip('${trip.id}')">📁 Copy Trip</button>
        </div>
      </div>

      <!-- Stop Cards (read-only) -->
      <div style="margin-bottom:24px;">
        <h2 style="margin-bottom:20px; font-size:20px;">🗺️ Itinerary</h2>
        ${stops.length === 0
          ? `<div class="empty-state" style="padding:40px;"><div class="empty-state-icon">📍</div><div class="empty-state-title">No stops added to this trip</div></div>`
          : stops.map((stop, i) => `
            <div class="card" style="margin-bottom:16px;">
              <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
                <div style="width:44px; height:44px; background:var(--gradient-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0;">${stop.flag || '📍'}</div>
                <div>
                  <div style="font-size:20px; font-weight:700;">${stop.city}, ${stop.country}</div>
                  <div style="font-size:13px; color:var(--text-muted);">Stop ${i+1} · ${this._fmtDate(stop.startDate)} → ${this._fmtDate(stop.endDate)}</div>
                </div>
                <div style="margin-left:auto; text-align:right;">
                  <div style="font-size:18px; font-weight:800; color:var(--accent-green); font-family:'Outfit',sans-serif;">$${(stop.activities||[]).reduce((s,a)=>s+a.cost,0)}</div>
                  <div style="font-size:12px; color:var(--text-muted);">${(stop.activities||[]).length} activities</div>
                </div>
              </div>
              ${(stop.activities||[]).length > 0 ? `
                <div style="display:flex; flex-direction:column; gap:8px;">
                  ${(stop.activities||[]).map(act => `
                    <div style="display:flex; align-items:center; gap:10px; padding:10px 14px; background:rgba(255,255,255,0.03); border-radius:10px; font-size:14px; border:1px solid var(--border-glass);">
                      <span>${act.icon}</span>
                      <span style="flex:1;">${act.name}</span>
                      <span class="badge badge-grey">${act.type}</span>
                      ${act.duration ? `<span style="color:var(--text-muted); font-size:12px;">⏱${act.duration}</span>` : ''}
                      <span style="color:var(--accent-green); font-weight:600;">$${act.cost}</span>
                    </div>`).join('')}
                </div>
              ` : `<p style="color:var(--text-muted); font-size:14px;">No activities planned for this stop.</p>`}
            </div>
          `).join('')}
      </div>

      <!-- Inspired? Copy this trip! -->
      <div class="card" style="text-align:center; padding:40px;">
        <div style="font-size:40px; margin-bottom:12px;">✨</div>
        <h3 style="font-size:20px; margin-bottom:8px;">Inspired by this itinerary?</h3>
        <p style="color:var(--text-secondary); font-size:15px; margin-bottom:24px; max-width:400px; margin-left:auto; margin-right:auto;">Copy this trip to your account and customize it for your own adventure!</p>
        <button class="btn btn-primary btn-lg" onclick="SharedScreen.copyTrip('${trip.id}')">📁 Copy This Trip</button>
      </div>
    </div>`;
  },

  copyLink(url) {
    navigator.clipboard.writeText(url).then(() => App.toast('🔗 Link copied to clipboard!', 'success'));
  },
  shareTwitter(name, url) {
    window.open(`https://twitter.com/intent/tweet?text=Check out my trip "${name}" on Traveloop!&url=${url}`, '_blank');
  },
  shareWhatsApp(name, url) {
    window.open(`https://wa.me/?text=Check out my trip "${name}": ${url}`, '_blank');
  },
  copyTrip(id) {
    const user = DB.getCurrentUser();
    const orig = DB.getTrip(id);
    if (!orig) return;
    const newId = DB.uuid();
    DB.saveTrip({ ...orig, id: newId, userId: user.id, name: `Copy of ${orig.name}`, isPublic: false, createdAt: new Date().toISOString() });
    const stops = DB.getTripStops(id);
    stops.forEach(s => DB.saveStop({ ...s, id: DB.uuid(), tripId: newId }));
    App.toast('Trip copied to your account! 🎉', 'success');
    App.navigate('trips');
  },
  switchTrip(id) { this._tripId = id; App.rerender(); },
  _fmtDate(d) { if (!d) return 'TBD'; return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); },
  _fmtRange(s, e) {
    if (!s) return 'No dates';
    const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
  }
};
