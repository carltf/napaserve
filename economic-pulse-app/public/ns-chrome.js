/* ns-chrome.js — injects the shared NapaServe site chrome (nav + drawer +
   footer) into any standalone public/ page, so pages outside the React SPA get
   the same nav and footer without hand-copying the markup. Pair with
   /ns-chrome.css.

   SINGLE SOURCE OF TRUTH for static-page chrome: edit NAV_GROUPS / FOOTER here
   (and the styles in ns-chrome.css) and every page that includes this script
   updates. Keep in sync with src/NavBar.jsx and src/Footer.jsx.

   A page marks its active nav item with  <body data-ns-current="/maps">. */
(function () {
  "use strict";

  var NAV_GROUPS = [
    { label: "Journalism", desc: "Original reporting and searchable archives", links: [
      ["Napa Valley Features", "/news"], ["NVF Archive Search", "/archive"],
      ["Under the Hood", "/under-the-hood"], ["The Green Library", "/green-library.html"] ] },
    { label: "Community", desc: "Events, workforce and civic innovation", links: [
      ["Event Finder", "/events"], ["Valley Works", "/valley-works"], ["VW Labs", "/vw-labs"] ] },
    { label: "Intelligence", desc: "Data, analysis and AI-assisted research", links: [
      ["Community Pulse", "/dashboard"], ["Maps & Atlases", "/maps"], ["Project Evaluator", "/evaluator"],
      ["Research Agent", "/agent"], ["Models & Calculators", "/under-the-hood/calculators"] ] },
    { label: "Platform", desc: "About NapaServe and how to reach us", links: [
      ["About NapaServe", "/about"], ["Contact", "/about#contact"], ["Admin", "/admin"] ] }
  ];

  var FOOTER_COLS = [
    { h: "Intelligence", links: [ ["Community Pulse", "/dashboard"], ["Maps & Atlases", "/maps"],
      ["Project Evaluator", "/evaluator"], ["Research Agent", "/agent"], ["Models & Calculators", "/under-the-hood/calculators"] ] },
    { h: "Journalism", links: [ ["Napa Valley Features", "/news"], ["NVF Archive Search", "/archive"],
      ["Under the Hood", "/under-the-hood"], ["The Green Library", "/green-library.html"],
      ["Sonoma Co. Features ↗", "https://sonomacountyfeatures.substack.com", 1],
      ["Lake Co. Features ↗", "https://lakecountyfeatures.substack.com", 1] ] },
    { h: "Community", links: [ ["Event Finder", "/events"], ["Submit an event", "/events#submit"],
      ["Valley Works", "/valley-works"], ["VW Labs", "/vw-labs"] ] },
    { h: "Platform", links: [ ["About NapaServe", "/about"], ["How to use this site", "/about#how-to-use"],
      ["Disclaimer", "/about#disclaimer"], ["Contact us", "mailto:info@napaserve.com"] ] }
  ];

  var current = document.body.getAttribute("data-ns-current") || "";
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function ext(url) { return /^https?:/.test(url); }

  // --- fonts (idempotent) ---
  if (!document.getElementById("ns-chrome-fonts")) {
    var f = document.createElement("link");
    f.id = "ns-chrome-fonts"; f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap";
    document.head.appendChild(f);
  }

  // --- nav + drawer ---
  var groupsHTML = NAV_GROUPS.map(function (g) {
    var links = g.links.map(function (l) {
      var isCur = l[1] === current;
      return '<a class="ns-link' + (isCur ? " ns-current" : "") + '" href="' + l[1] + '"' +
        (isCur ? ' aria-current="page"' : "") + '>' + esc(l[0]) + "</a>";
    }).join("");
    return '<div class="ns-group"><div class="ns-group-label">' + esc(g.label) +
      '</div><div class="ns-group-desc">' + esc(g.desc) + "</div>" + links + "</div>";
  }).join("");

  var navHTML =
    '<nav class="ns-nav"><div class="ns-nav-left">' +
      '<a href="/" class="ns-wordmark">NapaServe</a>' +
      '<span class="ns-tagline">Community Intelligence · Napa County</span></div>' +
      '<button class="ns-hamburger" id="nsHamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nsDrawer">' +
      "<span></span><span></span><span></span></button></nav>" +
    '<div class="ns-overlay" id="nsOverlay" hidden></div>' +
    '<aside class="ns-drawer" id="nsDrawer" hidden aria-label="Site navigation">' +
      '<a href="/" class="ns-drawer-home">← NapaServe Home</a>' + groupsHTML + "</aside>";

  // --- footer ---
  var colsHTML = FOOTER_COLS.map(function (c) {
    var links = c.links.map(function (l) {
      var attr = l[2] ? ' target="_blank" rel="noopener noreferrer"' : "";
      return '<a href="' + l[1] + '"' + attr + ">" + esc(l[0]) + "</a>";
    }).join("");
    return '<div class="ns-fcol"><h4>' + esc(c.h) + "</h4>" + links + "</div>";
  }).join("");

  var footHTML =
    '<footer class="ns-footer"><div class="ns-footer-inner">' +
      '<div class="ns-fbrand"><p class="ns-fbrand-n">NapaServe</p>' +
      '<p class="ns-fbrand-d">Community intelligence for Napa County · A Valley Works Collaborative · VW Labs project</p></div>' +
      '<div class="ns-fgrid">' + colsHTML + "</div>" +
      '<div class="ns-fgrid-news">' +
        '<div class="ns-fcol"><h4>Follow</h4>' +
          '<a href="https://bsky.app/profile/valleyworkscollab.bsky.social" target="_blank" rel="noopener noreferrer">Bluesky ↗</a>' +
          '<a href="https://napavalleyfocus.substack.com/" target="_blank" rel="noopener noreferrer">Substack ↗</a></div>' +
        '<div class="ns-fcol ns-fnews"><h4>Newsletter</h4>' +
          '<p class="ns-fnews-copy">Original reporting, economic updates and community intelligence from Napa Valley Features — delivered when it matters.</p>' +
          '<form id="nsSub" class="ns-sub-form">' +
            '<input id="nsSubName" class="ns-sub-in" type="text" placeholder="Your name" aria-label="Your name">' +
            '<input id="nsSubEmail" class="ns-sub-in" type="email" placeholder="Your email address" aria-label="Email address">' +
            '<button type="submit" class="ns-sub-btn" id="nsSubBtn">Subscribe</button></form>' +
          '<p id="nsSubMsg" class="ns-sub-msg" hidden></p></div>' +
      "</div>" +
      '<div class="ns-fbottom">' +
        "<span>© 2026 Valley Works Collaborative · Not affiliated with Napa County government.</span>" +
        '<a href="mailto:info@napaserve.com">info@napaserve.com</a></div>' +
    "</div></footer>";

  document.body.insertAdjacentHTML("afterbegin", navHTML);
  document.body.insertAdjacentHTML("beforeend", footHTML);

  // --- drawer behavior (mirrors NavBar.jsx) ---
  var ham = document.getElementById("nsHamburger");
  var drawer = document.getElementById("nsDrawer");
  var overlay = document.getElementById("nsOverlay");
  function setOpen(open) {
    ham.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.hidden = !open; overlay.hidden = !open;
  }
  ham.addEventListener("click", function () { setOpen(drawer.hidden); });
  overlay.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

  // --- newsletter (mirrors Footer.jsx — same worker endpoint) ---
  var form = document.getElementById("nsSub");
  var msg = document.getElementById("nsSubMsg");
  var btn = document.getElementById("nsSubBtn");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("nsSubName").value.trim();
    var email = document.getElementById("nsSubEmail").value.trim();
    btn.disabled = true; btn.textContent = "Subscribing…";
    fetch("https://misty-bush-fc93.tfcarl.workers.dev/api/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, email: email })
    }).then(function (r) {
      if (!r.ok) throw new Error("failed");
      msg.hidden = false; msg.style.color = "#2E7D32";
      msg.textContent = "Welcome to NapaServe. We'll be in touch.";
      form.reset();
    }).catch(function () {
      msg.hidden = false; msg.style.color = "#C62828";
      msg.textContent = "Something went wrong. Email us at info@napaserve.com";
    }).finally(function () { btn.disabled = false; btn.textContent = "Subscribe"; });
  });

  // Injecting the nav shifts everything below it down; any map (Leaflet, etc.)
  // that sized itself before this ran needs to recompute. Explorer pages listen
  // for resize and call map.invalidateSize(), so a single resize event fixes it.
  window.dispatchEvent(new Event("resize"));
})();
