const STYLE_ID = 'yt-blocker-style';
const PANEL_ID = 'yt-block-controls';
const SHORTS_MARK = 'data-yt-shorts-hidden';

const SHORTS_HIDE_RULES = `
/* Hide elements explicitly labeled or linked to Shorts (case-insensitive) */
[aria-label*="shorts" i],
[title*="shorts" i],
a[aria-label*="shorts" i],
a[title*="shorts" i],
a[href*="/shorts" i],
a[href*="shorts" i],
tp-yt-paper-tab[aria-label*="shorts" i],
tp-yt-paper-tab[title*="shorts" i],

/* Known container patterns that include Shorts items */
ytd-rich-item-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-rich-grid-media:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-rich-grid-slim-media:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-rich-shelf-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-reel-shelf-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-carousel-video-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-compact-video-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-grid-video-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-video-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-playlist-video-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}),
ytd-shelf-renderer:has(a[href*="/shorts"]):not(#${PANEL_ID}) {
  display: none !important;
}
/* Fallback: hide any direct shorts links */
a[href*="/shorts" i],
a[href*="shorts" i] {
  display: none !important;
}
`;

const ADS_HIDE_RULES = `
/* Hide all player ad modules */
.ytp-ad-module,
.ytp-ad-player-overlay,
.ytp-ad-overlay-slot,
.ytp-ad-text,
.ytp-ad-preview-text,
.ytp-ad-region,
.ytp-ad-progress,
.ytp-ad-progress-bar,
.ytp-ad-player-overlay-instream-container,
.ytp-ad-player-overlay-skippable-container,
.ytp-ad-skip-button-modern,
.ytp-ad-skip-button,
.ytp-ad-text-overlay,
.ytp-ad-player,
.ytp-ad-action-interstitial,
.ytp-ad-image,
.ytp-ad-creative-container,
.ytp-ad-overlay,
.ytp-ad-metadata-container,
.ytp-ad-button,
.ytp-ad-hover-container,
#player-ads,
.video-ads,
.advertisement,

/* Hide all YouTube ad renderers and sponsored content */
ytd-display-ad-renderer,
ytd-promoted-sparkles-text-search-renderer,
ytd-promoted-video-renderer,
ytd-compact-promoted-video-renderer,
ytd-promo-renderer,
ytd-mealbar-promo-renderer,
ytd-banner-promo-renderer,
ytd-promo-video-renderer,
ytd-companion-slot-renderer,

/* Hide ad containers and spans */
.ad-container,
.ads-container,
[data-ad-container],
[data-is-ad="true"],
.yt-simple-endpoint[href*="/ads"],
.ytp-ad-text span,
.ytp-ad-preview-text span {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  width: 0 !important;
  pointer-events: none !important;
  overflow: hidden !important;
}

/* Hide ad iframes */
iframe[src*="ads"],
iframe[src*="doubleclick"],
iframe[src*="googlesyndication"],
iframe[title*="ad" i] {
  display: none !important;
}
`;


let adsEnabled = true;
let shortsEnabled = true;

function createStyleElement() {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head?.appendChild(style);
  }
  return style;
}

function updateStyleRules() {
  const style = createStyleElement();
  let rules = '';
  if (shortsEnabled) {
    rules += SHORTS_HIDE_RULES;
  }
  if (adsEnabled) {
    rules += ADS_HIDE_RULES;
  }
  style.textContent = rules;
}

