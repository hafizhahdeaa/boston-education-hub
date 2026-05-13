/**
 * map-init.js — Boston Education Hub
 * Initialises the Leaflet map instance, sets default view and basemap.
 */

const MapInit = (() => {
  let map = null;
  let baseLayers = {};
  let currentBasemap = 'osm';

  /**
   * Create the Leaflet map and attach it to the #map element.
   * @returns {L.Map}
   */
  function init() {
    const c = CONFIG.map;

    map = L.map('map', {
      center: c.center,
      zoom: c.zoom,
      minZoom: c.minZoom,
      maxZoom: c.maxZoom,
      zoomControl: false,        // We'll add a custom position
      attributionControl: true
    });

    // Zoom control — bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Scale bar
    L.control.scale({ position: 'bottomleft', metric: true, imperial: true }).addTo(map);

    // Create basemap tile layers
    Object.entries(CONFIG.basemaps).forEach(([key, cfg]) => {
      baseLayers[key] = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        maxZoom: 19
      });
    });

    // Set default basemap
    baseLayers.osm.addTo(map);

    console.log('🗺️ Map initialised at', c.center, 'zoom', c.zoom);
    return map;
  }

  /**
   * Switch the active basemap.
   * @param {string} key — 'osm' | 'positron' | 'darkMatter'
   */
  function setBasemap(key) {
    if (!baseLayers[key]) return;
    // Remove current
    if (baseLayers[currentBasemap]) map.removeLayer(baseLayers[currentBasemap]);
    baseLayers[key].addTo(map);
    currentBasemap = key;
    console.log('🗺️ Basemap changed to', key);
  }

  /**
   * @returns {L.Map}
   */
  function getMap() {
    return map;
  }

  return { init, setBasemap, getMap };
})();
