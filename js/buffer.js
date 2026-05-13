/**
 * buffer.js — Boston Education Hub
 * Generates 500m buffers around MBTA stations using Turf.js
 * and identifies universities within transit accessibility zones.
 */

const BufferAnalysis = (() => {
  let _bufferLayer = null;
  let _active = false;

  /**
   * Toggle the 500m buffer overlay on/off.
   * @param {L.Map} map
   * @param {boolean} show
   */
  function toggle(map, show) {
    if (show) {
      _active = true;
      createBuffer(map);
    } else {
      _active = false;
      removeBuffer(map);
      Layers.resetHighlight();
    }
  }

  /**
   * Create 500m buffer polygons around all MBTA stations
   * and highlight universities that fall inside.
   */
  function createBuffer(map) {
    const stationsData = Layers.getMbtaStationsData();
    if (!stationsData) return;

    console.log('🎯 Generating 500m station buffers…');

    // Generate individual buffers
    const buffers = [];
    stationsData.features.forEach(station => {
      const coords = station.geometry.coordinates;
      const pt = turf.point(coords);
      try {
        const buffered = turf.buffer(pt, CONFIG.buffer.radius, {
          units: CONFIG.buffer.units
        });
        if (buffered) buffers.push(buffered);
      } catch (e) {
        // Skip invalid points
      }
    });

    // Combine all buffers into a single FeatureCollection
    const combined = turf.featureCollection(buffers);

    // Remove existing buffer layer
    if (_bufferLayer) {
      map.removeLayer(_bufferLayer);
    }

    // Add buffer layer to map
    _bufferLayer = L.geoJSON(combined, {
      style: {
        color: '#A41E22',
        weight: 0.5,
        fillColor: '#A41E22',
        fillOpacity: 0.08,
        opacity: 0.3
      },
      interactive: false
    }).addTo(map);

    // Move buffer below markers by setting zIndex
    if (_bufferLayer.setZIndex) _bufferLayer.setZIndex(200);

    // Find universities inside buffers
    const insideSet = new Set();
    const markers = Layers.getUniversityMarkers();

    markers.forEach(marker => {
      const latlng = marker._collegeCoords;
      const pt = turf.point([latlng.lng, latlng.lat]);

      const isInside = buffers.some(buf => {
        try {
          return turf.booleanPointInPolygon(pt, buf);
        } catch (e) {
          return false;
        }
      });

      if (isInside) insideSet.add(marker);
    });

    // Highlight
    Layers.highlightInBuffer(insideSet);

    console.log(`✅ Buffer analysis: ${insideSet.size} / ${markers.length} universities within 500m of subway`);

    // Update analytics
    Analytics.update(Controls.getActiveCategories());
  }

  /**
   * Remove the buffer layer from the map.
   */
  function removeBuffer(map) {
    if (_bufferLayer) {
      map.removeLayer(_bufferLayer);
      _bufferLayer = null;
    }
    Analytics.update(Controls.getActiveCategories());
  }

  /**
   * Check if buffer analysis is currently active.
   */
  function isActive() {
    return _active;
  }

  return { toggle, isActive };
})();
