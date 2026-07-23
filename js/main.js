/* ============================================================
   Petals By Emily — Site JavaScript
   ------------------------------------------------------------
   Each feature is a self-contained init function, called at the
   bottom only if the elements it needs exist on the page. This
   keeps every page loading the same single file safely.

   MODULES
   1.  Mobile nav (fullscreen overlay + hamburger)
   2.  Hide-on-scroll header
   3.  Seasonal banner dismiss
   4.  Hero slideshow
   5.  Falling petals (desktop hero — TRIAL)
   6.  Scroll reveal animations
   7.  Gallery: blur-up image loading
   8.  Gallery: tabs (Natural / Eternal)
   9.  Gallery: lightbox (swipe / arrows / close)
   10. Reviews carousel (auto-advance + dots + swipe)
   11. FAQ accordion
   12. Countdown timer
   13. Copy DM template button
   14. Back-to-top button
   15. Footer year
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. MOBILE NAV ---------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var overlay = document.querySelector(".nav-overlay");
    if (!toggle || !overlay) return;

    function close() { overlay.classList.remove("open"); document.body.style.overflow = ""; }
    toggle.addEventListener("click", function () {
      var open = overlay.classList.toggle("open");
      document.body.style.overflow = open ? "hidden" : "";
    });
    overlay.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
  }

  /* ---------- 2. HIDE-ON-SCROLL HEADER ---------- */
  function initScrollHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var last = 0;
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      // hide when scrolling down past the header, show when scrolling up
      if (y > last && y > 120) header.classList.add("nav-hidden");
      else header.classList.remove("nav-hidden");
      last = y;
    }, { passive: true });
  }

  /* ---------- 3. SEASONAL BANNER DISMISS ---------- */
  function initBanner() {
    var banner = document.querySelector(".season-banner");
    if (!banner) return;
    var closeBtn = banner.querySelector(".banner-close");
    if (closeBtn) closeBtn.addEventListener("click", function () { banner.classList.add("hidden"); });
  }

  /* ---------- 4. HERO SLIDESHOW ---------- */
  function initHero() {
    var slides = document.querySelectorAll(".hero-slide");
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("active");
    }, 6000); // slower timing per spec
  }

  /* ---------- 5. FALLING PETALS (desktop hero, TRIAL) ---------- */
  function initPetals() {
    if (reduceMotion) return;
    if (window.innerWidth < 700) return; // off on mobile per spec
    var hero = document.querySelector(".hero");
    if (!hero || !hero.dataset.petals) return;
    var count = 12;
    for (var p = 0; p < count; p++) {
      var el = document.createElement("span");
      el.className = "petal-fall";
      el.style.left = Math.random() * 100 + "%";
      el.style.animationDuration = (6 + Math.random() * 6) + "s";
      el.style.animationDelay = (Math.random() * 6) + "s";
      el.style.opacity = 0.4 + Math.random() * 0.4;
      hero.appendChild(el);
    }
  }

  /* ---------- 6. SCROLL REVEAL ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. BLUR-UP IMAGE LOADING ---------- */
  function initBlurUp() {
    var imgs = document.querySelectorAll("img[data-full]");
    imgs.forEach(function (img) {
      var full = new Image();
      full.onload = function () {
        img.src = full.src;
        img.classList.remove("loading");
      };
      full.src = img.getAttribute("data-full");
    });
  }

  /* ---------- 8. GALLERY TABS ---------- */
  function initGalleryTabs() {
    var tabs = document.querySelectorAll(".gallery-tab");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        document.querySelectorAll(".masonry").forEach(function (m) { m.classList.add("hidden"); });
        var target = document.getElementById(tab.dataset.target);
        if (target) target.classList.remove("hidden");
      });
    });
  }

  /* ---------- 9. LIGHTBOX ---------- */
  function initLightbox() {
    var lb = document.querySelector(".lightbox");
    if (!lb) return;
    var lbImg = lb.querySelector("img");
    var tiles = [];        // all gallery tile <img> currently in the DOM
    var order = [];        // full-size src list
    var current = 0;

    function collect() {
      // only visible masonry tiles
      order = [];
      tiles = [];
      document.querySelectorAll(".masonry:not(.hidden) .tile img").forEach(function (img) {
        tiles.push(img);
        order.push(img.getAttribute("data-full") || img.src);
      });
    }
    function show(idx) {
      current = (idx + order.length) % order.length;
      lbImg.src = order[current];
    }
    function open(img) {
      collect();
      var idx = tiles.indexOf(img);
      show(idx < 0 ? 0 : idx);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

    document.querySelectorAll(".masonry .tile img").forEach(function (img) {
      img.parentElement.addEventListener("click", function () { open(img); });
    });
    lb.querySelector(".lightbox-close").addEventListener("click", close);
    lb.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    lb.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "ArrowLeft") show(current - 1);
    });

    // touch: swipe left/right to navigate, swipe down to close
    var sx = 0, sy = 0;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) { show(current + (dx < 0 ? 1 : -1)); }
      else if (dy > 80) { close(); }
    }, { passive: true });
  }

  /* ---------- 10. REVIEWS CAROUSEL ---------- */
  function initReviews() {
    var track = document.querySelector(".review-track");
    if (!track) return;
    var slides = track.querySelectorAll(".review-slide");
    var dotsWrap = document.querySelector(".review-dots");
    if (slides.length < 2) return;
    var idx = 0, timer;

    // build dots
    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "review-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Review " + (i + 1));
      dot.addEventListener("click", function () { go(i); reset(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll(".review-dot");

    function go(n) {
      slides[idx].classList.remove("active");
      dots[idx].classList.remove("active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("active");
      dots[idx].classList.add("active");
    }
    function reset() { clearInterval(timer); start(); }
    function start() { if (!reduceMotion) timer = setInterval(function () { go(idx + 1); }, 5500); }

    // pause on hover
    track.addEventListener("mouseenter", function () { clearInterval(timer); });
    track.addEventListener("mouseleave", start);

    // swipe on mobile
    var sx = 0;
    track.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); reset(); }
    }, { passive: true });

    start();
  }

  /* ---------- 11. FAQ ACCORDION ---------- */
  function initFaq() {
    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.parentElement;
        var ans = item.querySelector(".faq-a");
        var open = item.classList.toggle("open");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : null;
      });
    });
  }

  /* ---------- 12. COUNTDOWN ----------
     Reads the target date from [data-deadline="YYYY-MM-DD"].
     ⚠ MAINTENANCE: update the data-deadline in deals.html each
     season, or the countdown will show "Pre-orders closed".      */
  function initCountdown() {
    var el = document.querySelector("[data-deadline]");
    if (!el) return;
    var deadline = new Date(el.getAttribute("data-deadline") + "T23:59:59");
    var caption = document.querySelector(".countdown-caption");
    var fields = {
      months: el.querySelector('[data-cd="months"]'),
      days:   el.querySelector('[data-cd="days"]'),
      hours:  el.querySelector('[data-cd="hours"]'),
      mins:   el.querySelector('[data-cd="mins"]')
    };
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = new Date();
      if (deadline - now <= 0) {
        el.innerHTML = "Pre-orders for this event are now closed &mdash; DM us to check availability.";
        el.style.display = "block";
        if (caption) caption.style.display = "none";
        clearInterval(timer);
        return;
      }
      // whole calendar months first, then the remainder
      var cursor = new Date(now), months = 0, next;
      while (true) {
        next = new Date(cursor);
        next.setMonth(next.getMonth() + 1);
        if (next <= deadline) { cursor = next; months++; } else break;
      }
      var diff = deadline - cursor;
      var days = Math.floor(diff / 86400000);
      var hrs  = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      if (fields.months) fields.months.textContent = pad(months);
      if (fields.days)   fields.days.textContent   = pad(days);
      if (fields.hours)  fields.hours.textContent  = pad(hrs);
      if (fields.mins)   fields.mins.textContent   = pad(mins);
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------- 13. COPY DM TEMPLATE ---------- */
  function initCopy() {
    var btn = document.querySelector(".copy-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var text = document.querySelector(".dm-template pre").innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add("copied");
        var original = btn.textContent;
        btn.textContent = "Copied! ✓";
        setTimeout(function () { btn.textContent = original; btn.classList.remove("copied"); }, 2000);
      });
    });
  }

  /* ---------- 14. BACK-TO-TOP ---------- */
  function initToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.pageYOffset > 600);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 15. FOOTER YEAR ---------- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- INIT ALL ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initScrollHeader();
    initBanner();
    initHero();
    initPetals();
    initReveal();
    initBlurUp();
    initGalleryTabs();
    initLightbox();
    initReviews();
    initFaq();
    initCountdown();
    initCopy();
    initToTop();
    initYear();
  });
})();
