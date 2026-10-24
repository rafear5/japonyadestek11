/* Bilgilerinizi buraya yazın.
   whatsapp: ülke koduyla, sadece rakamlar (örnek biçim: 905xxxxxxxxx)
   line: LINE profil bağlantınız (örnek biçim: https://line.me/ti/p/~kullaniciadi) */
var CONFIG = {
  whatsapp: "905302024027",
  line: "https://line.me/ti/p/rafettokaya",
  email: "rafetkaya2003@yahoo.com"
};
var LINE_QR_IMAGE = "assets/line-qr.png";

function waLink(raw) {
  var digits = String(raw || "").replace(/\D/g, "");
  return digits ? "https://wa.me/" + digits : "";
}

function setup(key, link, emptyText, doneText) {
  var qrEl = document.getElementById("qr-" + key);
  var btn = document.getElementById("btn-" + key);
  var hint = document.getElementById("hint-" + key);
  if (!link) {
    qrEl.className = "qr empty";
    qrEl.textContent = emptyText;
    btn.setAttribute("aria-disabled", "true");
    btn.removeAttribute("href");
    hint.textContent = "";
    return;
  }
  btn.setAttribute("href", link);
  hint.textContent = doneText;
  try {
    var q = qrcode(0, "M");
    q.addData(link);
    q.make();
    qrEl.className = "qr filled";
    qrEl.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    var svg = qrEl.querySelector("svg");
    if (svg) svg.setAttribute("role", "img");
    if (svg) svg.setAttribute("aria-label", key + " QR kodu");
  } catch (e) {
    qrEl.className = "qr empty";
    qrEl.textContent = "QR kodu oluşturulamadı";
  }
}

setup("whatsapp", waLink(CONFIG.whatsapp), "WhatsApp QR kodu, numara eklenince burada görünecek", "QR kodunu okutarak sohbet başlatın.");
setup("line", CONFIG.line, "LINE QR kodu, bağlantı eklenince burada görünecek", "QR kodunu okutarak bizi LINE'a ekleyin.");
(function () {
  if (!LINE_QR_IMAGE) return;
  var el = document.getElementById("qr-line");
  el.className = "qr filled";
  el.innerHTML = "";
  var img = document.createElement("img");
  img.src = LINE_QR_IMAGE;
  img.alt = "LINE QR kodu";
  el.appendChild(img);
  document.getElementById("hint-line").textContent = "QR kodunu okutarak bizi LINE'a ekleyin.";
})();

(function () {
  var heroWa = document.getElementById("btn-hero-wa");
  var link = waLink(CONFIG.whatsapp);
  if (link) { heroWa.setAttribute("href", link); }
  else { heroWa.setAttribute("aria-disabled", "true"); heroWa.removeAttribute("href"); }
})();

(function () {
  var form = document.getElementById("randevu-form");
  var dateEl = document.getElementById("tarih");
  var err = document.getElementById("randevu-hata");
  var result = document.getElementById("randevu-sonuc");
  var pre = document.getElementById("randevu-metin");
  var link = document.getElementById("randevu-link");
  var copyBtn = document.getElementById("randevu-kopyala");
  var waDigits = String(CONFIG.whatsapp || "").replace(/\D/g, "");

  try {
    var t = new Date();
    dateEl.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  } catch (e) {}

  var sendBtn = document.getElementById("randevu-gonder");
  var title = document.getElementById("randevu-baslik");
  var tip = document.getElementById("randevu-ipucu");

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ad = document.getElementById("ad").value.trim();
    var tarih = dateEl.value;
    var iletisim = document.getElementById("iletisim-bilgi").value.trim();
    if (!ad) { err.textContent = "Lütfen adınızı yazın."; err.hidden = false; return; }
    if (!iletisim) { err.textContent = "Size dönebilmemiz için e-posta veya WhatsApp numaranızı yazın."; err.hidden = false; return; }
    if (!tarih) { err.textContent = "Lütfen bir tarih seçin."; err.hidden = false; return; }
    err.hidden = true;
    var p = tarih.split("-");
    var saat = document.getElementById("saat").value;
    var konu = document.getElementById("konu").value;
    var tarihTr = p[2] + "." + p[1] + "." + p[0];
    var trSaat = String(parseInt(saat.split(":")[0], 10) - 6).padStart(2, "0") + ":" + saat.split(":")[1];
    var saatTr = saat + " Japonya saati (Türkiye saatiyle " + trSaat + ")";
    var note = document.getElementById("not").value.trim();
    var lines = [
      "Merhaba Rafet Bey, yüz yüze görüşme için randevu talep ediyorum.",
      "Ad: " + ad,
      "İletişim: " + iletisim,
      "Konu: " + konu,
      "Tarih: " + tarihTr,
      "Saat: " + saatTr
    ];
    if (note) lines.push("Not: " + note);
    var msg = lines.join("\n");
    pre.textContent = msg;
    link.setAttribute("href", waDigits ? "https://wa.me/" + waDigits + "?text=" + encodeURIComponent(msg) : "#");
    copyBtn.textContent = "Metni kopyala";

    function show(ok) {
      title.textContent = ok ? "Talebiniz bize ulaştı" : "Talebiniz otomatik gönderilemedi";
      tip.textContent = ok
        ? "En kısa sürede size dönüş yapacağız. Dilerseniz aynı mesajı WhatsApp'tan da iletebilirsiniz."
        : "Bağlantıda bir sorun oldu. Lütfen aşağıdaki WhatsApp düğmesiyle mesajı gönderin.";
      result.hidden = false;
      try { result.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
    }

    var payload = {
      _subject: "Yeni randevu talebi: " + ad + " (" + tarihTr + " " + saat + " JST)",
      _template: "table",
      _captcha: "false",
      _honey: document.getElementById("hp").value,
      "Ad": ad, "İletişim": iletisim, "Konu": konu, "Tarih": tarihTr, "Saat": saatTr, "Not": note || "-"
    };
    sendBtn.disabled = true;
    var oldLabel = sendBtn.textContent;
    sendBtn.textContent = "Gönderiliyor…";
    fetch("https://formsubmit.co/ajax/" + encodeURIComponent(CONFIG.email), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (d) { return r.ok && String(d.success) === "true"; }); })
      .catch(function () { return false; })
      .then(function (ok) {
        sendBtn.disabled = false;
        sendBtn.textContent = oldLabel;
        show(ok);
      });
  });

  copyBtn.addEventListener("click", function () {
    var text = pre.textContent;
    function fallback() {
      try {
        var r = document.createRange();
        r.selectNodeContents(pre);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      } catch (e) {}
      copyBtn.textContent = "Metin seçildi, şimdi kopyalayabilirsiniz";
    }
    try {
      navigator.clipboard.writeText(text).then(function () { copyBtn.textContent = "Kopyalandı"; }, fallback);
    } catch (e) { fallback(); }
  });
})();
