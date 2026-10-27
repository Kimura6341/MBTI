(() => {
  const schema = {
    test_started: [],
    test_page_completed: ['page'],
    test_completed: ['type', 'variant', 'ei', 'ns', 'tf', 'jp', 'at'],
    report_viewed: ['type', 'variant'],
    report_download_clicked: [],
    email_form_submitted: [],
  };
  // Never send query strings, scored-result fragments, or private export links.
  const safeURL = value => {
    try {
      const url = new URL(value, location.href);
      url.search = '';
      if (!/^#[a-z][a-z0-9-]*$/i.test(url.hash)) url.hash = '';
      return url.href;
    } catch { return ''; }
  };
  const cleanEvent = event => {
    if (!event) return null;
    const props = event.properties || {};
    for (const key of Object.keys(props)) {
      if (key === '$set' || key === '$set_once') delete props[key];
      else if (/url|referrer|pathname/i.test(key) && typeof props[key] === 'string') {
        props[key] = key.includes('pathname') ? props[key].split(/[?#]/)[0] : safeURL(props[key]);
      }
    }
    event.properties = props;
    return event;
  };
  const config = {
    // Own initial and hash pageviews, so SDK history detection cannot double-count.
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: { dom_event_allowlist: ['click'], element_allowlist: ['a', 'button'] },
    mask_all_text: true,
    mask_all_element_attributes: true,
    disable_session_recording: true,
    session_recording: { maskAllInputs: true, maskTextSelector: '*' },
    ip: false,
    before_send: cleanEvent,
  };
  // Install safety settings before the unchanged snippet can start the SDK.
  // Wrapping the stub's assigned init avoids a race with the async loader and
  // keeps all four supplied initialization values untouched.
  const ph = window.posthog = window.posthog || [];
  if (ph.__loaded) ph.set_config(config);
  else Object.defineProperty(ph, 'init', {
    configurable: true,
    set(init) {
      Object.defineProperty(ph, 'init', {
        configurable: true, writable: true,
        value(key, options, name) { return init.call(this, key, { ...options, ...config }, name); },
      });
    },
  });
  let started = false;
  const pageview = () => { try { window.posthog.capture('$pageview', { $current_url: safeURL(location.href) }); } catch {} };
  window.personaAnalytics = {
    start() {
      if (started) return;
      started = true;
      pageview();
      addEventListener('hashchange', pageview);
    },
    capture(name, properties = {}) {
      if (!Object.hasOwn(schema, name)) return;
      const allowed = Object.fromEntries(schema[name].filter(key => Object.hasOwn(properties, key)).map(key => [key, properties[key]]));
      // SDK loading replaces the snippet stub, so resolve the live instance
      // on every call instead of retaining the obsolete queue.
      try { window.posthog.capture(name, allowed); } catch { /* Analytics must not interrupt the test. */ }
    },
  };
  const protectInputs = () => document.querySelectorAll('input, textarea, select, [contenteditable]').forEach(el => el.classList.add('ph-no-capture'));
  document.addEventListener('DOMContentLoaded', () => {
    protectInputs();
    new MutationObserver(protectInputs).observe(document.body, { childList: true, subtree: true });
  }, { once: true });
})();
