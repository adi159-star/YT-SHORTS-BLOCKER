const SHORTS_URL_FRAGMENT = '/shorts/';
const SHORTS_KEYWORD = 'shorts';
const TARGET_SELECTORS = [
  'ytd-rich-item-renderer',
  'ytd-video-renderer',
  'ytd-grid-video-renderer',
  'ytd-compact-video-renderer',
  'ytd-rich-grid-media',
  'ytd-rich-shelf-renderer',
  'ytd-reel-shelf-renderer',
  'ytd-carousel-video-renderer',
  'ytd-shelf-renderer',
  'ytd-rich-section-renderer',
  'ytd-rich-grid-renderer'
];
const SHORTS_LINK_SELECTORS = [
  'a[href*="/shorts/"]',
  'a[href*="shorts/"]',
  'a[href*="/shorts"]'
];
const AD_SELECTORS = [
  'ytd-display-ad-renderer',
  'ytd-promoted-sparkles-text-search-renderer',
  'ytd-promoted-video-renderer',
  'ytd-compact-promoted-video-renderer',
  'div.video-ads',
  'div.ytp-ad-module',
  '.ytp-ad-player-overlay',
  '.ytp-ad-overlay-slot',
  '.ytp-ad-text',
  '.ytp-ad-preview-text',
  '#player-ads',
  'ytd-promo-renderer',
  'ytd-mealbar-promo-renderer'
];
let adsEnabled = true;
let shortsEnabled = true;

function hideElement(el) {
  if (!el || el.hidden) {
    return;
  }
  el.style.setProperty('display', 'none', 'important');
  el.hidden = true;
}

function findContainer(el) {
  return el.closest(TARGET_SELECTORS.join(','));
}

function isShortsElement(element) {
  if (!element) {
    return false;
  }

  const text = element.textContent?.toLowerCase() || '';
  if (text.includes(SHORTS_KEYWORD)) {
    return true;
  }

  if (element.querySelector('a[href*="shorts"]')) {
    return true;
  }

  const href = element.getAttribute('href') || '';
  if (href.toLowerCase().includes('shorts')) {
    return true;
  }

  return false;
}

function hideShortsByAnchor() {
  document.querySelectorAll(SHORTS_LINK_SELECTORS.join(',')).forEach(anchor => {
    const container = findContainer(anchor)
      || anchor.closest('ytd-rich-shelf-renderer')
      || anchor.closest('ytd-reel-shelf-renderer')
      || anchor.closest('ytd-rich-section-renderer')
      || anchor.closest('ytd-rich-grid-media')
      || anchor.closest('ytd-rich-item-renderer');

    if (container) {
      hideElement(container);
    } else {
      hideElement(anchor);
    }
  });
}

function hideShortsByText() {
  document.querySelectorAll('ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-shelf-renderer, ytd-carousel-video-renderer, ytd-rich-section-renderer, ytd-rich-grid-media').forEach(element => {
    if (isShortsElement(element)) {
      hideElement(element);
    }
  });
}

function hideShortsContainers() {
  document.querySelectorAll(TARGET_SELECTORS.join(',')).forEach(element => {
    if (isShortsElement(element)) {
      hideElement(element);
    }
  });
}

function hideAds() {
  if (!adsEnabled) {
    return;
  }

  AD_SELECTORS.forEach(selector => {
    document.querySelectorAll(selector).forEach(hideElement);
  });

  document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button.ytp-button').forEach(button => {
    button.click();
  });

  document.querySelectorAll('ytd-banner-promo-renderer, ytd-promo-renderer, ytd-promo-video-renderer').forEach(hideElement);
  document.querySelectorAll('ytd-merch-shelf-renderer, ytd-upcoming-event-shelf-renderer').forEach(hideElement);
}

function removeShorts() {
  if (!shortsEnabled) {
    return;
  }

  hideShortsByAnchor();
  hideShortsByText();
  hideShortsContainers();
}

const observer = new MutationObserver(() => {
  if (shortsEnabled) {
    removeShorts();
  }
  if (adsEnabled) {
    hideAds();
  }
});

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
      options.onActivate();
    }
  });

  return button;
}

function createControlPanel() {
  if (document.getElementById('yt-block-controls')) {
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'yt-block-controls';
  panel.style.position = 'fixed';
  panel.style.bottom = '24px';
  panel.style.right = '24px';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  panel.style.alignItems = 'flex-end';
  panel.style.gap = '10px';
  panel.style.zIndex = '99999';

  panel.appendChild(createToggleButton({
    id: 'yt-ad-block-toggle',
    label: 'Ad Block',
    activeColor: '#ff0000',
    inactiveColor: '#555555',
    getState: () => adsEnabled,
    setState: state => { adsEnabled = state; },
    onActivate: hideAds
  }));

  panel.appendChild(createToggleButton({
    id: 'yt-shorts-block-toggle',
    label: 'Shorts Block',
    activeColor: '#0066cc',
    inactiveColor: '#555555',
    getState: () => shortsEnabled,
    setState: state => { shortsEnabled = state; },
    onActivate: removeShorts
  }));

  document.body.appendChild(panel);
}

function initShortsBlocker() {
  if (shortsEnabled) {
    removeShorts();
  }
  if (adsEnabled) {
    hideAds();
  }

  const root = document.documentElement || document.body;
  if (root) {
    observer.observe(root, {
      childList: true,
      subtree: true
    });
  }
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
  initShortsBlocker();
});
