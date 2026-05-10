/* ============================================================
   TRAVELOOP – Trip Notes / Journal Screen
   ============================================================ */

const NotesScreen = {
  _tripId: null,
  _editNoteId: null,

  render(tripId) {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    this._tripId = tripId || trips[0]?.id || null;

    if (!this._tripId) return `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-title">No trips found</div>
        <button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Create a Trip</button>
      </div>`;

    const trip = DB.getTrip(this._tripId);
    const notes = DB.getTripNotes(this._tripId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    const stops = DB.getTripStops(this._tripId);

    return `
    <div>
      <div class="page-header flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <h1>📝 Trip <span class="text-gradient">Notes</span></h1>
          <p>Jot down important details and reminders</p>
        </div>
        <select class="form-input" style="max-width:220px;" onchange="NotesScreen.switchTrip(this.value)">
          ${trips.map(t => `<option value="${t.id}" ${t.id===this._tripId?'selected':''}>${t.emoji||'✈️'} ${t.name}</option>`).join('')}
        </select>
      </div>

      <div class="notes-layout">
        <!-- Main Notes -->
        <div>
          <!-- Note Editor -->
          <div class="note-editor">
            <h3 style="margin-bottom:14px; font-size:16px;">✍️ New Note</h3>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label">City / Stop (optional)</label>
              <select class="form-input" id="note-stop">
                <option value="">📍 General trip note</option>
                ${stops.map(s => `<option value="${s.id}">${s.flag||'📍'} ${s.city}</option>`).join('')}
              </select>
            </div>
            <textarea id="note-content" placeholder="Write your note here... (hotel info, contacts, reminders, tips)" style="width:100%; background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:12px; padding:16px; color:var(--text-primary); font-size:15px; line-height:1.7; resize:vertical; min-height:130px; transition:all 0.2s; font-family:'Inter',sans-serif;"
              onfocus="this.style.borderColor='var(--accent-primary)'" onblur="this.style.borderColor='var(--border-glass)'"></textarea>
            <div style="display:flex; justify-content:flex-end; margin-top:12px;">
              <button class="btn btn-primary" onclick="NotesScreen.addNote()">💾 Save Note</button>
            </div>
          </div>

          <!-- Notes List -->
          <h3 style="font-size:17px; margin-bottom:16px;">📋 ${notes.length} Note${notes.length!==1?'s':''}</h3>
          ${notes.length === 0
            ? `<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">📝</div><div class="empty-state-title">No notes yet</div><div class="empty-state-desc">Add your first note above – hotel info, tips, or reminders!</div></div>`
            : `<div class="notes-list">${notes.map(note => this._renderNote(note, stops)).join('')}</div>`}
        </div>

        <!-- Sidebar -->
        <div>
          <div class="card" style="margin-bottom:20px;">
            <h4 style="margin-bottom:14px; font-size:15px;">📊 Notes Stats</h4>
            <div style="display:flex; flex-direction:column; gap:10px; font-size:14px; color:var(--text-secondary);">
              <div style="display:flex; justify-content:space-between;">
                <span>Total Notes:</span>
                <strong style="color:var(--text-primary);">${notes.length}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>City Notes:</span>
                <strong style="color:var(--accent-primary);">${notes.filter(n=>n.stopId).length}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>General Notes:</span>
                <strong style="color:var(--accent-amber);">${notes.filter(n=>!n.stopId).length}</strong>
              </div>
            </div>
          </div>

          ${stops.length > 0 ? `
            <div class="card" style="margin-bottom:20px;">
              <h4 style="margin-bottom:14px; font-size:15px;">📍 Notes by City</h4>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${stops.map(stop => {
                  const stopNotes = notes.filter(n => n.stopId === stop.id);
                  return `
                  <div style="display:flex; align-items:center; gap:10px; padding:8px 10px; background:var(--bg-card); border-radius:8px; font-size:13px; cursor:pointer;" onclick="NotesScreen.filterByStop('${stop.id}')">
                    <span>${stop.flag||'📍'}</span>
                    <span style="flex:1;">${stop.city}</span>
                    <span class="badge badge-blue">${stopNotes.length}</span>
                  </div>`;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <div class="card">
            <h4 style="margin-bottom:12px; font-size:15px;">💡 Note Ideas</h4>
            <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; color:var(--text-muted);">
              <div>🏨 Hotel check-in details</div>
              <div>📞 Emergency contacts</div>
              <div>🚌 Transport schedules</div>
              <div>💱 Currency exchange rates</div>
              <div>🍽️ Restaurant recommendations</div>
              <div>🎟️ Booking reference numbers</div>
              <div>🌐 Local WiFi passwords</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  _renderNote(note, stops) {
    const stop = stops.find(s => s.id === note.stopId);
    const d = new Date(note.timestamp);
    const timeStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `
    <div class="note-card" id="note-${note.id}" style="border-left-color: ${stop ? 'var(--accent-amber)' : 'var(--accent-primary)'};">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div>
          <div class="note-timestamp">📅 ${timeStr}</div>
          ${stop ? `<span class="badge badge-amber" style="font-size:11px;">${stop.flag||'📍'} ${stop.city}</span>` : `<span class="badge badge-blue" style="font-size:11px;">🌍 General</span>`}
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="NotesScreen.editNote('${note.id}')" title="Edit">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="NotesScreen.deleteNote('${note.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="note-content" id="note-content-${note.id}">${note.content}</div>
    </div>`;
  },

  addNote() {
    const content = document.getElementById('note-content')?.value.trim();
    const stopId = document.getElementById('note-stop')?.value || null;
    if (!content) { App.toast('Write something first!', 'error'); return; }
    const note = { id: DB.uuid(), tripId: this._tripId, stopId: stopId || null, content, timestamp: new Date().toISOString() };
    DB.saveNote(note);
    App.toast('📝 Note saved!', 'success');
    App.rerender();
  },

  editNote(id) {
    const note = DB.getNotes().find(n => n.id === id);
    if (!note) return;
    const stops = DB.getTripStops(this._tripId);
    App.openModal(`
      <h2 style="margin-bottom:20px;">✏️ Edit Note</h2>
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="form-group">
          <label class="form-label">City / Stop</label>
          <select class="form-input" id="edit-note-stop">
            <option value="">General trip note</option>
            ${stops.map(s => `<option value="${s.id}" ${note.stopId===s.id?'selected':''}>${s.flag||'📍'} ${s.city}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Note Content</label>
          <textarea class="form-input" id="edit-note-content" rows="5">${note.content}</textarea>
        </div>
        <div style="display:flex; gap:12px;">
          <button class="btn btn-primary" onclick="NotesScreen.saveEdit('${id}')">💾 Save</button>
          <button class="btn btn-ghost" onclick="App.closeModal()">Cancel</button>
        </div>
      </div>
    `);
  },

  saveEdit(id) {
    const content = document.getElementById('edit-note-content')?.value.trim();
    const stopId = document.getElementById('edit-note-stop')?.value || null;
    if (!content) { App.toast('Note cannot be empty', 'error'); return; }
    const note = DB.getNotes().find(n => n.id === id);
    if (!note) return;
    note.content = content;
    note.stopId = stopId || null;
    note.timestamp = new Date().toISOString();
    DB.saveNote(note);
    App.closeModal();
    App.toast('Note updated!', 'success');
    App.rerender();
  },

  deleteNote(id) {
    DB.deleteNote(id);
    App.toast('Note deleted', 'info');
    App.rerender();
  },

  filterByStop(stopId) {
    App.toast('Filtering by city coming soon!', 'info');
  },

  switchTrip(id) { this._tripId = id; App.rerender(); }
};
