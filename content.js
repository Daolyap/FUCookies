(function () {
  const hostname = location.hostname.replace(/^www\./, '');

  chrome.storage.sync.get({ exceptions: [] }, ({ exceptions }) => {
    if (exceptions.some(e => hostname === e || hostname.endsWith('.' + e))) return;
    init();
  });

  function init() {
    if (window === window.top) {
      injectTCFBlock();
    }
    tryReject();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryReject, { once: true });
    }
    const observer = new MutationObserver(debounce(tryReject, 250));
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);
  }

  function injectTCFBlock() {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL('tcf-blocker.js');
    (document.head || document.documentElement).prepend(s);
    s.remove();
  }

  const SELECTORS = [
    '#CybotCookiebotDialogBodyButtonDecline',
    '#onetrust-reject-all-handler',
    '.ot-pc-refuse-all-handler',
    '#didomi-notice-disagree-button',
    '.didomi-continue-without-agreeing',
    '.qc-cmp2-summary-buttons .qc-cmp2-secondary-button',
    '#truste-consent-required',
    '.pdynamicbutton a.call',
    '.osano-cm-denyAll',
    '.cky-btn-reject',
    '[data-testid="uc-deny-all-button"]',
    '.t-declineButton',
    '.gdpr-cookie-notice-decline',
    '#cookie-notice-decline',
    '.cmplz-deny',
    '#cookiescript_reject',
    '.iubenda-cs-reject-btn',
    '.cc-deny',
    '[aria-label="Reject all" i]',
    '[data-action="reject-all"]',
    '#reject-all',
    '.reject-all',
    '#rejectAll',
    '.rejectAll',
  ];

  const REJECT_PHRASES = [
    'reject all',
    'decline all',
    'refuse all',
    'deny all',
    'disagree',
    'reject cookies',
    'decline cookies',
    'no, thanks',
    'no thanks',
  ];

  function tryReject() {
    clickBySelector() || clickByText() || uncheckOptional();
  }

  function clickBySelector() {
    for (const sel of SELECTORS) {
      const el = document.querySelector(sel);
      if (el && visible(el)) {
        el.click();
        return true;
      }
    }
    return false;
  }

  function clickByText() {
    const candidates = document.querySelectorAll('button, [role="button"], a');
    for (const el of candidates) {
      const text = el.textContent.trim().toLowerCase();
      if (REJECT_PHRASES.includes(text) && visible(el)) {
        el.click();
        return true;
      }
    }
    return false;
  }

  function uncheckOptional() {
    let changed = false;
    document.querySelectorAll('input[type="checkbox"]:checked:not(:disabled)').forEach(cb => {
      const escapedId = cb.id && typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(cb.id) : cb.id;
      const labelEl = cb.id ? document.querySelector(`label[for="${escapedId}"]`) : null;
      const labelText = labelEl ? labelEl.textContent : '';
      const attrs = (cb.name + ' ' + cb.id + ' ' + (cb.getAttribute('aria-label') || '') + ' ' + labelText).toLowerCase();
      if (!/(necessary|required|essential|strictly)/.test(attrs)) {
        cb.click();
        changed = true;
      }
    });
    return changed;
  }

  function visible(el) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return false;
    const s = getComputedStyle(el);
    const opacity = parseFloat(s.opacity);
    return s.display !== 'none' && s.visibility !== 'hidden' && (isNaN(opacity) || opacity > 0);
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }
})();
