// ===== site-factory — site interactions =====
(function () {
  'use strict';

  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  // Sticky header shadow on scroll
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Close mobile menu when a link is tapped
  if (nav && header) {
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        header.classList.remove('nav-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Current year in footer
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-reveal with per-group stagger
  var revealGroups = [
    '.section-head',
    '.service-grid',
    '.about-copy',
    '.about-stats',
    '.gallery-grid',
    '.review-links',
    '.visit-wrap',
    '.insurance-grid',
    '.faq-list',
    '.team-grid',
    '.quote-grid',
    '.tx-steps'
  ];
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealGroups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (container) {
        // Stagger direct children if the group holds a set of cards/items
        var kids = container.children.length > 1 ? container.children : [container];
        Array.prototype.forEach.call(kids, function (el, i) {
          el.classList.add('reveal');
          el.style.setProperty('--i', i);
          io.observe(el);
        });
      });
    });
  }

  // Animated count-up for stat numbers
  var stats = document.querySelectorAll('.stat-num[data-count]');
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = performance.now();
    var dur = 1300;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && stats.length) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach(function (el) { statObs.observe(el); });
  }

  // Subtle parallax on the hero content as you scroll (depth without fighting
  // the glow's ambient drift animation)
  var heroInner = document.querySelector('.hero-inner');
  if (heroInner && !reduceMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var sy = window.scrollY;
        if (sy < 800) {
          heroInner.style.transform = 'translateY(' + (sy * 0.12) + 'px)';
          heroInner.style.opacity = String(Math.max(1 - sy / 620, 0));
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // Live Instagram feed (LightWidget). Activates only when a widget ID is set
  // on #igFeed[data-ig-widget]. Until then, the branded fallback grid shows.
  var feed = document.getElementById('igFeed');
  if (feed) {
    var wid = (feed.getAttribute('data-ig-widget') || '').trim();
    if (wid) {
      var fallback = feed.querySelector('[data-fallback]');
      if (fallback) fallback.remove();

      var iframe = document.createElement('iframe');
      iframe.src = 'https://lightwidget.com/widgets/' + wid + '.html';
      iframe.scrolling = 'no';
      iframe.allowTransparency = 'true';
      iframe.className = 'lightwidget-widget';
      iframe.style.cssText = 'width:100%;border:0;overflow:hidden;';
      feed.appendChild(iframe);

      var lw = document.createElement('script');
      lw.src = 'https://cdn.lightwidget.com/widgets/lightwidget.js';
      lw.async = true;
      document.body.appendChild(lw);
    }
  }
})();
