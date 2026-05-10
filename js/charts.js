/* ============================================================
   TRAVELOOP – Chart.js Wrappers
   ============================================================ */

const Charts = {
  _instances: {},

  destroy(id) {
    if (this._instances[id]) {
      this._instances[id].destroy();
      delete this._instances[id];
    }
  },

  pie(canvasId, labels, data, colors) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || ['#4facfe','#f7797d','#a855f7','#43e97b','#fda085','#00f2fe'],
          borderWidth: 0,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(240,244,255,0.7)', padding: 16, font: { family: 'Inter', size: 12 } }
          },
          tooltip: {
            backgroundColor: 'rgba(15,22,41,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#f0f4ff',
            bodyColor: 'rgba(240,244,255,0.7)',
            callbacks: {
              label: (ctx) => ` $${ctx.parsed.toFixed(0)} – ${Math.round((ctx.parsed/ctx.dataset.data.reduce((a,b)=>a+b,0))*100)}%`
            }
          }
        }
      }
    });
  },

  bar(canvasId, labels, datasets, xLabel, yLabel) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: 'rgba(240,244,255,0.7)', font: { family: 'Inter', size: 12 } }
          },
          tooltip: {
            backgroundColor: 'rgba(15,22,41,0.95)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#f0f4ff',
            bodyColor: 'rgba(240,244,255,0.7)',
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(240,244,255,0.5)', font: { family: 'Inter', size: 11 } },
            title: xLabel ? { display: true, text: xLabel, color: 'rgba(240,244,255,0.5)' } : { display: false }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(240,244,255,0.5)', font: { family: 'Inter', size: 11 }, callback: v => `$${v}` },
            title: yLabel ? { display: true, text: yLabel, color: 'rgba(240,244,255,0.5)' } : { display: false }
          }
        }
      }
    });
  },

  line(canvasId, labels, datasets) {
    this.destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'rgba(240,244,255,0.7)', font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#f0f4ff', bodyColor: 'rgba(240,244,255,0.7)' }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(240,244,255,0.5)', font: { family: 'Inter', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(240,244,255,0.5)', font: { family: 'Inter', size: 11 } } }
        }
      }
    });
  },

  makeDataset(label, data, color, fill=true) {
    return {
      label,
      data,
      backgroundColor: fill ? color.replace(')',',0.15)').replace('rgb','rgba') : color,
      borderColor: color,
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: color,
      fill,
    };
  },
  makeBarDataset(label, data, color) {
    return {
      label,
      data,
      backgroundColor: color.replace(')',', 0.7)').replace('rgb','rgba') || color,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 6,
    };
  }
};
