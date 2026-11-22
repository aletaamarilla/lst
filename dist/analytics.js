// GA4 shared with the travelhood-admin panel (event vocabulary of its common standard v1).
// Nothing loads from Google until the visitor accepts. No personal data is ever sent.
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

  // Sent with every hit, page views included, with Travelhood's names and values.
  // The team marks its own browser with the cookie lst_analytics_internal=1.
  const bare = name => String(name).replace(/^www\./, '');
  const internal = /(?:^|; )lst_analytics_internal=1(?:;|$)/.test(document.cookie);
  const external = !internal && bare(location.hostname) === bare(host);
  const common = {
    measurement_version: '1',
    traffic_type: internal ? 'internal' : external ? 'external' : 'developer',
    page_type: page.page_type,
    ...(external ? {} : {debug_mode: true}) // GA4 reads any value as "on": only present outside real traffic.
  };

  let granted = false;
  let loaded = false;
  let viewed = false;
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
      gtag('config', id, common);
    }
    granted = true;
    if (page.page_type === 'trip' && !viewed) {
      viewed = true; // Once per page, however many times consent changes.
      send('destination_view', {destination_slug: page.destination_slug});
    }
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

  // Controlled button locations; anything else is reported as unclassified, never guessed.
  const WHATSAPP = [
    ['.reserve-whatsapp', 'reserve_whatsapp'], ['.booking-whatsapp', 'booking_card_whatsapp'],
    ['.dock-whatsapp', 'mobile_dock_whatsapp'], ['.departure-enquiry', 'departure_whatsapp'],
    // A full trip or one without dates shows an enquiry where the booking button would be.
    ['.trip-header-cta', 'header_enquiry'], ['.reserve-main', 'reserve_enquiry'],
    ['.booking-card-cta', 'booking_card_enquiry'], ['.dock-cta', 'mobile_dock_enquiry'],
    ['.trip-team-contact', 'team_whatsapp'], ['.group-fit-contact', 'group_fit_whatsapp'],
    ['.trip-meta-contact', 'trip_summary_whatsapp'], ['.trip-summary *', 'trip_summary_whatsapp'],
    ['.rg-whatsapp', 'registration_whatsapp'], ['.lst-nav-contact', 'header_whatsapp'],
    ['.hp-bar-wa', 'mobile_bar_whatsapp'], ['[data-guide-enquiry]', 'level_guide_whatsapp'],
    ['.hp-filter-empty *', 'filter_empty_whatsapp'], ['#catalog-empty *', 'filter_empty_whatsapp'],
    ['.hp-how *', 'how_to_book_whatsapp'], ['.ct-help *', 'catalog_help_whatsapp'],
    ['.faq-help *', 'faq_contact'], ['.hp-close *', 'closing_whatsapp'],
    ['footer *', 'footer_whatsapp'], ['#nivel *', 'level_whatsapp'], ['.trip-native-dates *', 'departure_whatsapp']
  ];
  const ACTIONS = [
    ['.trip-header-cta', 'header'], ['.reserve-main', 'reserve'], ['.booking-card-cta', 'booking_card'],
    ['.dock-cta', 'mobile_dock'], ['.trip-registration', 'departure'], ['.essential-dates', 'essentials'],
    ['.departure-dossier', 'departure'], ['.departure-dialog *', 'departure'], ['.dossier-link', 'trip']
  ];
  const locate = (element, table) => table.find(([selector]) => element.matches(selector))?.[1] ?? 'unclassified';

  document.addEventListener('click', event => {
    const element = event.target instanceof Element && event.target.closest('a[data-whatsapp], a[data-registration], [data-open-dates], a.dossier-link');
    if (!element || !granted) return;
    const destination = page.destination_slug;
    if (element.matches('a[data-whatsapp]')) {
      const cta_location = locate(element, WHATSAPP);
      if (destination) send('destination_whatsapp_click', {destination_slug: destination, cta_location});
      else if (cta_location === 'faq_contact') send('faq_contact_click', {cta_location});
      else send('whatsapp_click', {whatsapp_topic: element.dataset.whatsapp, cta_location});
    } else if (!destination) return;
    else if (element.matches('a[data-registration]')) send('destination_booking_click', {destination_slug: destination, cta_location: locate(element, ACTIONS), booking_provider: 'own_form'});
    else if (element.matches('[data-open-dates]')) send('destination_dates_price_interaction', {destination_slug: destination, cta_location: locate(element, ACTIONS)});
    else send('destination_pdf_download', {destination_slug: destination, cta_location: locate(element, ACTIONS)});
  }, true);

  document.addEventListener('lst:registration-accepted', () => {
    if (page.destination_slug) send('registration_form_accepted', {destination_slug: page.destination_slug});
  });
  // Travelhood's closed list of error categories. The form reports facts (HTTP status, whether
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
    if (page.destination_slug) send('registration_form_error', {destination_slug: page.destination_slug, error_category: failure(event.detail ?? {})});
  });

  // Consent notice: two equal choices, no pre-ticked analytics, always reachable from the cookie page.
  let notice;
  function choose(analytics) {
    storage.set({analytics, version: VERSION, date: new Date().toISOString().slice(0, 10)});
    notice?.remove();
    notice = null;
    if (analytics) load(); else revoke();
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
    const saved = storage.get();
    if (saved?.version === VERSION && typeof saved.analytics === 'boolean') { if (saved.analytics) load(); }
    else showNotice();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
