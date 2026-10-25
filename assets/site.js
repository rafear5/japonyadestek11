/* Rafet Kaya | Japonya Destek — ortak davranışlar (menü, kaydırma, animasyonlar) */
(function () {
  var doc = document, win = window;
  var reduce = win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  var topbar = $("#topbar"), progress = $("#progress"), btn = $("#menu-btn"), panel = $("#menu-panel");

  /* ---------- Menü ---------- */
  function setMenu(open) {
    if (!panel) return;
    panel.classList.toggle("open", open);
    btn.classList.toggle("open", open);
    doc.body.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  }
  if (btn && panel) {
    btn.addEventListener("click", function () { setMenu(!panel.classList.contains("open")); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("open")) { setMenu(false); btn.focus(); }
    });
    win.addEventListener("resize", function () { if (win.innerWidth >= 720) setMenu(false); });
  }

  /* ---------- Sabit WhatsApp düğmesi ---------- */
  var waFloat = $(".wa-float");

  /* ---------- Kaydırma: üst çubuk, ilerleme çizgisi ---------- */
  var ticking = false;

  function frame() {
    ticking = false;
    var y = win.scrollY, vh = win.innerHeight;
    if (topbar) topbar.classList.toggle("scrolled", y > 10);
    if (progress) {
      var h = doc.documentElement.scrollHeight - vh;
      progress.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    }
    if (waFloat) waFloat.classList.toggle("show", y > 560);
    if (y < 300) $$(".nav-desktop a.active, .menu-panel a.active").forEach(function (a) { if (a.getAttribute("href").charAt(0) === "#") a.classList.remove("active"); });
  }
  function onScroll() { if (!ticking) { ticking = true; win.requestAnimationFrame(frame); } }
  win.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("resize", onScroll);
  frame();

  /* ---------- Sayfa içi bağlantılar: kapat, kaydır, varılan başlığı vurgula ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var hash = a.getAttribute("href");
      if (a.getAttribute("aria-disabled") === "true") return;
      if (!hash || hash.charAt(0) !== "#" || hash.length < 2) return;
      var target = hash === "#top" ? doc.body : $(hash);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      if (hash === "#top") win.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      if (win.history && history.replaceState) history.replaceState(null, "", hash === "#top" ? location.pathname + location.search : hash);
      if (!reduce && hash !== "#top") {
        target.classList.remove("pulse");
        win.setTimeout(function () { target.classList.add("pulse"); }, 500);
      }
    });
  });

  /* Menüdeki bağlantılar başka sayfaya giderken de menü kapansın */
  $$(".menu-panel a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Hangi bölümdeyiz ---------- */
  if ("IntersectionObserver" in win) {
    var links = {};
    $$(".nav-desktop a[href^='#'], .menu-panel li a[href^='#']").forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      (links[id] = links[id] || []).push(a);
    });
    if (Object.keys(links).length) {
      var secObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.getAttribute("aria-labelledby");
          Object.keys(links).forEach(function (k) {
            links[k].forEach(function (a) { a.classList.toggle("active", k === id); });
          });
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      $$("section[aria-labelledby]").forEach(function (s) { secObs.observe(s); });
    }
  }

  /* ---------- Başlıkları kelime kelime böl ---------- */
  function splitWords(el) {
    var plain = el.textContent.replace(/\s+/g, " ").trim();
    var n = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.nodeValue.split(/(\s+)/);
          var frag = doc.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(" ")); return; }
            var w = doc.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
            var s = doc.createElement("span"); s.textContent = p; s.style.setProperty("--wi", n++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) { walk(c); }
      });
    }
    walk(el);
    el.setAttribute("aria-label", plain);
    el.classList.add("split");
  }

  var canAnimate = !reduce && "IntersectionObserver" in win;
  if (canAnimate) {
    var heads = $$("h1, .promise, section > h2, .ask > h2, .cta > h2");
    heads.forEach(function (h, i) {
      splitWords(h);
      if (h.tagName === "H1") h.style.setProperty("--base", ".15s");
      if (h.classList.contains("promise")) h.style.setProperty("--base", ".5s");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        /* Fotoğraflar kırpıldığı için kendileri değil, kapsayıcıları izlenir */
        if (en.target._shots) en.target._shots.forEach(function (f) { f.classList.add("in"); });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    $$(".split").forEach(function (h) { io.observe(h); });

    var items = $$(".group-lead, .group > h3, .statement, .chips li, .sub, .items li, .reasons li, .steps li, .card, .form, .shot, .faq details, .others a, .choices a, .cta > p, .cta .hero-actions, section > .lead");
    items.forEach(function (el) {
      if (el.closest(".hero")) return;
      var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", Math.min(idx, 5) * 0.12 + "s");
      el.classList.add("reveal");
      if (el.classList.contains("shot")) {
        var par = el.parentElement;
        (par._shots = par._shots || []).push(el);
        io.observe(par);
      } else { io.observe(el); }
    });
  }

  /* ---------- Sayfalar arası yumuşak geçiş ---------- */
  if (!reduce) {
    doc.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.protocol !== location.protocol || a.host !== location.host) return;
      if (a.pathname === location.pathname && a.hash) return;
      if (a.hasAttribute("download")) return;
      e.preventDefault();
      doc.documentElement.classList.add("leaving");
      win.setTimeout(function () { location.href = a.href; }, 380);
    });
    win.addEventListener("pageshow", function (e) {
      if (e.persisted) doc.documentElement.classList.remove("leaving");
    });
  }
})();
