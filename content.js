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
  'ytd-carousel-video-renderer'
];

function hideElement(el) {
  if (!el || el.hidden) {
    return;
  }
  el.style.display = 'none';
  el.hidden = true;
}

function findContainer(el) {
  return el.closest(TARGET_SELECTORS.join(','));
}

function isShortsLink(anchor) {
  return anchor.href && anchor.href.includes(SHORTS_URL_FRAGMENT);
}

function hideShortsByAnchor() {
  document.querySelectorAll('a[href*="/shorts/"]').forEach(anchor => {
    const container = findContainer(anchor) || anchor.closest('ytd-rich-shelf-renderer') || anchor.closest('ytd-reel-shelf-renderer');
    if (container) {
      hideElement(container);
    } else {
      hideElement(anchor);
    }
  });
}

function hideShortsByText() {
  document.querySelectorAll('ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-shelf-renderer, ytd-carousel-video-renderer').forEach(element => {
    const text = element.textContent?.toLowerCase() || '';
    if (text.includes(SHORTS_KEYWORD)) {
      hideElement(element);
    }
  });
}

function hideShortsContainers() {
  document.querySelectorAll(TARGET_SELECTORS.join(',')).forEach(element => {
    if (element.textContent?.toLowerCase().includes(SHORTS_KEYWORD)) {
      hideElement(element);
    }
  });
}

function removeShorts() {
  hideShortsByAnchor();
  hideShortsByText();
  hideShortsContainers();
}

const observer = new MutationObserver(() => {
  removeShorts();
});

function initShortsBlocker() {
  removeShorts();

  const root = document.documentElement || document.body;
  if (root) {
    observer.observe(root, {
      childList: true,
      subtree: true
    });
  }
}

initShortsBlocker();