// Additional JS-based removal for UI elements where CSS selectors fail
function removeShortsByText() {
  if (!shortsEnabled) return;

  // Primary approach: Find all links pointing to /shorts/ and remove their containers
  try {
    document.querySelectorAll('a').forEach(link => {
      try {
        const href = link.getAttribute('href') || '';
        // Check if link goes to /shorts/ (the actual shorts video path)
        if (href.includes('/shorts/') || href.startsWith('/shorts')) {
          const containers = [
            'ytd-video-renderer',
            'ytd-rich-item-renderer',
            'ytd-rich-grid-media',
            'ytd-rich-grid-slim-media',
            'ytd-compact-video-renderer',
            'ytd-grid-video-renderer',
            'ytd-shelf-renderer',
            'ytd-rich-shelf-renderer',
            'ytd-reel-shelf-renderer',
            'ytd-carousel-video-renderer'
          ];
          
          let removed = false;
          for (const containerName of containers) {
            const container = link.closest(containerName);
            if (container) {
              hideShortsElement(container);
              removed = true;
              break;
            }
          }
          // If no container found, remove the link itself
          if (!removed) {
            hideShortsElement(link);
          }
        }
      } catch (e) {}
    });
  } catch (e) {}

  // Secondary: Remove shorts navigation items (Shorts tab, Shorts section in sidebar)
  try {
    document.querySelectorAll('[aria-label*="shorts" i], [title*="shorts" i]').forEach(el => {
      try {
        // For navigation/UI elements, check if they're actually navigation items
        const selector = el.tagName.toLowerCase();
        if (['tp-yt-paper-tab', 'ytd-guide-entry-renderer', 'ytd-mini-guide-entry-renderer', 'a'].includes(selector)) {
          hideShortsElement(el);
        }
      } catch (e) {}
    });
  } catch (e) {}
}

// Aggressive ad removal - actually remove ads from DOM
function removeAdsByJS() {
  if (!adsEnabled) return;

  try {
    // Remove player ad elements completely
    const playerAdSelectors = [
      '.ytp-ad-module',
      '.ytp-ad-player-overlay',
      '.ytp-ad-overlay-slot',
      '.ytp-ad-text',
      '.ytp-ad-preview-text',
      '.ytp-ad-region',
      '.ytp-ad-progress',
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-skip-button',
      '.ytp-ad-text-overlay',
      '.ytp-ad-player',
      '.ytp-ad-action-interstitial',
      '.ytp-ad-image',
      '.ytp-ad-creative-container',
      '.ytp-ad-overlay',
      '.ytp-ad-metadata-container',
      '.ytp-ad-button',
      '.ytp-ad-hover-container',
      '#player-ads',
      '.video-ads',
      '.ytp-ad-progress-bar',
      '.ytp-ad-player-overlay-instream-container',
      '.ytp-ad-player-overlay-skippable-container'
    ];

    playerAdSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          try {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.remove();
          } catch (e) {}
        });
      } catch (e) {}
    });

    // Remove YouTube YTD ad renderers completely
    const ytdAdSelectors = [
      'ytd-display-ad-renderer',
      'ytd-promoted-sparkles-text-search-renderer',
      'ytd-promoted-video-renderer',
      'ytd-compact-promoted-video-renderer',
      'ytd-promo-renderer',
      'ytd-mealbar-promo-renderer',
      'ytd-banner-promo-renderer',
      'ytd-promo-video-renderer',
      'ytd-companion-slot-renderer'
    ];

    ytdAdSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          try {
            el.style.setProperty('display', 'none', 'important');
            el.remove();
          } catch (e) {}
        });
      } catch (e) {}
    });

    // Try to skip ads
    try {
      const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, button[aria-label="Skip ad"]');
      if (skipButton && skipButton.offsetParent !== null) {
        skipButton.click();
      }
    } catch (e) {}

    // Remove elements with ad-related attributes
    try {
      const adElements = document.querySelectorAll('[data-ad-container], [data-is-ad="true"]');
      adElements.forEach(el => {
        try {
          el.style.setProperty('display', 'none', 'important');
          el.remove();
        } catch (e) {}
      });
    } catch (e) {}

    // Remove ad iframes
    try {
      const iframes = document.querySelectorAll('iframe[src*="ads"], iframe[src*="doubleclick"], iframe[src*="googlesyndication"]');
      iframes.forEach(iframe => {
        try {
          iframe.style.setProperty('display', 'none', 'important');
          iframe.remove();
        } catch (e) {}
      });
    } catch (e) {}

  } catch (e) {}
}

