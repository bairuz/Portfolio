/* ============================================================
   Portfolio interactions
   - Scroll progress bar
   - Sticky nav shadow + scrollspy (active link tracking)
   - Reveal-on-scroll for sections and cards
   - Animated stat counters (skips placeholder text automatically)
   - Back-to-top button
   - Click-to-copy email
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Scroll progress bar ---------- */
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  function updateProgressBar() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- 2. Sticky nav shadow ---------- */
  var navHeader = document.querySelector('header.nav');

  function updateNavShadow() {
    if (!navHeader) return;
    navHeader.classList.toggle('scrolled', window.scrollY > 8);
  }

  /* ---------- 3. Scrollspy — highlight nav link for section in view ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('nav.links a'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return null;
      var el = document.querySelector(id);
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  function updateScrollspy() {
    var scrollPos = window.scrollY + 120; // offset for sticky header
    var current = null;

    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollPos) {
        current = s;
      }
    });

    navLinks.forEach(function (link) { link.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }

  /* ---------- 4. Reveal-on-scroll ---------- */
  var revealTargets = document.querySelectorAll(
    'section, .work-card, .testi-card, .cert-row, .exp-card, .proc-step, .stat'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: no IntersectionObserver support — just show everything
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- 5. Animated stat counters ---------- */
  /* Only animates values that already contain a real number.
     Placeholder text like "[#]" is left untouched until filled in. */
  var statNums = document.querySelectorAll('.stat .num');

  function animateCount(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/(\d[\d,]*)/);
    if (!match) return; // still a placeholder — skip

    var target = parseInt(match[1].replace(/,/g, ''), 10);
    if (isNaN(target)) return;

    var prefix = raw.slice(0, match.index);
    var suffix = raw.slice(match.index + match[1].length);
    var duration = 1100;
    var startTime = null;

    el.classList.add('counting');

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statNums.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    statNums.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- 6. Back-to-top button ---------- */
  var backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.textContent = '↑';
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  /* ---------- 7. Click-to-copy email ---------- */
  var emailLink = document.querySelector('.checkout-line a[href^="mailto:"]');
  if (emailLink) {
    emailLink.addEventListener('click', function (e) {
      var email = emailLink.textContent.trim();
      if (navigator.clipboard && email && email.indexOf('@') > -1) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(function () {
          var line = emailLink.closest('.checkout-line');
          var toast = line.querySelector('.copy-toast');
          if (!toast) {
            toast = document.createElement('span');
            toast.className = 'copy-toast';
            toast.textContent = 'Copied!';
            line.appendChild(toast);
          }
          toast.classList.add('show');
          line.classList.add('copied');
          setTimeout(function () {
            toast.classList.remove('show');
            line.classList.remove('copied');
          }, 1600);
        });
      }
    });
  }

  /* ---------- Scroll listener (throttled via rAF) ---------- */
  var ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function () {
        updateProgressBar();
        updateNavShadow();
        updateScrollspy();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load to set initial state
  updateProgressBar();
  updateNavShadow();
  updateScrollspy();
  updateBackToTop();
});
