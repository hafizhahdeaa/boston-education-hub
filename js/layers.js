/**
 * layers.js — Boston Education Hub
 * Creates, styles and manages all GeoJSON map layers and popups.
 */

const Layers = (() => {
  // Layer groups stored globally
  let universityLayer = null;
  let mbtaStationLayer = null;
  let mbtaLineLayer = null;
  let boundaryLayer = null;

  // Raw data references
  let _collegesData = null;
  let _mbtaStationsData = null;
  let _mbtaLinesData = null;

  // Individual marker storage for filtering
  let universityMarkers = [];

  /* ───── University Popup ───── */

  /**
   * Build a rich popup HTML string for a university feature.
   * @param {object} p — feature.properties
   * @returns {string}
   */
  function universityPopupHTML(p) {
    const catColor = CONFIG.categoryColors[p.category] || '#6C757D';
    const rows = [];

    if (p.address || p.city) {
      const addr = [p.address, p.city].filter(Boolean).join(', ');
      rows.push(`<div class="detail-row"><i class="fas fa-map-marker-alt"></i><span>${addr}</span></div>`);
    }
    if (p.type) {
      rows.push(`<div class="detail-row"><i class="fas fa-building"></i><span>${p.type} Institution</span></div>`);
    }
    if (p.degrees) {
      rows.push(`<div class="detail-row"><i class="fas fa-graduation-cap"></i><span>${p.degrees}</span></div>`);
    }
    if (p.largest_program) {
      rows.push(`<div class="detail-row"><i class="fas fa-star"></i><span>${p.largest_program}</span></div>`);
    }
    if (p.phone) {
      rows.push(`<div class="detail-row"><i class="fas fa-phone"></i><span>${p.phone}</span></div>`);
    }

    const links = [];
    if (p.website) {
      links.push(`<a href="${p.website}" target="_blank" rel="noopener noreferrer" class="btn-link"><i class="fas fa-globe"></i> Website</a>`);
    }
    if (p.wikipedia) {
      links.push(`<a href="${p.wikipedia}" target="_blank" rel="noopener noreferrer" class="btn-link btn-secondary"><i class="fab fa-wikipedia-w"></i> Wikipedia</a>`);
    }

    const campusLine = p.campus ? `<p class="campus">${p.campus}</p>` : '';

    return `
      <div class="custom-popup university-popup">
        <div class="popup-header">
          <div class="category-badge" style="background:${catColor}">${p.category}</div>
          <h3>${p.name}</h3>
          ${campusLine}
        </div>
        <div class="popup-body">${rows.join('')}</div>
        ${links.length ? `<div class="popup-footer">${links.join('')}</div>` : ''}
      </div>`;
  }

  /* ───── MBTA Station Popup ───── */

  function stationPopupHTML(p) {
    const lines = (p.LINE || '').split('/');
    const badges = lines.map(l => {
      const color = CONFIG.mbtaColors[l.trim()] || '#7C878E';
      const label = CONFIG.mbtaLabels[l.trim()] || l.trim() + ' Line';
      return `<span class="line-badge" style="background:${color}">${label}</span>`;
    }).join(' ');

    return `
      <div class="custom-popup station-popup">
        <div class="popup-header">
          <h3><i class="fas fa-subway"></i> ${p.STATION}</h3>
          <div class="line-badges">${badges}</div>
        </div>
        <div class="popup-body"><p>MBTA Rapid Transit Station</p></div>
      </div>`;
  }

  /* ───── MBTA Line Popup ───── */

  function linePopupHTML(p) {
    const color = CONFIG.mbtaColors[p.LINE] || '#7C878E';
    const label = CONFIG.mbtaLabels[p.LINE] || p.LINE;
    return `
      <div class="custom-popup line-popup">
        <h3 style="color:${color}"><i class="fas fa-train-subway"></i> ${label}</h3>
        <p>Route: ${p.ROUTE || 'MBTA Rapid Transit'}</p>
      </div>`;
  }

  /* ───── Create layers ───── */

  /**
   * Build all map layers from loaded GeoJSON data.
   * @param {L.Map} map
   * @param {object} data — { colleges, mbtaStations, mbtaLines, bostonBoundary }
   */
  function create(map, data) {
    _collegesData = data.colleges;
    _mbtaStationsData = data.mbtaStations;
    _mbtaLinesData = data.mbtaLines;

    // ── Boston boundary ──
    boundaryLayer = L.geoJSON(data.bostonBoundary, {
      style: {
        color: '#1A1A2E',
        weight: 2,
        fillColor: 'rgba(164,30,34,0.02)',
        fillOpacity: 0.3,
        dashArray: '6 3'
      }
    }).addTo(map);

    // ── MBTA Lines ──
    mbtaLineLayer = L.geoJSON(data.mbtaLines, {
      style: feature => ({
        color: CONFIG.mbtaColors[feature.properties.LINE] || '#7C878E',
        weight: 3,
        opacity: 0.85
      }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(linePopupHTML(feature.properties), {
          className: 'leaflet-popup-custom',
          maxWidth: 260
        });
      }
    }).addTo(map);

    // ── MBTA Stations ──
    mbtaStationLayer = L.geoJSON(data.mbtaStations, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 4,
          fillColor: '#FFFFFF',
          fillOpacity: 0.95,
          color: '#555',
          weight: 1.5
        }),
      onEachFeature: (feature, layer) => {
        layer.bindPopup(stationPopupHTML(feature.properties), {
          className: 'leaflet-popup-custom',
          maxWidth: 280
        });
      }
    }).addTo(map);

    // ── Universities ──
    universityMarkers = [];
    universityLayer = L.geoJSON(data.colleges, {
      pointToLayer: (feature, latlng) => {
        const cat = feature.properties.category;
        const r = CONFIG.markerRadius[cat] || CONFIG.markerRadius.default;
        const color = CONFIG.categoryColors[cat] || '#6C757D';

        const marker = L.circleMarker(latlng, {
          radius: r,
          fillColor: color,
          fillOpacity: 0.9,
          color: '#FFFFFF',
          weight: 1.5,
          className: 'university-marker'
        });

        // Store reference
        marker._collegeProps = feature.properties;
        marker._collegeCoords = latlng;
        universityMarkers.push(marker);

        return marker;
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(universityPopupHTML(feature.properties), {
          className: 'leaflet-popup-custom',
          maxWidth: 320
        });
      }
    }).addTo(map);

    console.log('📍 All layers created and added to map.');
  }

  /* ───── Layer visibility toggles ───── */

  function toggleLayer(map, layerName, visible) {
    const layerMap = {
      universities: universityLayer,
      mbtaStations: mbtaStationLayer,
      mbtaLines: mbtaLineLayer,
      boundary: boundaryLayer
    };
    const layer = layerMap[layerName];
    if (!layer) return;
    if (visible) {
      if (!map.hasLayer(layer)) map.addLayer(layer);
    } else {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    }
  }

  /* ───── Category filter ───── */

  /**
   * Show only markers whose category is in the active set.
   * @param {Set<string>} activeCategories
   */
  function filterByCategory(activeCategories) {
    universityMarkers.forEach(marker => {
      const cat = marker._collegeProps.category;
      const el = marker.getElement && marker.getElement();
      if (activeCategories.has(cat)) {
        marker.setStyle({ fillOpacity: 0.9, opacity: 1 });
        if (el) el.style.pointerEvents = 'auto';
        marker._filtered = false;
      } else {
        marker.setStyle({ fillOpacity: 0, opacity: 0 });
        if (el) el.style.pointerEvents = 'none';
        marker._filtered = true;
      }
    });
  }

  /**
   * Highlight universities inside buffer.
   */
  function highlightInBuffer(insideSet) {
    universityMarkers.forEach(marker => {
      if (marker._filtered) return;
      if (insideSet.has(marker)) {
        marker.setStyle({ weight: 2.5, color: '#FFD700' });
        marker.setRadius((CONFIG.markerRadius[marker._collegeProps.category] || CONFIG.markerRadius.default) + 2);
      } else {
        marker.setStyle({ weight: 1.5, color: '#FFFFFF' });
        marker.setRadius(CONFIG.markerRadius[marker._collegeProps.category] || CONFIG.markerRadius.default);
      }
    });
  }

  function resetHighlight() {
    universityMarkers.forEach(marker => {
      if (marker._filtered) return;
      marker.setStyle({ weight: 1.5, color: '#FFFFFF' });
      marker.setRadius(CONFIG.markerRadius[marker._collegeProps.category] || CONFIG.markerRadius.default);
    });
  }

  /* ───── Getters ───── */
  function getUniversityMarkers()  { return universityMarkers; }
  function getCollegesData()       { return _collegesData; }
  function getMbtaStationsData()   { return _mbtaStationsData; }
  function getMbtaLinesData()      { return _mbtaLinesData; }

  return {
    create,
    toggleLayer,
    filterByCategory,
    highlightInBuffer,
    resetHighlight,
    getUniversityMarkers,
    getCollegesData,
    getMbtaStationsData,
    getMbtaLinesData
  };
})();
