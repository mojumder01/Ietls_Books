(function () {
  var toggle = document.getElementById("menuToggle");
  var sidebar = document.getElementById("sidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
    document.addEventListener("click", function (e) {
      if (window.innerWidth <= 900 && sidebar.classList.contains("open")) {
        if (!sidebar.contains(e.target) && e.target !== toggle) {
          sidebar.classList.remove("open");
        }
      }
    });
  }

  // depth of current page relative to site root, to resolve assets path
  function rootPrefix() {
    var script = document.currentScript || document.querySelector('script[src*="app.js"]');
    var src = script ? script.getAttribute("src") : "assets/app.js";
    return src.replace(/assets\/app\.js$/, "");
  }
  var ROOT = rootPrefix();

  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");
  var indexData = null;

  function loadIndex(cb) {
    if (indexData) return cb(indexData);
    fetch(ROOT + "assets/search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { indexData = data; cb(data); })
      .catch(function () { indexData = []; cb([]); });
  }

  function renderResults(matches) {
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">No results</div>';
      results.classList.add("show");
      return;
    }
    var html = matches.slice(0, 20).map(function (m) {
      return '<a href="' + ROOT + m.url + '"><div class="sr-title">' + m.title + '</div><div class="sr-cat">' + m.category + '</div></a>';
    }).join("");
    results.innerHTML = html;
    results.classList.add("show");
  }

  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { results.classList.remove("show"); results.innerHTML = ""; return; }
      loadIndex(function (data) {
        var matches = data.filter(function (item) {
          return item.title.toLowerCase().indexOf(q) !== -1 ||
                 (item.snippet && item.snippet.toLowerCase().indexOf(q) !== -1);
        });
        renderResults(matches);
      });
    });
    document.addEventListener("click", function (e) {
      if (!results.contains(e.target) && e.target !== input) {
        results.classList.remove("show");
      }
    });
  }

  // per-document page viewer (prev / next / jump) — only one page rendered visible at a time
  function showPage(docId, pageNum) {
    var pages = document.querySelectorAll('.pdf-page[data-doc="' + docId + '"]');
    pages.forEach(function (p) {
      p.hidden = p.getAttribute("data-page") !== String(pageNum);
    });
    var sel = document.querySelector('.page-jump-select[data-doc="' + docId + '"]');
    if (sel && sel.value !== String(pageNum)) sel.value = String(pageNum);
  }

  document.querySelectorAll(".page-jump-select").forEach(function (sel) {
    sel.addEventListener("change", function () {
      showPage(sel.getAttribute("data-doc"), sel.value);
    });
  });

  function step(docId, dir) {
    var sel = document.querySelector('.page-jump-select[data-doc="' + docId + '"]');
    if (!sel) return;
    var idx = sel.selectedIndex + dir;
    if (idx < 0 || idx >= sel.options.length) return;
    sel.selectedIndex = idx;
    showPage(docId, sel.value);
  }

  document.querySelectorAll(".pg-prev").forEach(function (btn) {
    btn.addEventListener("click", function () { step(btn.getAttribute("data-doc"), -1); });
  });
  document.querySelectorAll(".pg-next").forEach(function (btn) {
    btn.addEventListener("click", function () { step(btn.getAttribute("data-doc"), 1); });
  });

  // TOC links to a specific page anchor (#docid-pN) should also flip the viewer to that page
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var href = a.getAttribute("href").slice(1);
      var m = href.match(/^(.+)-p(\d+)$/);
      if (m) showPage(m[1], m[2]);
    });
  });

  // back to top button
  var btn = document.createElement("button");
  btn.className = "back-top";
  btn.innerHTML = "↑";
  btn.title = "Back to top";
  document.body.appendChild(btn);
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) btn.classList.add("show");
    else btn.classList.remove("show");
  });
})();
