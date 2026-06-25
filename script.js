/* Cooper Electrical — script.js
 *
 * One conversion path: phone calls from ad visitors.
 * gtag phone_conversion_number auto-swaps the number for ad traffic;
 * trackCall() fires a manual backup for any click-to-call gtag misses.
 * Booking is handled entirely by the HCP widget.
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

// ── "Get a Quote" links → open HCP modal ────────────────────────────────────
function scrollToForm(e) {
  if (e) e.preventDefault();
  if (typeof HCPWidget !== 'undefined') {
    HCPWidget.openModal();
    trackBooking('get-quote-link');
  }
}
document.querySelectorAll('a[href="#quote"]').forEach(function(a) {
  a.addEventListener('click', scrollToForm);
});

// ── CONVERSION: Phone call ───────────────────────────────────────────────────
// gtag's phone_conversion_number config (set in <head>) automatically tracks
// calls from ad visitors by swapping the number with a Google forwarding number.
// trackCall() fires a manual backup for click-to-call that gtag doesn't auto-detect.
function trackCall(location) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'conversion', {
    send_to: 'AW-17992897776/GBSYCITNgsUcEPCp14ND',
    event_callback: function() {}
  });
  gtag('event', 'click_to_call', { event_label: location });
}

// ── HCP widget: engagement tracking ─────────────────────────────────────────
function trackBooking(location) {
  if (typeof gtag === 'undefined') return;
  gtag('event', 'book_online_click', { event_label: location });
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
