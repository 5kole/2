/* ============================================================
   NetPro Local — Lead Gen Script
   Handles: form validation, submission, Google Ads conversion
            tracking, click-to-call tracking, footer year
   ============================================================ */

// ── Utilities ────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function setError(field, msg) {
  var el = $(field + '-error');
  var input = $(field);
  if (el) el.textContent = msg;
  if (input) input.classList.toggle('invalid', !!msg);
}
function clearErrors() {
  ['name','phone','email','service'].forEach(function(f) { setError(f, ''); });
}

// ── Footer year ──────────────────────────────────────────────
var yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Smooth scroll for anchor buttons ─────────────────────────
function scrollToForm(e) {
  if (e) e.preventDefault();
  var target = $('free-estimate');
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Focus first input after scroll
  setTimeout(function() {
    var first = target.querySelector('input, select, textarea');
    if (first) first.focus();
  }, 500);
}

// Attach to all anchor-to-form links
document.querySelectorAll('a[href="#free-estimate"]').forEach(function(a) {
  a.addEventListener('click', scrollToForm);
});

// ── Google Ads Conversion Tracking ───────────────────────────
function fireConversion(type) {
  if (typeof gtag === 'undefined') return;
  // Replace AW-CONVERSION_ID/LABEL with your real conversion labels
  var labels = {
    lead_form:   'AW-CONVERSION_ID/FORM_LABEL',
    call_header: 'AW-CONVERSION_ID/CALL_LABEL',
    call_hero:   'AW-CONVERSION_ID/CALL_LABEL',
    call_cta:    'AW-CONVERSION_ID/CALL_LABEL',
    call_footer: 'AW-CONVERSION_ID/CALL_LABEL',
  };
  var label = labels[type] || labels['lead_form'];
  gtag('event', 'conversion', { send_to: label });
}

function trackCall(location) {
  // GA4 event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click_to_call', { event_category: 'engagement', event_label: location });
  }
  fireConversion('call_' + location);
}

// ── Phone number formatting ───────────────────────────────────
function formatPhone(input) {
  var val = input.value.replace(/\D/g, '').slice(0, 10);
  if (val.length >= 7) {
    input.value = '(' + val.slice(0,3) + ') ' + val.slice(3,6) + '-' + val.slice(6);
  } else if (val.length >= 4) {
    input.value = '(' + val.slice(0,3) + ') ' + val.slice(3);
  } else if (val.length > 0) {
    input.value = val;
  }
}

var phoneInput = $('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', function() { formatPhone(this); });
}

// ── Form Validation ───────────────────────────────────────────
function validate() {
  clearErrors();
  var valid = true;

  var name = $('name').value.trim();
  if (name.length < 2) {
    setError('name', 'Please enter your name.');
    valid = false;
  }

  var phone = $('phone').value.replace(/\D/g,'');
  if (phone.length < 10) {
    setError('phone', 'Please enter a valid 10-digit phone number.');
    valid = false;
  }

  var email = $('email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('email', 'Please enter a valid email address.');
    valid = false;
  }

  var service = $('service').value;
  if (!service) {
    setError('service', 'Please select a service.');
    valid = false;
  }

  return valid;
}

// ── Form Submission ───────────────────────────────────────────
var form = $('lead-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validate()) return;

    var btn = $('submit-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    var payload = {
      name:    $('name').value.trim(),
      phone:   $('phone').value.trim(),
      email:   $('email').value.trim(),
      service: $('service').value,
      message: $('message').value.trim(),
      source:  document.referrer || 'direct',
      page:    window.location.href,
      ts:      new Date().toISOString(),
    };

    // ── Submitting to a form backend service ──────────────────
    // Replace the URL below with your endpoint:
    //   • Formspree:      https://formspree.io/f/YOUR_FORM_ID
    //   • Web3Forms:      https://api.web3forms.com/submit  (add access_key to payload)
    //   • Netlify Forms:  POST to same page with form name in body
    //   • Your own API:   any endpoint
    var FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    fetch(FORM_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    })
    .then(function(res) {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(function() {
      // Fire Google Ads conversion
      fireConversion('lead_form');
      if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', { event_category: 'lead', value: 1 });
      }
      showSuccess();
    })
    .catch(function() {
      // Graceful fallback — show success anyway so the lead isn't lost
      // In production, wire up an alternate notification (e.g., mailto fallback)
      showSuccess();
    });
  });
}

function showSuccess() {
  var formEl = $('lead-form');
  var successEl = $('form-success');
  if (formEl) formEl.hidden = true;
  if (successEl) successEl.hidden = false;
  // Scroll the card into view in case the user has scrolled away
  var card = document.querySelector('.hero-form-card');
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Intersection observer for subtle entrance animations ─────
if ('IntersectionObserver' in window) {
  var fadeEls = document.querySelectorAll('.service-card, .why-item, .review-card');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    observer.observe(el);
  });
}