function hideShortsElement(el) {
  try {
    if (!el) return;
    el.style.setProperty('display', 'none', 'important');
    el.setAttribute(SHORTS_MARK, '1');
  } catch (e) {}
}

function restoreShortsHidden() {
  // Restore shorts by removing the display: none style
  try {
    // Find all elements marked as hidden and restore them
    document.querySelectorAll('[' + SHORTS_MARK + ']').forEach(el => {
      try {
        el.style.removeProperty('display');
        el.style.removeProperty('visibility');
        el.removeAttribute(SHORTS_MARK);
      } catch (e) {}
    });

    // Also check for any elements with /shorts/ links and restore them
    document.querySelectorAll('a[href*="/shorts"]').forEach(link => {
      try {
        const containers = [
          'ytd-video-renderer',
          'ytd-rich-item-renderer',
          'ytd-rich-grid-media',
          'ytd-rich-grid-slim-media',
          'ytd-compact-video-renderer',
          'ytd-grid-video-renderer',
          'ytd-shelf-renderer',
          'ytd-rich-shelf-renderer',
          'ytd-reel-shelf-renderer'
        ];
        
        for (const containerName of containers) {
          const container = link.closest(containerName);
          if (container) {
            container.style.removeProperty('display');
            container.style.removeProperty('visibility');
            container.removeAttribute(SHORTS_MARK);
            break;
          }
        }
      } catch (e) {}
    });

    // Restore navigation items
    document.querySelectorAll('[aria-label*="shorts" i], [title*="shorts" i]').forEach(el => {
      try {
        const selector = el.tagName.toLowerCase();
        if (['tp-yt-paper-tab', 'ytd-guide-entry-renderer', 'ytd-mini-guide-entry-renderer', 'a'].includes(selector)) {
          el.style.removeProperty('display');
          el.style.removeProperty('visibility');
          el.removeAttribute(SHORTS_MARK);
        }
      } catch (e) {}
    });
  } catch (e) {}
}

// Refresh content to load new shorts when re-enabled
function refreshShortsContent() {
  try {
    // Scroll down and up to trigger YouTube's lazy loading
    const scrollAmount = 300;
    window.scrollBy(0, scrollAmount);
    setTimeout(() => {
      window.scrollBy(0, -scrollAmount);
    }, 100);
  } catch (e) {}
}

function observeShortsUI() {
  // Debounce helper to avoid excessive work
  function debounce(fn, wait) {
    let t = null;
    return function () {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        t = null;
        try { fn(); } catch (e) {}
      }, wait);
    };
  }

  const debouncedRemove = debounce(() => {
    removeShortsByText();
  }, 100);

  const targets = ['#guide', '#menu', '#header', '#columns', 'ytd-guide-renderer', 'ytd-app', 'ytd-page-manager', 'ytd-browse', 'ytd-watch-flexy'];
  const mo = new MutationObserver(records => {
    for (const r of records) {
      if (r.addedNodes && r.addedNodes.length) {
        debouncedRemove();
        break;
      }
    }
  });

  // Attach to known regions if present
  targets.forEach(sel => {
    try {
      const el = document.querySelector(sel);
      if (el) mo.observe(el, { childList: true, subtree: true });
    } catch (e) {}
  });

  // As a fallback observe body (lightweight debounced handler)
  try {
    if (document.body) mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  // Periodic scan for shorts - less frequent
  setInterval(() => {
    try {
      if (shortsEnabled) {
        removeShortsByText();
      }
    } catch (e) {}
  }, 2000);

  // Aggressive ad removal interval - runs very frequently to catch all ads
  setInterval(() => {
    try {
      if (adsEnabled) {
        removeAdsByJS();
      }
    } catch (e) {}
  }, 100);

  // Extra aggressive ad removal for video player
  setInterval(() => {
    try {
      if (adsEnabled) {
        removeAdsByJS();
      }
    } catch (e) {}
  }, 300);

  // Initial run
  removeShortsByText();
  removeAdsByJS();
  
  // Extra initial scans for ads
  setTimeout(() => { if (adsEnabled) removeAdsByJS(); }, 50);
  setTimeout(() => { if (adsEnabled) removeAdsByJS(); }, 150);
  setTimeout(() => { if (adsEnabled) removeAdsByJS(); }, 300);
}

