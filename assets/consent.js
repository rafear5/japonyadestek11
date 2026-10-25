/* Çerez onayı: Google Analytics yalnızca ziyaretçi "Kabul et" derse yüklenir. */
(function () {
  var GA_ID = "G-JJGF6EKSPV";
  var KEY = "cerez-onay";
  var doc = document, win = window;

  function read() { try { return win.localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { win.localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAnalytics() {
    if (win.__gaYuklendi) return;
    win.__gaYuklendi = true;
    win.dataLayer = win.dataLayer || [];
    win.gtag = function () { win.dataLayer.push(arguments); };
    var s = doc.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    doc.head.appendChild(s);
    win.gtag("js", new Date());
    win.gtag("config", GA_ID);
  }

  var bar = null;
  function closeBar() { if (bar && bar.parentNode) bar.parentNode.removeChild(bar); bar = null; }

  function policyHref() {
    var scripts = doc.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (/(^|\/)consent\.js$/.test(src)) return src.replace(/assets\/consent\.js$/, "gizlilik/index.html");
    }
    return "gizlilik/index.html";
  }

  function showBar() {
    if (bar) return;
    bar = doc.createElement("div");
    bar.className = "cerez";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Çerez tercihleri");
    bar.innerHTML =
      '<p class="cerez-baslik">Çerez tercihiniz</p>' +
      '<p class="cerez-metin">Siteyi geliştirmek için, yalnızca onay verirseniz, Google Analytics ile ziyaretleri anonim ölçüm amacıyla izliyoruz. Reddederseniz hiçbir analiz çerezi çalışmaz. <a href="' + policyHref() + '">Gizlilik ve çerez politikası</a></p>' +
      '<div class="cerez-butonlar">' +
      '<button type="button" class="btn" data-cerez="kabul">Kabul et</button>' +
      '<button type="button" class="btn ghost" data-cerez="red">Reddet</button>' +
      '</div>';
    doc.body.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-cerez]");
      if (!b) return;
      var v = b.getAttribute("data-cerez");
      write(v);
      closeBar();
      if (v === "kabul") loadAnalytics();
      else if (win.__gaYuklendi) { win.location.reload(); }
    });
  }

  var saved = read();
  if (saved === "kabul") loadAnalytics();
  if (saved !== "kabul" && saved !== "red") {
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", showBar);
    else showBar();
  }

  /* Alt bilgideki "Çerez ayarları" düğmesi bandı yeniden açar */
  doc.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cerez-ayar]");
    if (!t) return;
    e.preventDefault();
    showBar();
  });
})();
