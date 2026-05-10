/* ============================================================
   TRAVELOOP – Budget & Cost Breakdown Screen
   ============================================================ */

const BudgetScreen = {
  _tripId: null,

  render(tripId) {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    this._tripId = tripId || trips[0]?.id || null;

    if (!this._tripId) return `
      <div class="empty-state">
        <div class="empty-state-icon">💰</div>
        <div class="empty-state-title">No trips found</div>
        <button class="btn btn-primary" onclick="App.navigate('create-trip')" style="margin-top:16px;">Create a Trip</button>
      </div>`;

    const trip = DB.getTrip(this._tripId);
    const stops = DB.getTripStops(this._tripId);

    // Calculate costs
    const actCost = stops.reduce((s, st) => s + (st.activities||[]).reduce((a,ac)=>a+ac.cost,0), 0);
    const nights = trip?.startDate && trip?.endDate
      ? Math.max(1, Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))
      : stops.length * 3;
    const estHotel = nights * 90;
    const estFood = nights * 50;
    const estTransport = stops.length > 1 ? (stops.length - 1) * 120 : 0;
    const estMisc = Math.round(actCost * 0.1);
    const totalEst = actCost + estHotel + estFood + estTransport + estMisc;
    const budget = trip?.budget || 0;
    const overBudget = budget > 0 && totalEst > budget;
    const budgetPct = budget > 0 ? Math.min(100, Math.round((totalEst/budget)*100)) : 0;

    const categories = [
      { name: 'Activities', icon: '🎯', amount: actCost, color: 'var(--accent-primary)', pct: totalEst > 0 ? Math.round((actCost/totalEst)*100) : 0, barClass: '' },
      { name: 'Accommodation', icon: '🏨', amount: estHotel, color: 'var(--accent-amber)', pct: totalEst > 0 ? Math.round((estHotel/totalEst)*100) : 0, barClass: 'coral' },
      { name: 'Food & Dining', icon: '🍽️', amount: estFood, color: 'var(--accent-green)', pct: totalEst > 0 ? Math.round((estFood/totalEst)*100) : 0, barClass: 'green' },
      { name: 'Transport', icon: '✈️', amount: estTransport, color: 'var(--accent-purple)', pct: totalEst > 0 ? Math.round((estTransport/totalEst)*100) : 0, barClass: 'purple' },
      { name: 'Miscellaneous', icon: '💡', amount: estMisc, color: '#fda085', pct: totalEst > 0 ? Math.round((estMisc/totalEst)*100) : 0, barClass: 'coral' },
    ];

    return `
    <div>
      <div class="page-header flex justify-between items-center" style="flex-wrap:wrap; gap:16px;">
        <div>
          <h1>💰 Budget <span class="text-gradient">Breakdown</span></h1>
          <p>Track and manage your travel expenses</p>
        </div>
        <select class="form-input" style="max-width:240px;" onchange="BudgetScreen.switchTrip(this.value)">
          ${trips.map(t => `<option value="${t.id}" ${t.id===this._tripId?'selected':''}>${t.emoji||'✈️'} ${t.name}</option>`).join('')}
        </select>
      </div>

      <div class="budget-layout">
        <!-- Left Column -->
        <div>
          <!-- Summary Card -->
          <div class="budget-summary-card">
            <div style="font-size:13px; color:var(--text-muted); margin-bottom:6px; font-weight:600; letter-spacing:0.05em; text-transform:uppercase;">Estimated Total</div>
            <div class="budget-total">$${totalEst.toLocaleString()}</div>
            <div style="font-size:14px; color:var(--text-secondary); margin-bottom:20px;">${nights} night${nights!==1?'s':''} · ${stops.length} cit${stops.length!==1?'ies':'y'}</div>
            ${budget > 0 ? `
              <div style="margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px;">
                  <span style="color:var(--text-muted);">Budget used</span>
                  <span style="color:${overBudget?'var(--accent-coral)':'var(--accent-green)'}; font-weight:700;">${budgetPct}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill ${overBudget?'coral':''}" style="width:${budgetPct}%;"></div>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-secondary);">
                <span>Budget: <strong style="color:var(--accent-primary);">$${budget.toLocaleString()}</strong></span>
                <span>${overBudget
                  ? `<span style="color:var(--accent-coral);">⚠️ $${(totalEst-budget).toLocaleString()} over budget</span>`
                  : `<span style="color:var(--accent-green);">✅ $${(budget-totalEst).toLocaleString()} remaining</span>`
                }</span>
              </div>
            ` : `
              <div style="font-size:13px; color:var(--text-muted);">
                <a href="#" style="color:var(--accent-primary);" onclick="App.navigate('create-trip','${this._tripId}')">Set a budget</a> to track spending
              </div>
            `}
          </div>

          <!-- Per-day stats -->
          <div class="grid-3" style="margin-bottom:20px;">
            <div class="stat-card blue" style="padding:16px; text-align:center;">
              <div style="font-size:22px; font-weight:800; font-family:'Outfit',sans-serif; color:var(--accent-primary);">$${Math.round(totalEst/Math.max(nights,1))}</div>
              <div style="font-size:12px; color:var(--text-muted);">Per Day</div>
            </div>
            <div class="stat-card coral" style="padding:16px; text-align:center;">
              <div style="font-size:22px; font-weight:800; font-family:'Outfit',sans-serif; color:var(--accent-amber);">$${Math.round(totalEst/Math.max(stops.length,1))}</div>
              <div style="font-size:12px; color:var(--text-muted);">Per City</div>
            </div>
            <div class="stat-card green" style="padding:16px; text-align:center;">
              <div style="font-size:22px; font-weight:800; font-family:'Outfit',sans-serif; color:var(--accent-green);">${stops.reduce((s,st)=>s+(st.activities||[]).length,0)}</div>
              <div style="font-size:12px; color:var(--text-muted);">Activities</div>
            </div>
          </div>

          <!-- Category breakdown -->
          <div class="card">
            <h3 style="margin-bottom:20px; font-size:17px;">📊 Cost Breakdown</h3>
            <div class="budget-categories">
              ${categories.map(cat => `
                <div class="budget-category-row">
                  <div class="budget-category-icon">${cat.icon}</div>
                  <div class="budget-category-info">
                    <div class="budget-category-name">${cat.name}</div>
                    <div class="budget-category-amount">${cat.pct}% of total</div>
                  </div>
                  <div class="budget-category-bar">
                    <div class="progress-bar">
                      <div class="progress-fill ${cat.barClass}" style="width:${cat.pct}%; background:${cat.color};"></div>
                    </div>
                  </div>
                  <div style="font-weight:700; font-size:15px; min-width:60px; text-align:right;">$${cat.amount.toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Per-stop breakdown -->
          ${stops.length > 0 ? `
            <div class="card" style="margin-top:20px;">
              <h3 style="margin-bottom:16px; font-size:17px;">📍 Cost by City</h3>
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${stops.map(stop => {
                  const stopCost = (stop.activities||[]).reduce((s,a)=>s+a.cost,0);
                  const pct = actCost > 0 ? Math.round((stopCost/actCost)*100) : 0;
                  return `
                    <div>
                      <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px;">
                        <span>${stop.flag} ${stop.city}</span>
                        <strong style="color:var(--accent-green);">$${stopCost}</strong>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width:${pct}%;"></div>
                      </div>
                    </div>`;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Right Column: Charts -->
        <div>
          <div class="chart-wrapper" style="margin-bottom:20px;">
            <div class="chart-title">🥧 Expense Distribution</div>
            <div style="height:280px; position:relative;">
              <canvas id="budget-pie-chart"></canvas>
            </div>
          </div>

          <div class="chart-wrapper">
            <div class="chart-title">📊 Category Costs</div>
            <div style="height:220px; position:relative;">
              <canvas id="budget-bar-chart"></canvas>
            </div>
          </div>

          <div class="card" style="margin-top:20px; text-align:center; padding:20px;">
            <div style="font-size:32px; margin-bottom:8px;">💡</div>
            <p style="font-size:14px; color:var(--text-secondary); line-height:1.6;">
              ${overBudget
                ? `⚠️ You're <strong style="color:var(--accent-coral);">$${(totalEst-budget).toLocaleString()} over budget.</strong> Consider reducing accommodation costs or removing some activities.`
                : budget > 0
                  ? `✅ You have <strong style="color:var(--accent-green);">$${(budget-totalEst).toLocaleString()}</strong> left to spend. Consider adding more experiences!`
                  : `Set a budget in your <a href="#" onclick="App.navigate('create-trip','${this._tripId}')" style="color:var(--accent-primary);">trip settings</a> to track spending.`}
            </p>
          </div>
        </div>
      </div>
    </div>`;
  },

  afterRender() {
    const user = DB.getCurrentUser();
    const trips = DB.getUserTrips(user.id);
    if (!this._tripId) return;

    const trip = DB.getTrip(this._tripId);
    const stops = DB.getTripStops(this._tripId);
    const nights = trip?.startDate && trip?.endDate
      ? Math.max(1, Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))
      : stops.length * 3;
    const actCost = stops.reduce((s, st) => s + (st.activities||[]).reduce((a,ac)=>a+ac.cost,0), 0);
    const estHotel = nights * 90, estFood = nights * 50, estTransport = (stops.length > 1 ? stops.length-1 : 0) * 120, estMisc = Math.round(actCost * 0.1);

    Charts.pie('budget-pie-chart',
      ['Activities', 'Accommodation', 'Food', 'Transport', 'Misc'],
      [actCost, estHotel, estFood, estTransport, estMisc],
      ['#4facfe','#fda085','#43e97b','#a855f7','#f7797d']
    );

    Charts.bar('budget-bar-chart',
      ['Activities', 'Hotel', 'Food', 'Transport', 'Misc'],
      [Charts.makeBarDataset('Cost ($)', [actCost, estHotel, estFood, estTransport, estMisc], 'rgb(79,172,254)')],
    );
  },

  switchTrip(id) { this._tripId = id; App.rerender(); }
};