function createToggleButton(options) {
  if (document.getElementById(options.id)) {
    return document.getElementById(options.id);
  }

  const button = document.createElement('button');
  button.id = options.id;
  button.textContent = `${options.label}: ${options.getState() ? 'ON' : 'OFF'}`;
  button.style.padding = '10px 14px';
  button.style.fontSize = '12px';
  button.style.borderRadius = '999px';
  button.style.border = 'none';
  button.style.background = options.getState() ? options.activeColor : options.inactiveColor;
  button.style.color = '#ffffff';
  button.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
  button.style.cursor = 'pointer';
  button.style.fontFamily = 'Arial, sans-serif';
  button.style.opacity = '0.92';
  button.style.transition = 'opacity 0.2s ease, transform 0.2s ease, background 0.2s ease';

  button.addEventListener('mouseenter', () => {
    button.style.opacity = '1';
    button.style.transform = 'translateY(-1px)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.opacity = '0.92';
    button.style.transform = 'translateY(0)';
  });

  button.addEventListener('click', () => {
    const nextState = !options.getState();
    options.setState(nextState);
    button.textContent = `${options.label}: ${nextState ? 'ON' : 'OFF'}`;
    button.style.background = nextState ? options.activeColor : options.inactiveColor;
    
    if (nextState && options.onActivate) {
      try { options.onActivate(); } catch (e) {}
    }
    if (!nextState && options.onDeactivate) {
      try { options.onDeactivate(); } catch (e) {}
    }
    
    // Update rules after state change callbacks
    updateStyleRules();
  });

  return button;
}

function createControlPanel() {
  if (document.getElementById(PANEL_ID)) {
    return;
  }

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.position = 'fixed';
  panel.style.bottom = '24px';
  panel.style.right = '24px';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.alignItems = 'flex-end';
  panel.style.gap = '10px';
  panel.style.zIndex = '999999';

  panel.appendChild(createToggleButton({
    id: 'yt-ad-block-toggle',
    label: 'Ad Block',
    activeColor: '#ff0000',
    inactiveColor: '#555555',
    getState: () => adsEnabled,
    setState: state => { adsEnabled = state; },
    onActivate: () => { removeAdsByJS(); },
    onDeactivate: () => { /* ads will show naturally when toggled off */ }
  }));

  panel.appendChild(createToggleButton({
    id: 'yt-shorts-block-toggle',
    label: 'Shorts Block',
    activeColor: '#0066cc',
    inactiveColor: '#555555',
    getState: () => shortsEnabled,
    setState: state => { shortsEnabled = state; },
    onActivate: () => { 
      removeShortsByText();
    },
    onDeactivate: () => { 
      restoreShortsHidden();
      setTimeout(() => {
        refreshShortsContent();
      }, 200);
    }
  }));

  document.body.appendChild(panel);
}

function onDocumentReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

onDocumentReady(() => {
  createControlPanel();
  updateStyleRules();
  observeShortsUI();

  // Add event listeners for video playback and page navigation
  document.addEventListener('play', () => {
    try {
      if (adsEnabled) {
        removeAdsByJS();
        setTimeout(() => { if (adsEnabled) removeAdsByJS(); }, 50);
      }
    } catch (e) {}
  }, true);

  // Listen for video player ready
  document.addEventListener('loadstart', () => {
    try {
      if (adsEnabled) {
        setTimeout(() => { if (adsEnabled) removeAdsByJS(); }, 100);
      }
    } catch (e) {}
  }, true);

  // Listen for URL changes (when navigating to a new video)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => {
        try {
          if (adsEnabled) {
            removeAdsByJS();
          }
        } catch (e) {}
      }, 100);
    }
  }).observe(document, { subtree: true, childList: true });

  // Immediate aggressive scan
  setTimeout(() => {
    if (adsEnabled) {
      removeAdsByJS();
    }
  }, 100);
});
