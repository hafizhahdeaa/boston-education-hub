/**
 * data-loader.js — Boston Education Hub
 * Asynchronously loads all GeoJSON datasets and reprojects MBTA data
 * from EPSG:26986 (Massachusetts State Plane NAD83 meters) to WGS84.
 */

const DataLoader = (() => {

  /* ───────────────────────────────────────────────
   * Lambert Conformal Conic (2SP) inverse projection
   * EPSG:26986 → WGS84
   * Implements the exact PROJ formulas for LCC 2SP.
   * ─────────────────────────────────────────────── */

  /**
   * Convert EPSG:26986 (x, y) in metres to [longitude, latitude] in degrees.
   * @param {number} x — Easting in metres
   * @param {number} y — Northing in metres
   * @returns {number[]} [lng, lat]
   */
  function epsg26986ToWgs84(x, y) {
    const p = CONFIG.proj;
    const a   = p.a;
    const f   = p.f;
    const e   = Math.sqrt(2 * f - f * f);
    const e2  = e * e;

    const phi1 = p.stdParallel1 * Math.PI / 180;
    const phi2 = p.stdParallel2 * Math.PI / 180;
    const phi0 = p.latOrigin    * Math.PI / 180;
    const lam0 = p.centralMeridian * Math.PI / 180;
    const FE   = p.falseEasting;
    const FN   = p.falseNorthing;

    function mCalc(phi) {
      const sinPhi = Math.sin(phi);
      return Math.cos(phi) / Math.sqrt(1 - e2 * sinPhi * sinPhi);
    }
    function tCalc(phi) {
      const sinPhi = Math.sin(phi);
      return Math.tan(Math.PI / 4 - phi / 2) /
             Math.pow((1 - e * sinPhi) / (1 + e * sinPhi), e / 2);
    }

    const m1 = mCalc(phi1);
    const m2 = mCalc(phi2);
    const t0 = tCalc(phi0);
    const t1 = tCalc(phi1);
    const t2 = tCalc(phi2);

    const n  = (Math.log(m1) - Math.log(m2)) / (Math.log(t1) - Math.log(t2));
    const F  = m1 / (n * Math.pow(t1, n));
    const rho0 = a * F * Math.pow(t0, n);

    // Inverse
    const xShift = x - FE;
    const yShift = rho0 - (y - FN);
    const rho    = Math.sign(n) * Math.sqrt(xShift * xShift + yShift * yShift);
    const theta  = Math.atan2(xShift, yShift);

    const t = Math.pow(rho / (a * F), 1 / n);
    const lam = theta / n + lam0;

    // Iterative solution for latitude
    let phi = Math.PI / 2 - 2 * Math.atan(t);
    for (let i = 0; i < 15; i++) {
      const sinPhi = Math.sin(phi);
      const phiNew = Math.PI / 2 - 2 * Math.atan(
        t * Math.pow((1 - e * sinPhi) / (1 + e * sinPhi), e / 2)
      );
      if (Math.abs(phiNew - phi) < 1e-12) break;
      phi = phiNew;
    }

    return [lam * 180 / Math.PI, phi * 180 / Math.PI];
  }

  /**
   * Recursively reproject all coordinate arrays in a GeoJSON geometry
   * from EPSG:26986 to WGS84.
   */
  function reprojectCoords(coords) {
    if (typeof coords[0] === 'number') {
      // Leaf coordinate pair [x, y]
      return epsg26986ToWgs84(coords[0], coords[1]);
    }
    return coords.map(c => reprojectCoords(c));
  }

  /**
   * Reproject an entire GeoJSON FeatureCollection in place.
   */
  function reprojectGeoJSON(geojson) {
    geojson.features.forEach(feature => {
      feature.geometry.coordinates = reprojectCoords(feature.geometry.coordinates);
    });
    // Remove the CRS property (Leaflet assumes WGS84)
    delete geojson.crs;
    return geojson;
  }

  /* ───────────────────────────────────────────────
   * Data loading
   * ─────────────────────────────────────────────── */

  /**
   * Fetch a single GeoJSON file. Returns the parsed object.
   * @param {string} path
   * @returns {Promise<object>}
   */
  async function fetchGeoJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
    return res.json();
  }

  /**
   * Load all four datasets concurrently.
   * MBTA datasets are reprojected from EPSG:26986 → WGS84.
   * @returns {Promise<{colleges, mbtaStations, mbtaLines, bostonBoundary}>}
   */
  async function loadAll() {
    const paths = CONFIG.dataPaths;

    const [colleges, mbtaStations, mbtaLines, bostonBoundary] = await Promise.all([
      fetchGeoJSON(paths.colleges),
      fetchGeoJSON(paths.mbtaStations),
      fetchGeoJSON(paths.mbtaLines),
      fetchGeoJSON(paths.bostonBoundary)
    ]);

    // Reproject MBTA data (State Plane → WGS84)
    console.log('⏳ Reprojecting MBTA data from EPSG:26986 to WGS84…');
    reprojectGeoJSON(mbtaStations);
    reprojectGeoJSON(mbtaLines);
    console.log('✅ Reprojection complete.');

    console.log(`📊 Loaded ${colleges.features.length} universities`);
    console.log(`🚇 Loaded ${mbtaStations.features.length} MBTA stations`);
    console.log(`🛤️  Loaded ${mbtaLines.features.length} MBTA line segments`);

    return { colleges, mbtaStations, mbtaLines, bostonBoundary };
  }

  // Public API
  return { loadAll };
})();
