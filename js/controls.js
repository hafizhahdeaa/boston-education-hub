/**
 * controls.js — Boston Education Hub
 * Handles all UI controls: search autocomplete, category filter,
 * layer toggles, basemap selector, sidebar collapse, about modal.
 */

const Controls = (() => {
  let _map = null;
  let _activeCategories = new Set();
  let _debounceTimer = null;

  /**
   * Initialise all UI controls.
   * @param {L.Map} map
   */
  function init(map) {
    _map = map;

    // Populate category filter checkboxes
    initCategoryFilter();

    // Bind layer toggles
    initLayerToggles();

    // Bind basemap radios
    initBasemapSelector();

    // Bind search
    initSearch();

    // Sidebar toggle for mobile
    initSidebarToggle();

    // About modal
    initAboutModal();

    // Right panel toggle for tablet
    initRightPanelToggle();
  }

  /* ═══════════════════════════════════════════
   * CATEGORY FILTER
   * ═══════════════════════════════════════════ */

  function initCategoryFilter() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    const categories = Object.keys(CONFIG.categoryColors);

    // Initialise all active
    categories.forEach(cat => _activeCategories.add(cat));

    // Count colleges per category
    const counts = {};
    categories.forEach(cat => { counts[cat] = 0; });

    const markers = Layers.getUniversityMarkers();
    markers.forEach(m => {
      const c = m._collegeProps.category;
      if (counts[c] !== undefined) counts[c]++;
    });

    // Render checkboxes
    container.innerHTML = categories.map(cat => {
      const color = CONFIG.categoryColors[cat];
      const icon  = CONFIG.categoryIcons[cat] || 'fa-school';
      return `
        <label class="category-checkbox" data-category="${cat}">
          <input type="checkbox" checked value="${cat}" />
          <span class="cat-dot" style="background:${color}"></span>
          <span class="cat-label">${cat}</span>
          <span class="cat-count">${counts[cat]}</span>
        </label>`;
    }).join('');

    // Bind change events
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          _activeCategories.add(cb.value);
        } else {
          _activeCategories.delete(cb.value);
        }
        Layers.filterByCategory(_activeCategories);
        Analytics.update(_activeCategories);
      });
    });

    // Select All / Clear All buttons
    document.getElementById('btn-select-all')?.addEventListener('click', () => {
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
        _activeCategories.add(cb.value);
      });
      Layers.filterByCategory(_activeCategories);
      Analytics.update(_activeCategories);
    });

    document.getElementById('btn-clear-all')?.addEventListener('click', () => {
      container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        _activeCategories.delete(cb.value);
      });
      Layers.filterByCategory(_activeCategories);
      Analytics.update(_activeCategories);
    });
  }

  /* ═══════════════════════════════════════════
   * LAYER TOGGLES
   * ═══════════════════════════════════════════ */

  function initLayerToggles() {
    const toggles = {
      'toggle-universities': 'universities',
      'toggle-stations':     'mbtaStations',
      'toggle-lines':        'mbtaLines',
      'toggle-boundary':     'boundary',
      'toggle-heatmap':      'heatmap',
      'toggle-buffer':       'buffer'
    };

    Object.entries(toggles).forEach(([id, layerKey]) => {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener('change', () => {
        if (layerKey === 'heatmap') {
          Heatmap.toggle(_map, el.checked);
        } else if (layerKey === 'buffer') {
          BufferAnalysis.toggle(_map, el.checked);
        } else {
          Layers.toggleLayer(_map, layerKey, el.checked);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════
   * BASEMAP SELECTOR
   * ═══════════════════════════════════════════ */

  function initBasemapSelector() {
    document.querySelectorAll('input[name="basemap"]').forEach(radio => {
      radio.addEventListener('change', () => {
        MapInit.setBasemap(radio.value);
      });
    });
  }

  /* ═══════════════════════════════════════════
   * SEARCH AUTOCOMPLETE
   * ═══════════════════════════════════════════ */

  function initSearch() {
    const input    = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => {
        const query = input.value.trim().toLowerCase();
        if (query.length < 2) {
          dropdown.classList.remove('visible');
          dropdown.innerHTML = '';
          return;
        }

        const markers = Layers.getUniversityMarkers();
        const matches = markers
          .filter(m => {
            const name = (m._collegeProps.name || '').toLowerCase();
            const campus = (m._collegeProps.campus || '').toLowerCase();
            return name.includes(query) || campus.includes(query);
          })
          .slice(0, 5);

        if (matches.length === 0) {
          dropdown.innerHTML = '<div class="search-item no-result">No results found</div>';
          dropdown.classList.add('visible');
          return;
        }

        dropdown.innerHTML = matches.map((m, i) => {
          const p = m._collegeProps;
          const color = CONFIG.categoryColors[p.category] || '#6C757D';
          const displayName = p.campus ? `${p.name} — ${p.campus}` : p.name;
          return `<div class="search-item" data-index="${i}">
            <span class="search-dot" style="background:${color}"></span>
            <div class="search-info">
              <span class="search-name">${displayName}</span>
              <span class="search-category">${p.category}</span>
            </div>
          </div>`;
        }).join('');

        // Bind click
        dropdown.querySelectorAll('.search-item').forEach(el => {
          el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index);
            const marker = matches[idx];
            if (marker) {
              _map.setView(marker._collegeCoords, 16, { animate: true });
              marker.openPopup();
            }
            dropdown.classList.remove('visible');
            input.value = '';
          });
        });

        dropdown.classList.add('visible');
      }, 300);
    });

    // Close dropdown on click outside
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('visible');
      }
    });

    // Close on Escape
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('visible');
        input.blur();
      }
    });
  }

  /* ═══════════════════════════════════════════
   * SIDEBAR / MOBILE TOGGLE
   * ═══════════════════════════════════════════ */

  function initSidebarToggle() {
    const btn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('left-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (btn && sidebar) {
      btn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay?.classList.toggle('visible');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        overlay.classList.remove('visible');
      });
    }
  }

  /* ═══════════════════════════════════════════
   * RIGHT PANEL TOGGLE (tablet)
   * ═══════════════════════════════════════════ */

  function initRightPanelToggle() {
    const btn = document.getElementById('stats-toggle');
    const panel = document.getElementById('right-panel');
    if (btn && panel) {
      btn.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
    }
  }

  /* ═══════════════════════════════════════════
   * ABOUT MODAL
   * ═══════════════════════════════════════════ */

  function initAboutModal() {
    const openBtn  = document.getElementById('about-btn');
    const modal    = document.getElementById('about-modal');
    const closeBtn = document.getElementById('modal-close');

    if (openBtn && modal) {
      openBtn.addEventListener('click', e => {
        e.preventDefault();
        modal.classList.add('visible');
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('visible'));
    }
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('visible');
      });
    }
  }

  /* ═══════════════════════════════════════════
   * COLLAPSIBLE SECTIONS
   * ═══════════════════════════════════════════ */

  function initCollapsible() {
    document.querySelectorAll('.sidebar-section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.sidebar-section');
        section?.classList.toggle('collapsed');
      });
    });
  }

  /**
   * Get currently active category set.
   */
  function getActiveCategories() {
    return _activeCategories;
  }

  return { init, initCollapsible, getActiveCategories };
})();
