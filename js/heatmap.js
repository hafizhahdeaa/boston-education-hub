/**
 * heatmap.js — Boston Education Hub
 * Creates a Leaflet.heat heatmap layer showing university density.
 */

const Heatmap = (() => {
  let _heatLayer = null;

  /**
   * Toggle heatmap layer on/off.
   * @param {L.Map} map
   * @param {boolean} show
   */
  function toggle(map, show) {
    if (show) {
      create(map);
    } else {
      remove(map);
    }
  }

  /**
   * Create the heatmap layer from university locations.
   */
  function create(map) {
    if (_heatLayer) {
      map.removeLayer(_heatLayer);
    }

    const markers = Layers.getUniversityMarkers();
    const points = markers.map(m => {
      const ll = m._collegeCoords;
      // weight = 1 (uniform), heavier for research universities
      const weight = m._collegeProps.category === 'Research University' ? 1.5 : 1;
      return [ll.lat, ll.lng, weight];
    });

    _heatLayer = L.heatLayer(points, {
      radius: CONFIG.heatmap.radius,
      blur:   CONFIG.heatmap.blur,
      maxZoom: CONFIG.heatmap.maxZoom,
      max:    CONFIG.heatmap.max,
      gradient: {
        0.2: '#FFE5E5',
        0.4: '#FFAAAA',
        0.6: '#E05555',
        0.8: '#C8474B',
        1.0: '#A41E22'
      }
    }).addTo(map);

    console.log('🌡️ Heatmap enabled');
  }

  /**
   * Remove the heatmap layer.
   */
  function remove(map) {
    if (_heatLayer) {
      map.removeLayer(_heatLayer);
      _heatLayer = null;
    }
    console.log('🌡️ Heatmap disabled');
  }

  return { toggle };
})();
