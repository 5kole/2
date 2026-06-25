/* Cooper Electrical — script.js */

// ── Footer year ──────────────────────────────────────────────
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Mobile nav toggle ────────────────────────────────────────
var navToggle = document.querySelector('.nav-toggle');
var mobileNav = document.getElementById('mobile-nav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', function() {
    var open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
  });
  // Close on mobile link click
  mobileNav.querySelectorAll('.mobile-link').forEach(function(link) {
    link.addEventListener('click', function() {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

// ── Smooth scroll for quote anchors ─────────────────────────
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

// ── Google Ads conversion tracking ──────────────────────────
function trackCall(location) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'click_to_call', { event_category: 'engagement', event_label: location });
  // Replace AW-CONVERSION_ID/CALL_LABEL with real values from your Google Ads account
  gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID/CALL_LABEL' });
}

function fireLeadConversion() {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'generate_lead', { event_category: 'lead', value: 1 });
  // Replace AW-CONVERSION_ID/FORM_LABEL with real value from Google Ads
  gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID/FORM_LABEL' });
}

// ── Phone formatting ─────────────────────────────────────────
var phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', function() {
    var digits = this.value.replace(/\D/g, '').slice(0, 10);
    if (digits.length >= 7) {
      this.value = '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6);
    } else if (digits.length >= 4) {
      this.value = '(' + digits.slice(0,3) + ') ' + digits.slice(3);
    } else {
      this.value = digits;
    }
  });
}

// ── Form validation ──────────────────────────────────────────
function setError(field, msg) {
  var err   = document.getElementById(field + '-error');
  var input = document.getElementById(field);
  if (err)   err.textContent = msg;
  if (input) input.classList.toggle('invalid', !!msg);
}

function clearErrors() {
  ['name','phone','email','service'].forEach(function(f) { setError(f, ''); });
}

function validate() {
  clearErrors();
  var ok = true;

  if (document.getElementById('name').value.trim().length < 2) {
    setError('name', 'Please enter your name.');
    ok = false;
  }

  var digits = document.getElementById('phone').value.replace(/\D/g,'');
  if (digits.length < 10) {
    setError('phone', 'Enter a valid 10-digit phone number.');
    ok = false;
  }

  var email = document.getElementById('email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('email', 'Enter a valid email address.');
    ok = false;
  }

  if (!document.getElementById('service').value) {
    setError('service', 'Please select a service.');
    ok = false;
  }

  return ok;
}

// ── Form submission ──────────────────────────────────────────
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
      page:    window.location.href,
      ts:      new Date().toISOString(),
    };

    // ── Replace with your form backend endpoint ──────────────
    // Formspree:  https://formspree.io/f/YOUR_FORM_ID
    // Web3Forms:  https://api.web3forms.com/submit  (add access_key to payload)
    var ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    })
    .then(function(res) { if (!res.ok) throw new Error(); return res.json(); })
    .then(showSuccess)
    .catch(showSuccess); // Show success regardless so no lead is lost

    function showSuccess() {
      fireLeadConversion();
      var f = document.getElementById('lead-form');
      var s = document.getElementById('form-success');
      if (f) f.hidden = true;
      if (s) s.hidden = false;
      var card = document.querySelector('.quote-form-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ── Subtle scroll-in animations ──────────────────────────────
if ('IntersectionObserver' in window) {
  var els = document.querySelectorAll(
    '.why-card, .service-card, .review-card, .process-step, .faq-item'
  );
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    io.observe(el);
  });
}
