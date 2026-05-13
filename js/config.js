/**
 * config.js — Boston Education Hub
 * Central configuration file for all constants, colors, and initial settings.
 * @author Hafizhah Dea Az Zahrah – 1232002059
 */

const CONFIG = {
  /* ───── Map initial view ───── */
  map: {
    center: [42.3601, -71.0589],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18
  },

  /* ───── GeoJSON data paths ───── */
  dataPaths: {
    colleges: 'data/colleges.geojson',
    mbtaStations: 'data/mbta_stations.geojson',
    mbtaLines: 'data/mbta_lines.geojson',
    bostonBoundary: 'data/boston_boundary.geojson'
  },

  /* ───── Buffer analysis ───── */
  buffer: {
    radius: 0.5,         // km
    units: 'kilometers'
  },

  /* ───── Heatmap defaults ───── */
  heatmap: {
    radius: 30,
    blur: 25,
    maxZoom: 15,
    max: 1.0
  },

  /* ───── University category colours ───── */
  categoryColors: {
    'Research University':       '#A41E22',
    'Medical School':            '#582C83',
    'State University':          '#00457C',
    'Liberal Arts College':      '#C5A572',
    'Performing Arts College':   '#D63384',
    'Other Higher Education':    '#6C757D'
  },

  /* ───── Category icons (Font Awesome class) ───── */
  categoryIcons: {
    'Research University':       'fa-university',
    'Medical School':            'fa-staff-snake',
    'State University':          'fa-building-columns',
    'Liberal Arts College':      'fa-book-open',
    'Performing Arts College':   'fa-music',
    'Other Higher Education':    'fa-school'
  },

  /* ───── University marker sizes (radius in px) ───── */
  markerRadius: {
    'Research University': 8,
    default: 6
  },

  /* ───── MBTA line colours (official) ───── */
  mbtaColors: {
    'RED':    '#DA291C',
    'BLUE':   '#003DA5',
    'GREEN':  '#00843D',
    'ORANGE': '#ED8B00',
    'SILVER': '#7C878E'
  },

  /* ───── MBTA line human-readable labels ───── */
  mbtaLabels: {
    'RED':    'Red Line',
    'BLUE':   'Blue Line',
    'GREEN':  'Green Line',
    'ORANGE': 'Orange Line',
    'SILVER': 'Silver Line'
  },

  /* ───── Basemaps ───── */
  basemaps: {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    positron: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
    },
    darkMatter: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
    }
  },

  /* ───── EPSG:26986 → WGS84 conversion constants ───── */
  proj: {
    // NAD83 / Massachusetts Mainland (meters)
    // Using simplified affine approximation for the Boston area.
    // These constants are derived from the PROJ definition of EPSG:26986.
    falseEasting: 200000,
    falseNorthing: 750000,
    centralMeridian: -71.5,
    latOrigin: 41.0,
    scaleFactor: 0.99998,
    // We'll use the full Lambert Conformal Conic math in data-loader.
    stdParallel1: 41.71666666666667,
    stdParallel2: 42.68333333333333,
    a: 6378137.0,            // GRS80 semi-major axis
    f: 1 / 298.257222101     // GRS80 flattening
  }
};
