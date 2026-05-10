/* ============================================================
   TRAVELOOP – Packing Checklist Screen
   ============================================================ */

const PackingScreen = {
  _tripId: null,
  _category: 'All',

  render(tripId) {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    this._tripId = tripId || trips[0]?.id || null;

    if (!this._tripId) return `
      <div class="empty-state">
        <div class="empty-state-icon">🎒</div>
        <div class="empty-state-title">No trips found</div>
        <button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Create a Trip</button>
      </div>`;

    const items = DB.getTripPacking(this._tripId);
    const packedCount = items.filter(i => i.packed).length;
    const pct = items.length > 0 ? Math.round((packedCount/items.length)*100) : 0;

    const categories = {
      clothing: { label: 'Clothing', icon: '👕', items: items.filter(i=>i.category==='clothing') },
      documents: { label: 'Documents', icon: '📄', items: items.filter(i=>i.category==='documents') },
      electronics: { label: 'Electronics', icon: '💻', items: items.filter(i=>i.category==='electronics') },
      toiletries: { label: 'Toiletries', icon: '🧴', items: items.filter(i=>i.category==='toiletries') },
      misc: { label: 'Miscellaneous', icon: '📦', items: items.filter(i=>i.category==='misc' || !['clothing','documents','electronics','toiletries'].includes(i.category)) },
    };

    return `
    <div>
      <div class="page-header flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <h1>🎒 Packing <span class="text-gradient">Checklist</span></h1>
          <p>Stay organized and never forget anything</p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <select class="form-input" style="max-width:200px;" onchange="PackingScreen.switchTrip(this.value)">
            ${trips.map(t => `<option value="${t.id}" ${t.id===this._tripId?'selected':''}>${t.emoji||'✈️'} ${t.name}</option>`).join('')}
          </select>
          <button class="btn btn-ghost btn-sm" onclick="PackingScreen.resetAll()">🔄 Unpack All</button>
        </div>
      </div>

      <div class="packing-layout">
        <!-- Main Checklist -->
        <div>
          <!-- Add Item Form -->
          <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px; font-size:16px;">+ Add Item</h3>
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
              <div class="form-group" style="flex:2; min-width:160px;">
                <label class="form-label">Item Name</label>
                <input type="text" class="form-input" id="pack-item-name" placeholder="e.g. Sunscreen" onkeydown="if(event.key==='Enter')PackingScreen.addItem()" />
              </div>
              <div class="form-group" style="flex:1; min-width:140px;">
                <label class="form-label">Category</label>
                <select class="form-input" id="pack-item-cat">
                  <option value="clothing">👕 Clothing</option>
                  <option value="documents">📄 Documents</option>
                  <option value="electronics">💻 Electronics</option>
                  <option value="toiletries">🧴 Toiletries</option>
                  <option value="misc">📦 Misc</option>
                </select>
              </div>
              <button class="btn btn-primary" onclick="PackingScreen.addItem()">Add</button>
            </div>
            <!-- Quick add suggestions -->
            <div style="margin-top:14px;">
              <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Quick add:</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${['Passport','Sunscreen','Charger','First Aid Kit','Travel Pillow','Camera','Rain Jacket','Power Bank'].map(s => `
                  <button class="filter-chip" onclick="PackingScreen.quickAdd('${s}')" style="font-size:12px; padding:5px 12px;">${s}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="filter-chips" style="margin-bottom:20px;">
            <button class="filter-chip ${this._category==='All'?'active':''}" onclick="PackingScreen.setCategory('All')">All (${items.length})</button>
            ${Object.entries(categories).map(([k,v]) => `
              <button class="filter-chip ${this._category===k?'active':''}" onclick="PackingScreen.setCategory('${k}')">${v.icon} ${v.label} (${v.items.length})</button>
            `).join('')}
          </div>

          <!-- Items by category -->
          ${this._renderCategoryItems(categories, this._category)}
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Progress Ring -->
          <div class="packing-progress-card">
            <div class="packing-progress-ring" style="--pct:${pct * 3.6}deg; background: conic-gradient(var(--accent-green) ${pct * 3.6}deg, rgba(255,255,255,0.08) 0deg);">
              <div class="packing-progress-pct">${pct}%</div>
            </div>
            <div style="font-size:18px; font-weight:700; margin-bottom:4px;">${packedCount} / ${items.length}</div>
            <div style="font-size:13px; color:var(--text-muted);">Items packed</div>
            ${pct === 100 ? `<div style="margin-top:12px; padding:10px; background:rgba(67,233,123,0.1); border-radius:12px; color:var(--accent-green); font-size:14px; font-weight:600;">🎉 All packed! Have a great trip!</div>` : ''}
          </div>

          <!-- Category Summary -->
          <div class="card" style="margin-top:0;">
            <h4 style="margin-bottom:14px; font-size:15px;">📊 By Category</h4>
            ${Object.entries(categories).map(([k,v]) => {
              const catPacked = v.items.filter(i=>i.packed).length;
              const catPct = v.items.length > 0 ? Math.round((catPacked/v.items.length)*100) : 0;
              return `
                <div style="margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px;">
                    <span>${v.icon} ${v.label}</span>
                    <span style="color:var(--text-muted);">${catPacked}/${v.items.length}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill green" style="width:${catPct}%;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;
  },

  _renderCategoryItems(categories, activeCategory) {
    const catMap = { All: Object.values(categories).flatMap(c => c.items) };
    Object.entries(categories).forEach(([k,v]) => catMap[k] = v.items);
    const items = catMap[activeCategory] || [];

    if (items.length === 0) return `<div class="empty-state" style="padding:48px;"><div class="empty-state-icon">✅</div><div class="empty-state-title">Nothing here yet</div><div class="empty-state-desc">Add items using the form above.</div></div>`;

    if (activeCategory === 'All') {
      return Object.entries(categories).filter(([,v]) => v.items.length > 0).map(([k,v]) => `
        <div class="category-section">
          <div class="category-header">
            <span class="badge cat-color-${k}">${v.icon} ${v.label}</span>
            <span style="color:var(--text-muted); font-size:13px; font-weight:400;">${v.items.filter(i=>i.packed).length}/${v.items.length} packed</span>
          </div>
          <div class="category-items">
            ${v.items.map(item => this._renderItem(item)).join('')}
          </div>
        </div>
      `).join('');
    }
    return `<div class="category-items">${items.map(item => this._renderItem(item)).join('')}</div>`;
  },

  _renderItem(item) {
    return `
    <div class="checklist-item ${item.packed?'checked':''}" id="pack-${item.id}">
      <div class="checkbox-custom ${item.packed?'checked':''}" onclick="PackingScreen.toggle('${item.id}')">
        ${item.packed ? '✓' : ''}
      </div>
      <span class="item-label" style="flex:1;">${item.item}</span>
      <button class="btn btn-danger btn-sm btn-icon" onclick="PackingScreen.deleteItem('${item.id}')" title="Remove">✕</button>
    </div>`;
  },

  toggle(id) {
    const items = DB.getPacking();
    const item = items.find(i => i.id === id);
    if (!item) return;
    item.packed = !item.packed;
    DB.savePackingItem(item);
    App.rerender();
  },

  addItem() {
    const name = document.getElementById('pack-item-name')?.value.trim();
    const category = document.getElementById('pack-item-cat')?.value || 'misc';
    if (!name) { App.toast('Enter an item name', 'error'); return; }
    const item = { id: DB.uuid(), tripId: this._tripId, item: name, category, packed: false };
    DB.savePackingItem(item);
    App.toast(`✅ ${name} added`, 'success');
    App.rerender();
  },

  quickAdd(name) {
    const catMap = { Passport: 'documents', Sunscreen: 'toiletries', Charger: 'electronics', 'First Aid Kit': 'misc', 'Travel Pillow': 'misc', Camera: 'electronics', 'Rain Jacket': 'clothing', 'Power Bank': 'electronics' };
    const item = { id: DB.uuid(), tripId: this._tripId, item: name, category: catMap[name] || 'misc', packed: false };
    DB.savePackingItem(item);
    App.toast(`✅ ${name} added`, 'success');
    App.rerender();
  },

  deleteItem(id) {
    DB.deletePackingItem(id);
    App.rerender();
  },

  resetAll() {
    const items = DB.getTripPacking(this._tripId);
    items.forEach(item => { item.packed = false; DB.savePackingItem(item); });
    App.toast('All items unmarked', 'info');
    App.rerender();
  },

  setCategory(c) { this._category = c; App.rerender(); },
  switchTrip(id) { this._tripId = id; this._category = 'All'; App.rerender(); }
};
