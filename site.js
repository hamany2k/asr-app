(function () {
  // footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // duplicate marquee content for a seamless loop
  (function () {
    var m = document.getElementById('marquee');
    if (m) m.innerHTML += m.innerHTML;
  })();

  // scroll progress + nav shadow
  var progress = document.getElementById('progress');
  var nav = document.getElementById('nav');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navlinks');
  if (toggle && links) {
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
  }

  // scroll reveal (respects reduced motion)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // contact form: AJAX to Formspree, mailto fallback
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var FALLBACK_EMAIL = 'hamany678@asrkw.com';
  if (form && statusEl) {
  function showStatus(type, msg) { statusEl.className = 'form-status ' + type; statusEl.innerHTML = msg; }

  form.addEventListener('submit', function (e) {
    var notConfigured = form.action.indexOf('YOUR_FORM_ID') !== -1;
    if (notConfigured) { e.preventDefault(); buildMailtoFallback(); return; }
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var original = btn.textContent;
    btn.textContent = 'Sending…'; btn.disabled = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (res.ok) { form.reset(); showStatus('ok', 'Thank you — your message has been sent. We’ll be in touch soon.'); }
        else { return res.json().then(function () { throw new Error('submit'); }); }
      })
      .catch(function () { buildMailtoFallback(); })
      .finally(function () { btn.textContent = original; btn.disabled = false; });
  });

  function buildMailtoFallback() {
    var name = (document.getElementById('name').value || '').trim();
    var email = (document.getElementById('email').value || '').trim();
    var subject = (document.getElementById('subject').value || 'Message from asrkw.com').trim();
    var message = (document.getElementById('message').value || '').trim();
    var body = encodeURIComponent(message + '\n\n— ' + name + (email ? ' (' + email + ')' : ''));
    var href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + body;
    showStatus('ok', 'Opening your email app… If nothing happens, write to <a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + '</a>.');
    window.location.href = href;
  }
  }
})();
