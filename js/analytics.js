/**
 * analytics.js — Boston Education Hub
 * Calculates and renders the statistics dashboard: quick stats cards,
 * category breakdown chart, and dynamic insights.
 */

const Analytics = (() => {
  let _chart = null;
  let _animatedOnce = false;

  /**
   * Initialise the analytics dashboard with initial full data.
   */
  function init() {
    const allCats = new Set(Object.keys(CONFIG.categoryColors));
    update(allCats);
    animateCounters();
  }

  /**
   * Update all stats based on currently active categories.
   * @param {Set<string>} activeCategories
   */
  function update(activeCategories) {
    const markers = Layers.getUniversityMarkers();
    const visible = markers.filter(m => activeCategories.has(m._collegeProps.category));

    // Quick stats
    updateQuickStats(visible, markers);

    // Category chart
    updateChart(activeCategories);

    // Insights
    updateInsights(visible, markers);
  }

  /* ───── Quick Stats ───── */

  function updateQuickStats(visible, allMarkers) {
    // Total universities (visible)
    const totalEl = document.getElementById('stat-total');
    if (totalEl) totalEl.textContent = visible.length;

    // MBTA stations count
    const stationsData = Layers.getMbtaStationsData();
    const stationCount = stationsData ? stationsData.features.length : 0;
    const stationEl = document.getElementById('stat-stations');
    if (stationEl) stationEl.textContent = stationCount;

    // % within 500m — only recalculate if buffer module is ready
    updateBufferPercentage(visible);
  }

  /**
   * Calculate and display the percentage of visible universities
   * within 500m of an MBTA station.
   */
  function updateBufferPercentage(visible) {
    const pctEl = document.getElementById('stat-buffer-pct');
    if (!pctEl) return;

    const stationsData = Layers.getMbtaStationsData();
    if (!stationsData) { pctEl.textContent = '—'; return; }

    let insideCount = 0;
    visible.forEach(marker => {
      const latlng = marker._collegeCoords;
      const pt = turf.point([latlng.lng, latlng.lat]);

      const isInside = stationsData.features.some(station => {
        const sCoords = station.geometry.coordinates;
        const stationPt = turf.point(sCoords);
        const dist = turf.distance(pt, stationPt, { units: 'kilometers' });
        return dist <= 0.5;
      });

      if (isInside) insideCount++;
    });

    const pct = visible.length > 0 ? Math.round((insideCount / visible.length) * 100) : 0;
    pctEl.textContent = pct + '%';
  }

  /* ───── Category Breakdown Chart ───── */

  function updateChart(activeCategories) {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;

    const markers = Layers.getUniversityMarkers();
    const categories = Object.keys(CONFIG.categoryColors);
    const counts = {};
    categories.forEach(cat => { counts[cat] = 0; });
    markers.forEach(m => {
      const c = m._collegeProps.category;
      if (activeCategories.has(c)) counts[c]++;
    });

    const labels = categories;
    const data   = categories.map(c => counts[c]);
    const colors = categories.map(c => CONFIG.categoryColors[c]);

    if (_chart) _chart.destroy();

    _chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.length > 18 ? l.slice(0, 16) + '…' : l),
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: 4,
          barThickness: 18
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => categories[items[0].dataIndex],
              label: (item) => `${item.raw} institution${item.raw !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 2,
              font: { family: 'JetBrains Mono', size: 10 },
              color: '#999'
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#5C5C5C'
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  /* ───── Insights Panel ───── */

  function updateInsights(visible, allMarkers) {
    const container = document.getElementById('insights-list');
    if (!container) return;

    const insights = [];
    const stationsData = Layers.getMbtaStationsData();

    // 1. % within 500m
    if (stationsData) {
      let insideCount = 0;
      visible.forEach(marker => {
        const latlng = marker._collegeCoords;
        const pt = turf.point([latlng.lng, latlng.lat]);
        const inside = stationsData.features.some(station => {
          const sCoords = station.geometry.coordinates;
          return turf.distance(pt, turf.point(sCoords), { units: 'kilometers' }) <= 0.5;
        });
        if (inside) insideCount++;
      });
      const pct = visible.length > 0 ? Math.round((insideCount / visible.length) * 100) : 0;
      insights.push(`<li><span class="insight-icon">🎯</span> <strong>${pct}%</strong> of universities are within 500m of an MBTA station</li>`);
    }

    // 2. Which MBTA line serves the most universities
    if (stationsData) {
      const lineCount = {};
      visible.forEach(marker => {
        const latlng = marker._collegeCoords;
        const pt = turf.point([latlng.lng, latlng.lat]);
        let nearest = null;
        let nearestDist = Infinity;

        stationsData.features.forEach(station => {
          const d = turf.distance(pt, turf.point(station.geometry.coordinates), { units: 'kilometers' });
          if (d < nearestDist) {
            nearestDist = d;
            nearest = station;
          }
        });

        if (nearest && nearestDist <= 1) {
          const lines = (nearest.properties.LINE || '').split('/');
          lines.forEach(l => {
            const line = l.trim();
            if (line) lineCount[line] = (lineCount[line] || 0) + 1;
          });
        }
      });

      const sorted = Object.entries(lineCount).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const topLine = CONFIG.mbtaLabels[sorted[0][0]] || sorted[0][0];
        insights.push(`<li><span class="insight-icon">🚇</span> <strong>${topLine}</strong> serves the most nearby universities (${sorted[0][1]})</li>`);
      }
    }

    // 3. Most common category
    const catCounts = {};
    visible.forEach(m => {
      const c = m._collegeProps.category;
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      insights.push(`<li><span class="insight-icon">🏛️</span> <strong>${topCat[0]}</strong> is the largest category (${topCat[1]} institutions)</li>`);
    }

    // 4. Total count
    insights.push(`<li><span class="insight-icon">🌐</span> Total of <strong>${visible.length}</strong> institution${visible.length !== 1 ? 's' : ''} displayed</li>`);

    container.innerHTML = insights.join('');
  }

  /* ───── Animated count-up on load ───── */

  function animateCounters() {
    if (_animatedOnce) return;
    _animatedOnce = true;

    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.textContent) || 0;
      if (target === 0) return;
      const suffix = el.textContent.replace(/\d/g, '');  // e.g. '%'
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current + suffix;
      }, 30);
    });
  }

  return { init, update, animateCounters };
})();
