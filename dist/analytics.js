// GA4 for LST's own Data Studio report. Nothing loads from Google until the visitor accepts.
// No personal data is ever sent: every value below comes from a closed list or a catalogue code.
(() => {
  const config = window.lstAnalytics;
  if (!config?.id) return;
  const {id, host, page} = config;
  const STORE = 'lst-consent';
  const VERSION = 1; // Of the stored choice, not of the measurement standard.
  const storage = {
    get() { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } },
    set(value) { try { localStorage.setItem(STORE, JSON.stringify(value)); } catch { /* Choice lasts this visit only. */ } }
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});

  // Sent with every hit, page views included: who is visiting, what kind of page and which trip it is about.
  // The team marks its own browser by opening any page with ?equipo=1 once (?equipo=0 undoes it);
  // the cookie lst_analytics_internal=1 remembers it for a year.
  const bare = name => String(name).replace(/^www\./, '');
  const team = new URLSearchParams(location.search).get('equipo');
  if (team === '1') document.cookie = 'lst_analytics_internal=1; path=/; max-age=31536000; SameSite=Lax; Secure';
  if (team === '0') document.cookie = 'lst_analytics_internal=; path=/; max-age=0; SameSite=Lax; Secure';
  if (team === '1' || team === '0') {
    // Out of the address once handled, so the mark is not passed on to visitors by copying the link.
    try {
      const url = new URL(location.href);
      url.searchParams.delete('equipo');
      history.replaceState(history.state, '', url);
    } catch { /* The address stays as it is. */ }
  }
  const internal = team === '1' || (team !== '0' && /(?:^|; )lst_analytics_internal=1(?:;|$)/.test(document.cookie));
  const external = !internal && bare(location.hostname) === bare(host);
  const common = {
    traffic_type: internal ? 'internal' : external ? 'external' : 'developer',
    page_type: page.page_type,
    ...(page.destination_slug ? {destination_slug: page.destination_slug} : {}), // A trip's view is its page_view with page_type=trip.
    ...(external ? {} : {debug_mode: true}) // GA4 reads any value as "on": only present outside real traffic.
  };

  // Where the visit came from, noted in this tab only until the visitor chooses: someone who lands
  // from a campaign and accepts on a later page would otherwise count as direct traffic.
  // Nothing leaves the browser without consent, and the note is erased on either choice.
  const ENTRY = 'lst-entry';
  const LABELS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id'];
  const labelsOf = query => new URLSearchParams([...new URLSearchParams(query)].filter(([key]) => LABELS.includes(key)));
  const outside = url => { try { return bare(new URL(url).hostname) !== bare(location.hostname); } catch { return false; } };
  const entry = {
    get() {
      try {
        const kept = JSON.parse(sessionStorage.getItem(ENTRY));
        return kept && typeof kept.query === 'string' && typeof kept.referrer === 'string' ? kept : null;
      } catch { return null; }
    },
    set(kept) { try { sessionStorage.setItem(ENTRY, JSON.stringify(kept)); } catch { /* Measured without it. */ } },
    clear() { try { sessionStorage.removeItem(ENTRY); } catch { /* Nothing was kept. */ } }
  };
  const chosen = () => {
    const saved = storage.get();
    return saved?.version === VERSION && typeof saved.analytics === 'boolean' ? saved : null;
  };
  if (!chosen() && !entry.get()) {
    const query = labelsOf(location.search).toString();
    const referrer = outside(document.referrer) ? document.referrer : '';
    if (query || referrer) entry.set({query, referrer});
  }
  // What GA4 can no longer see on a later page: the campaign labels and the outside site.
  function origin() {
    const kept = entry.get();
    const fields = {};
    if (!kept) return fields;
    try {
      const url = new URL(location.href);
      const labels = [...labelsOf(kept.query)];
      if (labels.length && ![...url.searchParams.keys()].some(key => key.startsWith('utm_'))) {
        for (const [key, value] of labels) url.searchParams.append(key, value);
        fields.page_location = url.href;
      }
    } catch { /* GA4 reads the address as it is. */ }
    if (kept.referrer && !outside(document.referrer)) fields.page_referrer = kept.referrer;
    return fields;
  }

  let granted = false;
  let loaded = false;
  function load() {
    window[`ga-disable-${id}`] = false;
    gtag('consent', 'update', {analytics_storage: 'granted'});
    if (!loaded) {
      loaded = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      document.head.append(script);
      gtag('js', new Date());
      gtag('config', id, {...common, ...origin()});
    }
    granted = true;
  }
  function revoke() {
    granted = false;
    window[`ga-disable-${id}`] = true;
    gtag('consent', 'update', {analytics_storage: 'denied'});
    // Remove the cookies GA4 may have set on this domain and its parents.
    const host = location.hostname.split('.');
    const domains = host.map((_, i) => host.slice(i).join('.')).filter(d => d.includes('.'));
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga/.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; path=/`;
      for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  }
  function send(name, params) {
    if (granted) gtag('event', name, {...common, ...params});
  }

  // Where on the page a button is, in eleven places that mean something to the client. Anything else is
  // reported as unclassified, never guessed. The first match wins, so the wildcard entries go last;
  // `npm test` (not part of the Vercel build) fails if a published button is unclassified or its place changes.
  const PLACES = [
    ['.trip-header-cta', 'header'], ['.lst-nav-contact', 'header'],
    ['.reserve-whatsapp', 'reserve'], ['.reserve-main', 'reserve'], ['.booking-whatsapp', 'reserve'], ['.booking-card-cta', 'reserve'],
    ['.dock-whatsapp', 'mobile_bar'], ['.dock-cta', 'mobile_bar'], ['.hp-bar-wa', 'mobile_bar'],
    ['.departure-enquiry', 'departure'], ['.trip-registration', 'departure'], ['.essential-dates', 'departure'],
    ['.departure-dossier', 'departure'], ['.departure-dialog *', 'departure'], ['.trip-native-dates *', 'departure'],
    ['.trip-team-contact', 'trip_info'], ['.group-fit-contact', 'trip_info'],
    ['.trip-summary *', 'trip_info'], ['.dossier-link', 'trip_info'],
    ['.rg-whatsapp', 'registration'],
    ['[data-guide-enquiry]', 'levels'], ['#nivel *', 'levels'],
    ['.hp-filter-empty *', 'help'], ['#catalog-empty *', 'help'], ['.hp-how *', 'help'], ['.ct-help *', 'help'],
    ['.faq-help *', 'faq'], ['.hp-close *', 'closing'], ['footer *', 'footer']
  ];
  const locate = element => PLACES.find(([selector]) => element.matches(selector))?.[1] ?? 'unclassified';

  // Community links are known by their host; they are not commercial contact.
  const SOCIAL = new Map([['instagram.com', 'instagram'], ['www.instagram.com', 'instagram'], ['chat.whatsapp.com', 'whatsapp_group']]);
  const social = link => SOCIAL.get(/^https?:\/\/([^/?#:]+)/i.exec(link?.getAttribute('href') ?? '')?.[1].toLowerCase());

  document.addEventListener('click', event => {
    if (!granted || !(event.target instanceof Element)) return;
    const link_type = social(event.target.closest('a'));
    if (link_type) send('social_click', {link_type});
    const element = event.target.closest('a[data-whatsapp], a[data-registration], [data-open-dates], a.dossier-link');
    if (!element) return;
    const cta_location = locate(element);
    if (element.matches('a[data-whatsapp]')) send('whatsapp_click', {cta_location});
    else if (!page.destination_slug) return; // Registration, dates and PDF only exist on a trip.
    else if (element.matches('a[data-registration]')) send('registration_click', {cta_location});
    else if (element.matches('[data-open-dates]')) send('dates_open', {cta_location});
    else send('pdf_click', {cta_location});
  }, true);

  document.addEventListener('lst:level-test', event => {
    const level = event.detail?.level;
    if (Number.isInteger(level) && level >= 1 && level <= 4) send('level_test_complete', {surf_level: String(level)});
  });
  // The form announces facts; only controlled values go on: a step number and a start date.
  document.addEventListener('lst:registration-step', event => {
    const step = event.detail?.step;
    if (page.destination_slug && Number.isInteger(step) && step >= 2 && step <= 5) send('registration_step', {form_step: String(step)});
  });
  document.addEventListener('lst:registration-accepted', event => {
    if (!page.destination_slug) return;
    // trip_id is the departure: the trip plus its start date, readable whatever key the CMS gives it.
    const start = event.detail?.start;
    const dated = typeof start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(start);
    send('generate_lead', dated ? {trip_id: `${page.destination_slug}-${start}`} : {}); // GA4's own name for a request received.
  });
  // A closed list of error categories. The form reports facts (HTTP status, whether
  // Brevo pointed at fields, the error type); messages and field contents never get here.
  function failure({status, fields, error}) {
    if (status === 429) return 'rate_limited';
    if (status >= 500) return 'provider_unavailable';
    if (status >= 400) return 'provider_rejected';
    if (typeof fields === 'boolean') return fields ? 'validation' : 'provider_rejected';
    if (error === 'TimeoutError') return 'timeout';
    if (error === 'TypeError') return 'network';
    return 'unknown';
  }
  document.addEventListener('lst:registration-failed', event => {
    if (page.destination_slug) send('registration_error', {error_category: failure(event.detail ?? {})});
  });

  // Consent notice: two equal choices, no pre-ticked analytics, always reachable from the cookie page.
  let notice;
  function choose(analytics) {
    storage.set({analytics, version: VERSION, date: new Date().toISOString().slice(0, 10)});
    notice?.remove();
    notice = null;
    if (analytics) load(); else revoke();
    entry.clear();
  }
  function showNotice() {
    if (notice) { notice.querySelector('button').focus(); return; }
    notice = document.createElement('section');
    notice.className = 'consent-notice';
    notice.setAttribute('aria-label', 'Cookies de medición');
    notice.innerHTML = '<p class="consent-title">¿Nos dejas contar las visitas?</p>'
      + '<p>Con Google Analytics vemos qué viajes interesan y por dónde llega la gente. Solo se activa si aceptas. <a href="/cookies/">Más información</a></p>'
      + '<div class="consent-actions"><button type="button" class="button consent-choice" data-consent="reject">Rechazar</button>'
      + '<button type="button" class="button consent-choice" data-consent="accept">Aceptar</button></div>';
    notice.addEventListener('click', event => {
      const button = event.target instanceof Element && event.target.closest('[data-consent]');
      if (button) choose(button.dataset.consent === 'accept');
    });
    document.body.append(notice);
  }
  function start() {
    document.querySelectorAll('[data-consent-open]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', showNotice);
    });
    const saved = chosen();
    // A choice made in another tab: the note is used once, or not at all, and erased either way.
    if (saved) { if (saved.analytics) load(); entry.clear(); }
    else showNotice();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
