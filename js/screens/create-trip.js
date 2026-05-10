/* ============================================================
   TRAVELOOP – Create Trip Screen
   ============================================================ */

const CreateTripScreen = {
  _editId: null,

  render(tripId) {
    this._editId = tripId || null;
    const existing = tripId ? DB.getTrip(tripId) : null;
    const emojis = ['✈️','🏖️','🏔️','🌴','🏰','🗺️','🌸','🌊','🎭','🍜','🎿','🚂'];

    return `
    <div>
      <div class="page-header">
        <h1>${existing ? '✏️ Edit' : '🗺️ Create'} <span class="text-gradient">Trip</span></h1>
        <p>${existing ? 'Update your trip details' : 'Start planning your next adventure'}</p>
      </div>

      <div class="create-trip-layout">
        <!-- Main Form -->
        <div>
          <div class="card" style="margin-bottom:24px;">
            <h2 style="margin-bottom:24px; font-size:18px;">Trip Details</h2>
            <form id="create-trip-form" style="display:flex; flex-direction:column; gap:20px;" onsubmit="CreateTripScreen.save(event)">

              <div class="form-group">
                <label class="form-label">Trip Name *</label>
                <input type="text" class="form-input" id="trip-name" placeholder="e.g. European Summer Adventure"
                  value="${existing?.name || ''}" required oninput="CreateTripScreen.updatePreview()" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Start Date *</label>
                  <input type="date" class="form-input" id="trip-start" value="${existing?.startDate || ''}" required oninput="CreateTripScreen.updatePreview()" />
                </div>
                <div class="form-group">
                  <label class="form-label">End Date *</label>
                  <input type="date" class="form-input" id="trip-end" value="${existing?.endDate || ''}" required oninput="CreateTripScreen.updatePreview()" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input" id="trip-description" placeholder="What's this trip about?" rows="3" oninput="CreateTripScreen.updatePreview()">${existing?.description || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Estimated Budget (USD)</label>
                <input type="number" class="form-input" id="trip-budget" placeholder="0" min="0" value="${existing?.budget || ''}" />
              </div>

              <div class="form-group">
                <label class="form-label">Trip Emoji / Icon</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;" id="emoji-picker">
                  ${emojis.map(e => `
                    <button type="button" class="emoji-btn" onclick="CreateTripScreen.selectEmoji('${e}')"
                      style="width:48px;height:48px;border-radius:12px;font-size:24px;background:var(--bg-card);border:1px solid var(--border-glass);cursor:pointer;transition:all 0.2s;${(existing?.emoji||'✈️')===e?'border-color:var(--accent-primary);background:rgba(79,172,254,0.15);':''}">${e}</button>
                  `).join('')}
                </div>
                <input type="hidden" id="trip-emoji" value="${existing?.emoji || '✈️'}" />
              </div>

              <div class="form-group">
                <label class="form-label">Cover Style</label>
                <div style="display:flex; gap:8px; flex-wrap:wrap;" id="cover-picker">
                  ${['trip-cover-1','trip-cover-2','trip-cover-3','trip-cover-4','trip-cover-5','trip-cover-6'].map((g,i) => `
                    <button type="button" onclick="CreateTripScreen.selectCover('${g}')"
                      style="width:48px;height:48px;border-radius:12px;border:2px solid ${(existing?.coverGradient||'trip-cover-1')===g?'var(--accent-primary)':'transparent'};cursor:pointer;transition:all 0.2s;" class="${g}" data-cover="${g}"></button>
                  `).join('')}
                </div>
                <input type="hidden" id="trip-cover" value="${existing?.coverGradient || 'trip-cover-1'}" />
              </div>

              <div class="form-group">
                <label class="form-label">Visibility</label>
                <div style="display:flex; gap:16px; align-items:center;">
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px;">
                    <input type="radio" name="trip-visibility" id="trip-public" value="public" ${existing?.isPublic ? 'checked' : ''} style="accent-color:var(--accent-primary);" />
                    🌐 Public (shareable)
                  </label>
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:14px;">
                    <input type="radio" name="trip-visibility" id="trip-private" value="private" ${!existing?.isPublic ? 'checked' : ''} style="accent-color:var(--accent-primary);" />
                    🔒 Private
                  </label>
                </div>
              </div>

              <div style="display:flex; gap:12px; padding-top:8px;">
                <button type="submit" class="btn btn-primary btn-lg">${existing ? '💾 Save Changes' : '🚀 Create Trip'}</button>
                <button type="button" class="btn btn-ghost btn-lg" onclick="App.navigate('trips')">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Preview Card -->
        <div>
          <h3 style="margin-bottom:16px; font-size:15px; color:var(--text-muted); font-weight:600; letter-spacing:0.05em; text-transform:uppercase;">Preview</h3>
          <div class="trip-preview-card">
            <div class="trip-preview-cover" id="preview-cover" style="background:linear-gradient(135deg, #4facfe, #00f2fe);">
              <span id="preview-emoji">✈️</span>
            </div>
            <div class="trip-preview-body">
              <div class="trip-preview-name" id="preview-name">Trip Name</div>
              <div class="trip-preview-meta">
                <span id="preview-dates">📅 Set your dates</span>
                <span id="preview-desc" style="font-size:13px; margin-top:4px; color:var(--text-muted);">Add a description...</span>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top:20px;">
            <h4 style="margin-bottom:12px; font-size:15px;">Next Steps</h4>
            <div style="display:flex; flex-direction:column; gap:10px; font-size:14px; color:var(--text-secondary);">
              <div>1️⃣ Create your trip</div>
              <div>2️⃣ Add city stops in the Itinerary Builder</div>
              <div>3️⃣ Pick activities for each stop</div>
              <div>4️⃣ Review budget breakdown</div>
              <div>5️⃣ Share with friends!</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  },

  afterRender() {
    this.updatePreview();
  },

  selectEmoji(e) {
    document.getElementById('trip-emoji').value = e;
    document.getElementById('preview-emoji').textContent = e;
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.style.borderColor = btn.textContent === e ? 'var(--accent-primary)' : 'var(--border-glass)';
      btn.style.background = btn.textContent === e ? 'rgba(79,172,254,0.15)' : 'var(--bg-card)';
    });
  },

  selectCover(g) {
    document.getElementById('trip-cover').value = g;
    const gradients = {
      'trip-cover-1': 'linear-gradient(135deg,#667eea,#764ba2)',
      'trip-cover-2': 'linear-gradient(135deg,#f7797d,#fda085)',
      'trip-cover-3': 'linear-gradient(135deg,#4facfe,#00f2fe)',
      'trip-cover-4': 'linear-gradient(135deg,#43e97b,#38f9d7)',
      'trip-cover-5': 'linear-gradient(135deg,#f093fb,#f5576c)',
      'trip-cover-6': 'linear-gradient(135deg,#4facfe,#667eea)',
    };
    document.getElementById('preview-cover').style.background = gradients[g] || gradients['trip-cover-1'];
    document.querySelectorAll('[data-cover]').forEach(btn => {
      btn.style.borderColor = btn.dataset.cover === g ? 'var(--accent-primary)' : 'transparent';
    });
  },

  updatePreview() {
    const name = document.getElementById('trip-name')?.value || 'Trip Name';
    const start = document.getElementById('trip-start')?.value;
    const end = document.getElementById('trip-end')?.value;
    const desc = document.getElementById('trip-description')?.value;
    document.getElementById('preview-name').textContent = name || 'Trip Name';
    document.getElementById('preview-name').style.color = name ? 'var(--text-primary)' : 'var(--text-muted)';
    if (start) {
      const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const e = end ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      document.getElementById('preview-dates').textContent = `📅 ${s}${e ? ' – ' + e : ''}`;
    }
    if (desc) document.getElementById('preview-desc').textContent = desc.slice(0,80) + (desc.length > 80 ? '...' : '');
  },

  save(e) {
    e.preventDefault();
    const user = DB.getCurrentUser();
    const name = document.getElementById('trip-name').value.trim();
    const startDate = document.getElementById('trip-start').value;
    const endDate = document.getElementById('trip-end').value;
    const description = document.getElementById('trip-description').value.trim();
    const budget = parseFloat(document.getElementById('trip-budget').value) || 0;
    const emoji = document.getElementById('trip-emoji').value;
    const coverGradient = document.getElementById('trip-cover').value;
    const isPublic = document.querySelector('input[name="trip-visibility"]:checked')?.value === 'public';

    if (new Date(endDate) < new Date(startDate)) { App.toast('End date must be after start date', 'error'); return; }

    const trip = {
      id: this._editId || DB.uuid(),
      userId: user.id,
      name, startDate, endDate, description,
      budget, emoji, coverGradient, isPublic,
      status: this._editId ? (DB.getTrip(this._editId)?.status || 'planning') : 'planning',
      createdAt: this._editId ? (DB.getTrip(this._editId)?.createdAt) : new Date().toISOString(),
    };
    DB.saveTrip(trip);
    App.toast(this._editId ? 'Trip updated! 🎉' : 'Trip created! 🚀 Now add some stops.', 'success');
    App.navigate('itinerary-builder', trip.id);
  }
};
