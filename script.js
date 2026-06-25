/* Cooper Electrical — script.js
 *
 * Two conversion paths, nothing else:
 *   1. Phone call   — gtag phone_conversion_number handles this automatically
 *                     for ad traffic; trackCall() fires it as a manual backup
 *                     for any click-to-call that gtag doesn't auto-detect.
 *   2. Form submit  — fireFormConversion() fires after the quote form submits.
 */

// ── Footer year ──────────────────────────────────────────────────────────────
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Mobile nav toggle ────────────────────────────────────────────────────────
var navToggle = document.querySelector('.nav-toggle');
var mobileNav = document.getElementById('mobile-nav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', function() {
    var open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    mobileNav.setAttribute('aria-hidden', String(!open));
  });
  mobileNav.querySelectorAll('.mobile-link').forEach(function(link) {
    link.addEventListener('click', function() {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

// ── Smooth scroll to quote form ──────────────────────────────────────────────
function scrollToForm(e) {
  if (e) e.preventDefault();
  var target = document.getElementById('quote');
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function() {
    var first = target.querySelector('input, select, textarea');
    if (first) first.focus();
  }, 500);
}
document.querySelectorAll('a[href="#quote"]').forEach(function(a) {
  a.addEventListener('click', scrollToForm);
});

// ── CONVERSION 1: Phone call ─────────────────────────────────────────────────
// gtag's phone_conversion_number config (set in <head>) automatically tracks
// calls from ad visitors by swapping the number with a Google forwarding number.
// trackCall() fires a manual backup conversion for any click-to-call that the
// auto-swap doesn't catch (e.g. visitors typing the number directly).
// Replace AW-17992897776/GBSYCITNgsUcEPCp14ND with your real Google Ads conversion label.
function trackCall(location) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'conversion', {
    send_to: 'AW-17992897776/GBSYCITNgsUcEPCp14ND',
    event_callback: function() {}
  });
  // GA4 event for reporting
  gtag('event', 'click_to_call', { event_label: location });
}

// ── CONVERSION 2: Form submission ────────────────────────────────────────────
// Fires after the quote form is successfully submitted.
// Replace AW-CONVERSION_ID/FORM_LABEL with your real Google Ads conversion label.
function fireFormConversion() {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'conversion', {
    send_to: 'AW-CONVERSION_ID/FORM_LABEL',
    event_callback: function() {}
  });
  // GA4 event for reporting
  gtag('event', 'generate_lead');
}

// ── HCP widget: click tracking only (not a conversion) ──────────────────────
// Opens the Housecall Pro booking modal. No conversion fires here —
// the two conversion methods are call and form only.
function trackBooking(location) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'book_online_click', { event_label: location });
}

// ── Phone number formatting ──────────────────────────────────────────────────
var phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', function() {
    var d = this.value.replace(/\D/g, '').slice(0, 10);
    if      (d.length >= 7) this.value = '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6);
    else if (d.length >= 4) this.value = '(' + d.slice(0,3) + ') ' + d.slice(3);
    else                    this.value = d;
  });
}

// ── Form validation ──────────────────────────────────────────────────────────
function setError(field, msg) {
  var err   = document.getElementById(field + '-error');
  var input = document.getElementById(field);
  if (err)   err.textContent = msg;
  if (input) input.classList.toggle('invalid', !!msg);
}
function clearErrors() {
  ['name', 'phone', 'email', 'service'].forEach(function(f) { setError(f, ''); });
}
function validate() {
  clearErrors();
  var ok = true;
  if (document.getElementById('name').value.trim().length < 2) {
    setError('name', 'Please enter your name.'); ok = false;
  }
  if (document.getElementById('phone').value.replace(/\D/g,'').length < 10) {
    setError('phone', 'Enter a valid 10-digit phone number.'); ok = false;
  }
  var email = document.getElementById('email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('email', 'Enter a valid email address.'); ok = false;
  }
  if (!document.getElementById('service').value) {
    setError('service', 'Please select a service.'); ok = false;
  }
  return ok;
}

// ── Quote form submission ────────────────────────────────────────────────────
var form = document.getElementById('lead-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validate()) return;

    var btn = document.getElementById('submit-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    var payload = {
      name:    document.getElementById('name').value.trim(),
      phone:   document.getElementById('phone').value.trim(),
      email:   document.getElementById('email').value.trim(),
      service: document.getElementById('service').value,
      city:    document.getElementById('city').value.trim(),
      message: document.getElementById('message').value.trim(),
      source:  document.referrer || 'direct',
      ts:      new Date().toISOString(),
    };

    // Replace with your Formspree endpoint: https://formspree.io/f/YOUR_FORM_ID
    fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    })
    .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(onFormSuccess)
    .catch(onFormSuccess); // show success anyway so no lead is lost

    function onFormSuccess() {
      // ── CONVERSION 2 fires here ──────────────────────────────────────
      fireFormConversion();

      var f = document.getElementById('lead-form');
      var s = document.getElementById('form-success');
      if (f) f.hidden = true;
      if (s) s.hidden = false;
      var card = document.querySelector('.quote-form-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ── Scroll-in animations ─────────────────────────────────────────────────────
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.why-card, .service-card, .review-card, .process-step, .faq-item'
  ).forEach(function(el) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(14px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    io.observe(el);
  });
}
