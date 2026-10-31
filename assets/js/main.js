(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var NS = "http://www.w3.org/2000/svg";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Storage, guarded */
  var store = {
    get: function (k, fallback) {
      try { var v = window.localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    }
  };

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (a) { n.setAttribute(a, attrs[a]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (a) { n.setAttribute(a, attrs[a]); });
    return n;
  }
  function rng(seed) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Data */
  var speakers = [
    { id: "ab", photo: "1636144896336-b056be4a8dfe", name: "Anika Bramwell", role: "Head of Product, Lignum Pay", bio: "Anika runs product at Lignum Pay, where her team moved forty thousand market vendors from cash to phone payments in eighteen months. Before that she built lending tools for credit unions in Montego Bay. She will talk about designing for people who have every reason not to trust your app." },
    { id: "dc", photo: "1622124549569-734d5a66859d", name: "Desmond Clarke", role: "Principal Engineer, Coralbase", bio: "Desmond leads the platform team at Coralbase, a database company built for patchy networks. He has spent ten years making software that keeps working when the power and the internet do not. Ask him about offline sync and he will happily miss lunch." },
    { id: "rm", photo: "1625367581235-96f8dd1a0a8b", name: "Renée Morrison", role: "Founder, Tallawah", bio: "Renée started Tallawah from a spare room in Mandeville to help small farmers sell straight to hotels. It now works with nine hundred growers across three islands. She is honest about the two years it nearly failed and what changed." },
    { id: "kl", photo: "1769636929354-59165ba73c7e", name: "Kwame Lindo", role: "Staff Engineer, Quay", bio: "Kwame builds the shipping and customs tools at Quay that clear containers at Kingston port in hours instead of days. He is a maintainer of two open source logistics libraries and teaches a free evening class on systems design in Half Way Tree." },
    { id: "sp", photo: "1769636929388-99eff95d3bf1", name: "Sasha Pinnock", role: "Design Director, Blue Mahoe Labs", bio: "Sasha moved home to Georgetown after a decade designing banking apps in Toronto. At Blue Mahoe Labs she leads a studio of twelve designers working with governments across the region on public services people actually enjoy using." },
    { id: "tg", photo: "1642257859842-c95f9fa8121d", name: "Tevin Grant", role: "CTO, Ledgerline", bio: "Tevin is cofounder and CTO of Ledgerline, accounting software for Caribbean small businesses that understands GCT, NIS and four currencies. He hired his first ten engineers straight out of UTech and still does code review every morning." },
    { id: "nj", photo: "1665296780632-95c2410e31c5", name: "Nadine Joseph", role: "Partner, Seagrape Ventures", bio: "Nadine invests in early stage companies from Trinidad, Jamaica and Barbados and has backed twenty two of them so far. She was an engineer first and still reads the codebase before she reads the deck." },
    { id: "mf", photo: "1565884280295-98eb83e41c65", name: "Marlon Francis", role: "Robotics Lead, Portmore Robotics", bio: "Marlon builds low cost sorting robots for agro processors, assembled in Portmore from mostly local parts. He will bring one on stage and probably take it apart." },
    { id: "ib", photo: "1523297736436-356615162cc8", name: "Imani Baptiste", role: "Product Manager, Coralbase", bio: "Imani came to product from customer support and still answers tickets every Friday. She leads pricing and growth at Coralbase and writes a popular newsletter on selling software to Caribbean businesses." },
    { id: "jr", photo: "1767821853493-cf1aacf60010", name: "Jordan Reid", role: "Machine Learning Engineer, Quay", bio: "Jordan trains the models that read shipping manifests, bills of lading and handwritten customs forms at Quay. He is careful about where machine learning helps and loud about where it does not." },
    { id: "cw", photo: "1665296780585-c78c702f00d6", name: "Celia Whyte", role: "Founder, Kitchen Ledger", bio: "Celia built Kitchen Ledger after running her family's restaurant in Port of Spain for six years. The app now handles stock and payroll for three hundred restaurants. She bootstrapped to profit and has opinions about it." },
    { id: "oh", photo: "1596529257881-85dfcdc8f880", name: "Omari Henry", role: "Security Engineer, Lignum Pay", bio: "Omari keeps Lignum Pay's money moving safely and runs the region's largest security meetup. His talk walks through a real incident, minute by minute, with the logs on screen." }
  ];
  var spk = {};
  speakers.forEach(function (s) { spk[s.id] = s; });

  var agenda = {
    1: [
      { t: "08:00", e: "09:00", title: "Registration and coffee on the terrace", brk: true },
      { id: "d1s1", t: "09:00", e: "09:40", title: "Opening keynote. Building for the people who are already here", sp: ["rm"], room: "Main Hall", track: "Founders" },
      { id: "d1s2", t: "10:00", e: "10:40", title: "Offline first is not an edge case in the Caribbean", sp: ["dc"], room: "Main Hall", track: "Engineering" },
      { id: "d1s3", t: "10:00", e: "10:40", title: "Earning trust in a cash economy", sp: ["ab"], room: "Harbour Room", track: "Product" },
      { id: "d1s4", t: "11:00", e: "12:30", title: "Workshop. Shipping a sync engine on a weekend budget", sp: ["dc", "ib"], room: "Pier Studio", track: "Engineering" },
      { id: "d1s5", t: "11:00", e: "11:40", title: "What I look for before I write a cheque", sp: ["nj"], room: "Gallery", track: "Founders" },
      { t: "12:30", e: "13:30", title: "Lunch by the water", brk: true },
      { id: "d1s6", t: "13:30", e: "14:10", title: "Designing public services people choose to use", sp: ["sp"], room: "Main Hall", track: "Product" },
      { id: "d1s7", t: "14:30", e: "15:10", title: "Reading handwritten customs forms with machine learning", sp: ["jr"], room: "Harbour Room", track: "Engineering" },
      { id: "d1s8", t: "14:30", e: "15:10", title: "Pricing software for businesses that count every dollar", sp: ["ib"], room: "Gallery", track: "Product" },
      { id: "d1s9", t: "15:30", e: "16:10", title: "Two years of nearly failing, an honest postmortem", sp: ["rm", "nj"], room: "Main Hall", track: "Founders" },
      { t: "17:00", e: "19:00", title: "Builders meetup on the terrace", brk: true }
    ],
    2: [
      { t: "08:30", e: "09:00", title: "Coffee and pastries", brk: true },
      { id: "d2s1", t: "09:00", e: "09:40", title: "Morning keynote. From UTech to a team of forty", sp: ["tg"], room: "Main Hall", track: "Founders" },
      { id: "d2s2", t: "10:00", e: "10:40", title: "Clearing a container in four hours", sp: ["kl"], room: "Main Hall", track: "Engineering" },
      { id: "d2s3", t: "10:00", e: "10:40", title: "The research you can do this week with no budget", sp: ["sp"], room: "Harbour Room", track: "Product" },
      { id: "d2s4", t: "11:00", e: "12:30", title: "Workshop. Build a robot arm controller from scratch", sp: ["mf"], room: "Pier Studio", track: "Engineering" },
      { id: "d2s5", t: "11:00", e: "11:40", title: "Bootstrapping to profit in Port of Spain", sp: ["cw"], room: "Gallery", track: "Founders" },
      { t: "12:30", e: "13:30", title: "Lunch by the water", brk: true },
      { id: "d2s6", t: "13:30", e: "14:10", title: "Anatomy of an incident, minute by minute", sp: ["oh"], room: "Main Hall", track: "Engineering" },
      { id: "d2s7", t: "14:30", e: "15:10", title: "Onboarding that works on a three year old phone", sp: ["ab", "ib"], room: "Harbour Room", track: "Product" },
      { id: "d2s8", t: "14:30", e: "15:10", title: "Your first ten hires, and the one you will regret", sp: ["tg", "cw"], room: "Gallery", track: "Founders" },
      { id: "d2s9", t: "15:30", e: "16:20", title: "Closing panel. What the region should build next", sp: ["nj", "kl", "sp"], room: "Main Hall", track: "Product" },
      { t: "18:00", e: "22:00", title: "Closing night on the terrace", brk: true }
    ]
  };
  var allSessions = {};
  [1, 2].forEach(function (d) { agenda[d].forEach(function (s) { if (s.id) { s.day = d; allSessions[s.id] = s; } }); });

  var trackGlyph = {
    Product: '<svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="currentColor"/></svg>',
    Engineering: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="1" width="10" height="10" fill="currentColor"/></svg>',
    Founders: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1l5 10H1z" fill="currentColor"/></svg>'
  };
  var plusIcon = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.6"/></svg>';

  /* Agenda */
  var state = { day: "1", track: "all", saved: store.get("kbw-schedule", []) };
  state.saved = state.saved.filter(function (id) { return allSessions[id]; });
  var list = document.getElementById("sessions");
  var countEl = document.getElementById("mine-count");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  var filtersWrap = document.querySelector(".filters");
  var panel = document.getElementById("agenda-panel");

  function speakerLinks(ids) {
    return ids.map(function (id) {
      return '<button type="button" data-speaker="' + id + '"><img class="face" src="' + photoUrl(spk[id], 96, 96) + '" alt="" width="24" height="24" loading="lazy" decoding="async">' + spk[id].name + "</button>";
    }).join(ids.length > 2 ? ", " : " and ").replace(/, (?=[^,]*$)/, " and ");
  }

  /* Departures board: the time column flips like split flap letters when the day changes */
  var flipNext = false, flipRaf = 0;
  function board(t) {
    return '<b class="board" data-v="' + t + '">' + t.split("").map(function (c) {
      return c === ":" ? '<i class="board__sep">:</i>' : '<i class="board__c">' + c + "</i>";
    }).join("") + "</b>";
  }
  function flipBoard(root) {
    if (reduceMotion) return;
    cancelAnimationFrame(flipRaf);
    var cells = Array.prototype.slice.call(root.querySelectorAll(".board__c")).slice(0, 160);
    var jobs = cells.map(function (c, i) {
      var row = Math.floor(i / 4);
      return { c: c, fin: c.textContent, delay: row * 26 + (i % 4) * 40, steps: 4 + (i % 4) + Math.floor(Math.random() * 3), last: -1 };
    });
    var TICK = 70, t0 = performance.now();
    function frame(now) {
      var busy = false;
      for (var j = 0; j < jobs.length; j++) {
        var job = jobs[j], e = now - t0 - job.delay;
        if (e < 0) { busy = true; continue; }
        var k = Math.floor(e / TICK), frac = (e % TICK) / TICK;
        if (k >= job.steps) {
          if (job.last !== job.steps) { job.c.textContent = job.fin; job.c.style.transform = ""; job.last = job.steps; }
          continue;
        }
        busy = true;
        if (k !== job.last) { job.c.textContent = String((+job.fin + k * 3 + 7) % 10); job.last = k; }
        job.c.style.transform = "perspective(120px) rotateX(" + Math.round((1 - frac) * 70) + "deg)";
      }
      if (busy) flipRaf = requestAnimationFrame(frame);
    }
    flipRaf = requestAnimationFrame(frame);
  }

  function renderAgenda() {
    var items;
    var mine = state.day === "mine";
    if (mine) {
      items = state.saved.map(function (id) { return allSessions[id]; })
        .sort(function (a, b) { return a.day - b.day || a.t.localeCompare(b.t); });
    } else {
      items = agenda[state.day].filter(function (s) { return s.brk || state.track === "all" || s.track === state.track; });
    }
    list.innerHTML = "";
    if (mine && !items.length) {
      var li = el("li", { class: "empty" }, "<strong>Nothing saved yet.</strong><p>Open Day 1 or Day 2 and press the plus beside any session. It will show up here, in order, across both days.</p>");
      list.appendChild(li);
    }
    items.forEach(function (s, i) {
      var li;
      if (s.brk) {
        li = el("li", { class: "session session--break" },
          '<p class="session__time">' + board(s.t) + "</p><p class=\"session__title\">" + s.title + "</p>");
      } else {
        var on = state.saved.indexOf(s.id) > -1;
        li = el("li", { class: "session" },
          '<p class="session__time">' + board(s.t) + "<span>" + board(s.e) + "</span></p>" +
          '<div class="session__main"><h3 class="session__title">' + s.title + "</h3>" +
          '<p class="session__who">' + speakerLinks(s.sp) + "</p></div>" +
          '<div class="session__side"><span class="session__track">' + trackGlyph[s.track] + s.track + "</span><span>" + s.room + "</span>" +
          (mine ? '<span class="session__day">' + (s.day === 1 ? "Thu 11 Mar" : "Fri 12 Mar") + "</span>" : "") + "</div>" +
          '<button class="save" type="button" data-save="' + s.id + '" aria-pressed="' + on + '" aria-label="' + (on ? "Remove from" : "Add to") + " my schedule: " + s.title.replace(/"/g, "") + '">' + plusIcon + "</button>");
      }
      li.style.animationDelay = Math.min(i * 30, 300) + "ms";
      list.appendChild(li);
    });
    countEl.textContent = state.saved.length;
    if (flipNext) { flipNext = false; flipBoard(list); }
    filtersWrap.classList.toggle("is-disabled", mine);
    filters.forEach(function (f) { f.disabled = mine; });
  }

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tab.id);
    if (state.day !== tab.dataset.day) flipNext = true;
    state.day = tab.dataset.day;
    if (focus) tab.focus();
    renderAgenda();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      state.track = f.dataset.track;
      filters.forEach(function (x) { x.setAttribute("aria-pressed", x === f); });
      renderAgenda();
    });
  });
  list.addEventListener("click", function (e) {
    var save = e.target.closest("[data-save]");
    if (save) {
      var id = save.dataset.save;
      var idx = state.saved.indexOf(id);
      if (idx > -1) state.saved.splice(idx, 1); else state.saved.push(id);
      store.set("kbw-schedule", state.saved);
      var on = idx === -1;
      if (state.day === "mine") { renderAgenda(); return; }
      save.setAttribute("aria-pressed", on);
      save.setAttribute("aria-label", (on ? "Remove from" : "Add to") + " my schedule: " + allSessions[id].title);
      countEl.textContent = state.saved.length;
      return;
    }
    var sb = e.target.closest("[data-speaker]");
    if (sb) openSpeaker(sb.dataset.speaker, sb);
  });
  renderAgenda();

  /* Portraits: real photographs, one uniform crop and grade */
  function photoUrl(s, w, h) {
    return "https://images.unsplash.com/photo-" + s.photo + "?auto=format&fit=crop&w=" + w + "&h=" + h + "&q=80&crop=faces";
  }
  function portrait(s, size) {
    var big = size === "large";
    var wrap = el("div", { class: "portrait" });
    var img = el("img", {
      src: photoUrl(s, big ? 640 : 480, big ? 800 : 600),
      srcset: photoUrl(s, 480, 600) + " 480w, " + photoUrl(s, 800, 1000) + " 800w",
      sizes: big ? "200px" : "(max-width: 640px) 50vw, (max-width: 1100px) 30vw, 300px",
      alt: big ? "Portrait of " + s.name : "",
      width: "800", height: "1000",
      loading: big ? "eager" : "lazy", decoding: "async"
    });
    img.addEventListener("error", function () { wrap.classList.add("is-missing"); });
    wrap.appendChild(img);
    return wrap;
  }

  /* Speakers */
  var grid = document.getElementById("speaker-grid");
  speakers.forEach(function (s) {
    var li = el("li", { class: "speaker" });
    var b = el("button", { type: "button", "aria-haspopup": "dialog", "data-speaker": s.id });
    b.appendChild(portrait(s));
    b.appendChild(el("span", { class: "speaker__name" }, s.name));
    b.appendChild(el("span", { class: "speaker__role", style: "display:block" }, s.role));
    li.appendChild(b);
    grid.appendChild(li);
  });
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-speaker]");
    if (b) openSpeaker(b.dataset.speaker, b);
  });

  /* Portraits print in, line by line, as they enter view */
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".portrait"));
  if (!reduceMotion && "IntersectionObserver" in window) {
    grid.classList.add("will-print");
    var pio = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        pio.unobserve(en.target);
        en.target.style.setProperty("--print-delay", (i * 110) + "ms");
        en.target.classList.add("is-printed");
      });
    }, { threshold: 0.25 });
    cards.forEach(function (c) { pio.observe(c); });
  }

  /* and lean a few degrees toward the cursor */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var tiltEl = null, tx = 0, ty = 0, tiltRaf = 0;
    function applyTilt() {
      tiltRaf = 0;
      if (tiltEl) tiltEl.style.transform = "perspective(700px) rotateX(" + (-ty * 5).toFixed(2) + "deg) rotateY(" + (tx * 6).toFixed(2) + "deg)";
    }
    grid.addEventListener("pointermove", function (e) {
      var p = e.target.closest(".portrait");
      if (p !== tiltEl && tiltEl) tiltEl.style.transform = "";
      tiltEl = p;
      if (!p) return;
      var r = p.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
    });
    grid.addEventListener("pointerleave", function () { if (tiltEl) tiltEl.style.transform = ""; tiltEl = null; });
  }

  var sheet = document.getElementById("speaker-sheet");
  var lastTrigger = null;
  function openSpeaker(id, trigger) {
    var s = spk[id];
    lastTrigger = trigger;
    document.getElementById("sheet-name").textContent = s.name;
    document.getElementById("sheet-role").textContent = s.role;
    document.getElementById("sheet-bio").textContent = s.bio;
    var p = document.getElementById("sheet-portrait");
    p.innerHTML = "";
    p.appendChild(portrait(s, "large"));
    var ul = document.getElementById("sheet-sessions");
    ul.innerHTML = "";
    Object.keys(allSessions).forEach(function (k) {
      var x = allSessions[k];
      if (x.sp.indexOf(id) > -1) {
        ul.appendChild(el("li", null, '<span class="when">' + (x.day === 1 ? "Thu 11 Mar" : "Fri 12 Mar") + ", " + x.t + ", " + x.room + "</span><strong>" + x.title + "</strong>"));
      }
    });
    if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function closeSheet() {
    if (sheet.open) { if (typeof sheet.close === "function") sheet.close(); else sheet.removeAttribute("open"); }
  }
  sheet.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  });
  sheet.addEventListener("click", function (e) {
    if (e.target === sheet || e.target.closest("[data-close]")) closeSheet();
  });

  /* Hero: generative map of downtown Kingston, drawn in WebGL */
  (function () {
    var hero = document.getElementById("hero");
    var canvas = document.getElementById("harbour");
    var pin = document.getElementById("hero-pin");
    var harbourLabel = document.getElementById("hero-harbour");
    if (!hero || !canvas) return;

    var LIME = [0.902, 0.890, 0.843], GOLD = [0.949, 0.698, 0.200], MIST = [0.561, 0.702, 0.776];
    var geo = null, W = 0, H = 0, DPR = 1;
    var trails = [], lastNode = -1, lastSpawn = 0, lastPointer = -1e9, lastAuto = 0;
    var t0 = performance.now(), running = false, visible = true, raf = 0;

    /* Geometry */
    function build(w, h) {
      var r = rng("kingston" + Math.round(w / 50));
      var mobile = w < 700;
      var s = Math.max(34, Math.min(72, w / 20));
      var rowH = s * 0.84;
      function coast(x) {
        var u = x / w;
        return h * (mobile ? 0.6 : 0.66) + (u - 0.5) * (u - 0.5) * h * 0.12 - Math.sin(u * 3.4) * h * 0.018;
      }
      var venueX = w * (mobile ? 0.7 : 0.64);
      var cols = Math.ceil(w / s) + 2, rows = Math.ceil(h / rowH) + 1;
      var coreI0 = Math.round(venueX / s) - 5, coreI1 = coreI0 + 8;
      var nodes = [], idx = {}, edges = [];
      function addNode(x, y) { nodes.push({ x: x, y: y, adj: [] }); return nodes.length - 1; }
      function addEdge(a, b, major) {
        if (a < 0 || b < 0 || a === b) return;
        var A = nodes[a], B = nodes[b];
        var len = Math.hypot(A.x - B.x, A.y - B.y);
        A.adj.push([b, len]); B.adj.push([a, len]);
        edges.push({ a: a, b: b, major: major });
      }
      for (var i = -1; i <= cols; i++) {
        for (var jj = 0; jj <= rows; jj++) {
          var core = i >= coreI0 && i <= coreI1;
          var x = i * s + (venueX % s) - s * 0.5;
          var y = jj * rowH + 10;
          var jit = core ? 0 : s * 0.32;
          x += (r() - 0.5) * jit; y += (r() - 0.5) * jit;
          var bend = core ? 0 : (i < coreI0 ? -1 : 1) * (y - coast(x)) * 0.06 * (core ? 0 : 1);
          x += bend;
          if (y < coast(x) - 18) idx[i + "," + jj] = addNode(x, y);
        }
      }
      function at(i, jj) { var k = idx[i + "," + jj]; return k == null ? -1 : k; }
      for (i = -1; i <= cols; i++) {
        for (jj = 0; jj <= rows; jj++) {
          var a = at(i, jj); if (a < 0) continue;
          var inCore = i >= coreI0 && i <= coreI1;
          var drop = inCore ? 0 : 0.2;
          if (r() > drop) addEdge(a, at(i + 1, jj), false);
          if (r() > drop * 0.8) addEdge(a, at(i, jj + 1), false);
        }
      }
      /* Coast road */
      var coastNodes = [];
      for (i = -1; i <= cols; i++) {
        var cx = i * s + (venueX % s) - s * 0.5;
        var cn = addNode(cx, coast(cx) - 6);
        coastNodes.push(cn);
        if (coastNodes.length > 1) addEdge(coastNodes[coastNodes.length - 2], cn, true);
        for (jj = rows; jj >= 0; jj--) { var g = at(i, jj); if (g >= 0) { addEdge(g, cn, false); break; } }
      }
      /* Two long avenues running inland */
      function avenue(i, jj, di) {
        var prev = -1;
        for (var k = 0; k < 40; k++) {
          var n = at(i + di * k, jj - k);
          if (n < 0) { if (jj - k < 0) break; continue; }
          if (prev >= 0) addEdge(prev, n, true);
          prev = n;
        }
      }
      var baseRow = 0;
      for (jj = rows; jj >= 0; jj--) { if (at(coreI0, jj) >= 0) { baseRow = jj; break; } }
      avenue(coreI0, baseRow, -1);
      avenue(coreI1, baseRow, 1);
      /* King Street: the column through the hall */
      var kingI = Math.round(venueX / s) - Math.round(((venueX % s) - s * 0.5) / s);
      for (jj = 0; jj < rows; jj++) {
        var ka = at(kingI, jj), kb = at(kingI, jj + 1);
        if (ka >= 0 && kb >= 0) edges.forEach(function (e) { if ((e.a === ka && e.b === kb) || (e.a === kb && e.b === ka)) e.major = true; });
      }
      /* Venue */
      var venue = coastNodes[0], best = 1e9;
      coastNodes.forEach(function (n) { var d = Math.abs(nodes[n].x - venueX); if (d < best) { best = d; venue = n; } });

      /* Shortest path tree from the hall */
      var dist = nodes.map(function () { return Infinity; }), parent = nodes.map(function () { return -1; });
      var done = nodes.map(function () { return false; });
      dist[venue] = 0;
      for (var it = 0; it < nodes.length; it++) {
        var u = -1, du = Infinity;
        for (var q = 0; q < nodes.length; q++) if (!done[q] && dist[q] < du) { du = dist[q]; u = q; }
        if (u < 0) break;
        done[u] = true;
        nodes[u].adj.forEach(function (ed) {
          var nd = du + ed[1];
          if (nd < dist[ed[0]]) { dist[ed[0]] = nd; parent[ed[0]] = u; }
        });
      }
      var maxDist = 0;
      dist.forEach(function (d) { if (d < Infinity && d > maxDist) maxDist = d; });

      /* Static line list */
      var V = nodes[venue];
      var lines = [];
      function radial(x, y) { return Math.hypot(x - V.x, y - V.y) / Math.hypot(w, h); }
      function pushLine(ax, ay, bx, by, width, col, alpha) {
        if (Math.hypot(ax - V.x, ay - V.y) > Math.hypot(bx - V.x, by - V.y)) { var tx = ax, ty = ay; ax = bx; ay = by; bx = tx; by = ty; }
        lines.push({ ax: ax, ay: ay, bx: bx, by: by, w: width, c: col, a: alpha, delay: 0.1 + radial(ax, ay) * 1.6 });
      }
      edges.forEach(function (e) {
        var A = nodes[e.a], B = nodes[e.b];
        pushLine(A.x, A.y, B.x, B.y, e.major ? 1.5 : 1, LIME, e.major ? 0.42 : 0.17);
      });
      /* The Parade: a square in the grid north of the hall */
      var pi = kingI - 1, pj = baseRow - 4;
      var p1 = at(pi, pj), p2 = at(pi + 2, pj + 2);
      if (p1 >= 0 && p2 >= 0) {
        var P1 = nodes[p1], P2 = nodes[p2], inset = s * 0.18;
        var xs = [P1.x + inset, P2.x - inset], ys = [P1.y + inset, P2.y - inset];
        pushLine(xs[0], ys[0], xs[1], ys[0], 1, LIME, 0.32);
        pushLine(xs[1], ys[0], xs[1], ys[1], 1, LIME, 0.32);
        pushLine(xs[1], ys[1], xs[0], ys[1], 1, LIME, 0.32);
        pushLine(xs[0], ys[1], xs[0], ys[0], 1, LIME, 0.32);
      }
      /* Shoreline */
      for (var x0 = -10; x0 < w + 10; x0 += 8) pushLine(x0, coast(x0) + 4, x0 + 8, coast(x0 + 8) + 4, 1.6, LIME, 0.7);
      /* Palisadoes, the long spit closing the harbour */
      var spit = [];
      var sy0 = coast(w) + (h - coast(w)) * (mobile ? 0.7 : 0.62);
      for (var k = 0; k <= 40; k++) {
        var u2 = k / 40;
        var sx = w + 20 - u2 * w * (mobile ? 0.75 : 0.62);
        var sy = sy0 + Math.sin(u2 * Math.PI * 0.9) * (h - sy0) * 0.45 - u2 * u2 * 30;
        spit.push([sx, sy]);
      }
      for (k = 1; k < spit.length; k++) pushLine(spit[k - 1][0], spit[k - 1][1], spit[k][0], spit[k][1], 1.6, LIME, 0.55);
      var tip = spit[spit.length - 1];
      function spitY(x) {
        for (var q2 = 1; q2 < spit.length; q2++) if (x <= spit[q2 - 1][0] && x >= spit[q2][0]) return spit[q2][1];
        return null;
      }
      /* Water, as broken horizontal strokes */
      for (var wy = 0; wy < h; wy += 13) {
        var wx = -20 + r() * 30;
        while (wx < w) {
          var len = 8 + r() * 46;
          var cy = wy;
          if (cy > coast(wx) + 16 && cy > coast(wx + len) + 16) {
            var spy = spitY(wx), spy2 = spitY(wx + len);
            var clear = (spy == null || Math.abs(cy - spy) > 10) && (spy2 == null || Math.abs(cy - spy2) > 10);
            if (clear) pushLine(wx, cy, wx + len, cy, 1, MIST, 0.16 + r() * 0.1);
          }
          wx += len + 10 + r() * 40;
        }
      }
      /* Ferry line from the pier to Port Royal */
      var fx0 = V.x + s * 1.2, fy0 = coast(V.x + s * 1.2) + 8;
      var steps = 18;
      for (k = 0; k < steps; k += 2) {
        var ua = k / steps, ub = (k + 1) / steps;
        var bx0 = fx0 + (tip[0] - fx0) * ua, by0 = fy0 + (tip[1] - fy0) * ua + Math.sin(ua * Math.PI) * 30;
        var bx1 = fx0 + (tip[0] - fx0) * ub, by1 = fy0 + (tip[1] - fy0) * ub + Math.sin(ub * Math.PI) * 30;
        pushLine(bx0, by0, bx1, by1, 1.2, GOLD, 0.45);
      }

      var origins = [];
      nodes.forEach(function (n, q3) { if (dist[q3] > maxDist * 0.35 && dist[q3] < Infinity) origins.push(q3); });
      return { nodes: nodes, lines: lines, venue: venue, parent: parent, dist: dist, maxDist: maxDist, origins: origins, coast: coast, tip: tip, mobile: mobile };
    }

    function routeFor(start) {
      var pts = [], n = start, guard = 0;
      while (n >= 0 && guard++ < 2000) { pts.push(geo.nodes[n]); if (n === geo.venue) break; n = geo.parent[n]; }
      if (pts[pts.length - 1] !== geo.nodes[geo.venue]) return null;
      var segs = [], acc = 0;
      for (var i = 1; i < pts.length; i++) {
        var d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        segs.push({ ax: pts[i - 1].x, ay: pts[i - 1].y, bx: pts[i].x, by: pts[i].y, da: acc, db: acc + d });
        acc += d;
      }
      return { segs: segs, len: acc, origin: pts[0] };
    }

    function spawn(start, now, complete) {
      var rt = routeFor(start);
      if (!rt || rt.len < 30) return;
      rt.born = now; rt.head = complete ? rt.len + 400 : 0; rt.life = 1; rt.arrived = complete ? now : 0;
      trails.push(rt);
      if (trails.length > 7) trails.shift();
    }

    /* Rendering backends */
    var gl = null, prog, buf, tbuf, staticCount = 0, loc = {};
    try {
      gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true, alpha: false }) || null;
    } catch (e) { gl = null; }

    var VS = [
      "attribute vec4 aSeg; attribute vec2 aCorner; attribute float aWidth; attribute vec4 aColor; attribute vec3 aExtra;",
      "uniform vec2 uRes; uniform float uDpr; uniform float uTime; uniform float uMode;",
      "varying float vAlong; varying float vSide; varying vec4 vColor; varying float vProg; varying float vD; varying float vW;",
      "void main(){",
      " vec2 a = aSeg.xy, b = aSeg.zw; vec2 dir = b - a; float L = max(length(dir), 0.0001); dir /= L;",
      " vec2 nrm = vec2(-dir.y, dir.x); float w = aWidth + 1.0;",
      " vec2 p = mix(a, b, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * w * 0.5 + nrm * aCorner.y * w * 0.5;",
      " vAlong = aCorner.x; vSide = aCorner.y; vColor = aColor; vW = w;",
      " vProg = uMode < 0.5 ? clamp((uTime - aExtra.x) / 0.55, 0.0, 1.0) : 1.0;",
      " vD = mix(aExtra.y, aExtra.z, aCorner.x);",
      " vec2 clip = (p / uRes) * 2.0 - 1.0; gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);",
      "}"
    ].join("\n");
    var FS = [
      "precision highp float;",
      "uniform float uMode; uniform float uHead; uniform float uTail; uniform float uLife; uniform float uDpr;",
      "varying float vAlong; varying float vSide; varying vec4 vColor; varying float vProg; varying float vD; varying float vW;",
      "void main(){",
      " if (vAlong > vProg) discard;",
      " float edge = 1.0 - smoothstep(1.0 - 1.6 / (vW * uDpr), 1.0, abs(vSide));",
      " float a = vColor.a * edge;",
      " if (uMode > 0.5) {",
      "  if (vD > uHead) discard;",
      "  float k = clamp(1.0 - (uHead - vD) / uTail, 0.0, 1.0);",
      "  a *= max(k * k, 0.38) * uLife;",
      " }",
      " gl_FragColor = vec4(vColor.rgb * a, a);",
      "}"
    ].join("\n");

    function compile(type, src) {
      var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    }
    if (gl) {
      try {
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
        gl.useProgram(prog);
        ["aSeg", "aCorner", "aWidth", "aColor", "aExtra"].forEach(function (n) { loc[n] = gl.getAttribLocation(prog, n); });
        ["uRes", "uDpr", "uTime", "uMode", "uHead", "uTail", "uLife"].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
        buf = gl.createBuffer(); tbuf = gl.createBuffer();
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      } catch (e) { gl = null; }
    }
    var ctx2d = gl ? null : canvas.getContext("2d");
    hero.classList.add(gl ? "is-webgl" : "is-2d");

    var CORNERS = [[0, -1], [1, -1], [1, 1], [0, -1], [1, 1], [0, 1]];
    var STRIDE = 14;
    function pack(list, out, o, mode) {
      list.forEach(function (L) {
        var col = L.c || GOLD, alpha = L.a == null ? 1 : L.a;
        CORNERS.forEach(function (c) {
          out[o++] = L.ax; out[o++] = L.ay; out[o++] = L.bx; out[o++] = L.by;
          out[o++] = c[0]; out[o++] = c[1]; out[o++] = L.w;
          out[o++] = col[0]; out[o++] = col[1]; out[o++] = col[2]; out[o++] = alpha;
          out[o++] = mode ? 0 : L.delay; out[o++] = L.da || 0; out[o++] = L.db || 0;
        });
      });
      return o;
    }
    function bindAttribs() {
      var F = 4;
      gl.vertexAttribPointer(loc.aSeg, 4, gl.FLOAT, false, STRIDE * F, 0);
      gl.vertexAttribPointer(loc.aCorner, 2, gl.FLOAT, false, STRIDE * F, 4 * F);
      gl.vertexAttribPointer(loc.aWidth, 1, gl.FLOAT, false, STRIDE * F, 6 * F);
      gl.vertexAttribPointer(loc.aColor, 4, gl.FLOAT, false, STRIDE * F, 7 * F);
      gl.vertexAttribPointer(loc.aExtra, 3, gl.FLOAT, false, STRIDE * F, 11 * F);
      ["aSeg", "aCorner", "aWidth", "aColor", "aExtra"].forEach(function (n) { gl.enableVertexAttribArray(loc[n]); });
    }

    /* Small square and dot markers drawn as short thick lines */
    function markerLines(now) {
      var out = [], V = geo.nodes[geo.venue];
      out.push({ ax: V.x - 7, ay: V.y, bx: V.x + 7, by: V.y, w: 14, c: GOLD, a: 1, da: 0, db: 0 });
      trails.forEach(function (t) {
        var o = t.origin;
        out.push({ ax: o.x - 2.5, ay: o.y, bx: o.x + 2.5, by: o.y, w: 5, c: LIME, a: 0.9 * t.life, da: 0, db: 0 });
        if (t.head < t.len) {
          var seg = null;
          for (var i = 0; i < t.segs.length; i++) if (t.head <= t.segs[i].db) { seg = t.segs[i]; break; }
          if (seg) {
            var u = (t.head - seg.da) / Math.max(seg.db - seg.da, 0.001);
            var hx = seg.ax + (seg.bx - seg.ax) * u, hy = seg.ay + (seg.by - seg.ay) * u;
            out.push({ ax: hx - 3, ay: hy, bx: hx + 3, by: hy, w: 6, c: GOLD, a: 1, da: 0, db: 0 });
          }
        }
      });
      return out;
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width)); H = Math.max(1, Math.round(rect.height));
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      geo = build(W, H);
      trails = [];
      if (gl) {
        var arr = new Float32Array(geo.lines.length * 6 * STRIDE);
        pack(geo.lines, arr, 0, false);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
        staticCount = geo.lines.length * 6;
      }
      var V = geo.nodes[geo.venue];
      var pw = pin.offsetWidth || 150;
      var px = V.x + 14 + pw > W - 12 ? V.x - 14 - pw : V.x + 14;
      pin.style.transform = "translate(" + Math.round(px) + "px," + Math.round(V.y - 26) + "px)";
      pin.classList.add("is-placed");
      var hy = geo.coast(W * 0.1) + (geo.mobile ? 34 : 54);
      harbourLabel.style.transform = "translate(" + Math.round(W * (geo.mobile ? 0.05 : 0.04)) + "px," + Math.round(hy) + "px)";
      harbourLabel.classList.add("is-placed");
      if (reduceMotion) {
        var picks = geo.origins.filter(function (_, i) { return i % Math.max(1, Math.floor(geo.origins.length / 4)) === 0; }).slice(0, 4);
        picks.forEach(function (o) { spawn(o, 0, true); });
      }
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      if (reduceMotion) t = 99;
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.059, 0.231, 0.341, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(loc.uRes, W, H);
        gl.uniform1f(loc.uDpr, DPR);
        gl.uniform1f(loc.uTime, t);
        gl.uniform1f(loc.uMode, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        bindAttribs();
        gl.drawArrays(gl.TRIANGLES, 0, staticCount);
        if (t > 1.2) {
          gl.uniform1f(loc.uMode, 1);
          var lists = trails.map(function (tr) { return tr.segs.map(function (sg) { return { ax: sg.ax, ay: sg.ay, bx: sg.bx, by: sg.by, w: 2.4, c: GOLD, a: 1, da: sg.da, db: sg.db }; }); });
          var total = 0; lists.forEach(function (l) { total += l.length; });
          var marks = markerLines(now);
          var arr = new Float32Array((total + marks.length) * 6 * STRIDE), o = 0;
          lists.forEach(function (l) { o = pack(l, arr, o, true); });
          pack(marks, arr, o, true);
          gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
          gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
          bindAttribs();
          var first = 0;
          gl.uniform1f(loc.uTail, 260);
          trails.forEach(function (tr, i) {
            gl.uniform1f(loc.uHead, tr.head);
            gl.uniform1f(loc.uLife, tr.life);
            gl.drawArrays(gl.TRIANGLES, first, lists[i].length * 6);
            first += lists[i].length * 6;
          });
          gl.uniform1f(loc.uHead, 1e9); gl.uniform1f(loc.uTail, 1e9); gl.uniform1f(loc.uLife, 1);
          gl.drawArrays(gl.TRIANGLES, first, marks.length * 6);
        }
      } else if (ctx2d) {
        ctx2d.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx2d.fillStyle = "#0F3B57"; ctx2d.fillRect(0, 0, W, H);
        function rgba(c, a) { return "rgba(" + Math.round(c[0] * 255) + "," + Math.round(c[1] * 255) + "," + Math.round(c[2] * 255) + "," + a + ")"; }
        geo.lines.forEach(function (L) {
          ctx2d.strokeStyle = rgba(L.c, L.a); ctx2d.lineWidth = L.w;
          ctx2d.beginPath(); ctx2d.moveTo(L.ax, L.ay); ctx2d.lineTo(L.bx, L.by); ctx2d.stroke();
        });
        trails.forEach(function (tr) {
          ctx2d.strokeStyle = rgba(GOLD, 0.8); ctx2d.lineWidth = 2.4; ctx2d.beginPath();
          tr.segs.forEach(function (sg) { ctx2d.moveTo(sg.ax, sg.ay); ctx2d.lineTo(sg.bx, sg.by); });
          ctx2d.stroke();
        });
        var V = geo.nodes[geo.venue];
        ctx2d.fillStyle = rgba(GOLD, 1); ctx2d.fillRect(V.x - 7, V.y - 7, 14, 14);
      }
    }

    function step(now) {
      raf = 0;
      if (!running) return;
      var dt = Math.min(0.05, (now - (step.prev || now)) / 1000);
      step.prev = now;
      var t = (now - t0) / 1000;
      if (t > 2.2 && now - lastPointer > 2600 && now - lastAuto > 1500 && geo.origins.length) {
        lastAuto = now;
        spawn(geo.origins[Math.floor(Math.random() * geo.origins.length)], now);
      }
      trails.forEach(function (tr) {
        if (tr.head < tr.len + 260) tr.head += 760 * dt;
        else { if (!tr.arrived) tr.arrived = now; tr.life = Math.max(0, 1 - (now - tr.arrived) / 1800); }
      });
      trails = trails.filter(function (tr) { return tr.life > 0; });
      draw(now);
      raf = requestAnimationFrame(step);
    }
    function start() {
      if (running || reduceMotion) return;
      running = true; step.prev = 0; raf = requestAnimationFrame(step);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    function nearest(x, y) {
      var best = -1, bd = 70 * 70;
      geo.nodes.forEach(function (n, i) {
        var d = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y);
        if (d < bd && geo.dist[i] < Infinity) { bd = d; best = i; }
      });
      return best;
    }
    function onPointer(e) {
      if (reduceMotion || !geo) return;
      var rect = hero.getBoundingClientRect();
      var now = performance.now();
      lastPointer = now;
      var n = nearest(e.clientX - rect.left, e.clientY - rect.top);
      if (n >= 0 && n !== lastNode && now - lastSpawn > 110) {
        lastNode = n; lastSpawn = now;
        spawn(n, now);
      }
    }
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerdown", onPointer, { passive: true });

    resize();
    draw(performance.now());
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }).observe(hero);
    } else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (visible) start(); });
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var rect = hero.getBoundingClientRect();
        if (Math.round(rect.width) === W && Math.abs(Math.round(rect.height) - H) < 120) return;
        t0 = performance.now() - 5000; resize(); draw(performance.now());
      }, 150);
    });
    window.kbwSpawnRoute = function () { if (geo && geo.origins.length) spawn(geo.origins[Math.floor(Math.random() * geo.origins.length)], performance.now()); };
  })();

  /* Load sequence */
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add("ready"); }); });

  /* Sticky nav border and mobile menu */
  var nav = document.querySelector(".nav");
  window.addEventListener("scroll", function () { nav.classList.toggle("is-stuck", window.scrollY > 8); }, { passive: true });
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("navlinks");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open);
    links.classList.toggle("is-open", open);
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); links.classList.remove("is-open"); }
  });

  /* Stat counters, rolling like an odometer */
  var nums = document.querySelectorAll("[data-count]");
  var strip = "";
  for (var sd = 0; sd < 20; sd++) strip += "<i>" + (sd % 10) + "</i>";
  Array.prototype.forEach.call(nums, function (n) {
    var txt = (+n.dataset.count).toLocaleString("en-US");
    n.setAttribute("aria-label", txt);
    n.classList.add("odo");
    n.innerHTML = txt.split("").map(function (c) {
      return /\d/.test(c) ? '<span class="odo__d" aria-hidden="true" data-d="' + c + '"><span class="odo__s">' + strip + "</span></span>" : '<span aria-hidden="true">' + c + "</span>";
    }).join("");
  });
  function rollAll(root) {
    var ds = root.querySelectorAll(".odo__d");
    Array.prototype.forEach.call(ds, function (d, i) {
      var s = d.firstChild;
      s.style.transitionDelay = reduceMotion ? "0s" : (i * 90) + "ms";
      s.style.transform = "translateY(" + (-(10 + +d.dataset.d) * 5) + "%)";
    });
  }
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        requestAnimationFrame(function () { rollAll(en.target); });
      });
    }, { threshold: 0.6 });
    io.observe(document.querySelector(".stats__line"));
  } else {
    doc.classList.add("odo-static");
    rollAll(document);
  }

  /* FAQ, one open at a time */
  var dets = document.querySelectorAll(".faq details");
  dets.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) dets.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* Registration */
  var form = document.getElementById("reg-form");
  var confirmBox = document.getElementById("confirm");
  var totalEl = document.getElementById("total");
  function fmt(n) { return "J$" + n.toLocaleString("en-US"); }
  form.addEventListener("change", function (e) {
    if (e.target.name === "ticket") totalEl.textContent = fmt(+e.target.dataset.price);
  });
  function setErr(input, msg) {
    var err = document.getElementById(input.getAttribute("aria-describedby"));
    err.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !msg;
  }
  function validate(input) {
    var v = input.value.trim();
    if (input.name === "name") {
      if (!v) return setErr(input, "Enter your full name so we can print it on your badge.");
      if (v.length < 2) return setErr(input, "That name looks too short.");
      return setErr(input, "");
    }
    if (!v) return setErr(input, "Enter an email so we can send your ticket.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setErr(input, "Check the email address, it should look like name@example.com.");
    return setErr(input, "");
  }
  ["f-name", "f-email"].forEach(function (id) {
    var i = document.getElementById(id);
    i.addEventListener("blur", function () { if (i.value) validate(i); });
    i.addEventListener("input", function () { if (i.getAttribute("aria-invalid")) validate(i); });
  });

  function drawQR(svg, seed) {
    svg.innerHTML = "";
    var r = rng(seed), n = 29;
    svg.appendChild(svgEl("rect", { x: 0, y: 0, width: n, height: n, fill: "#EDEEE8" }));
    function finder(x, y) {
      svg.appendChild(svgEl("rect", { x: x, y: y, width: 7, height: 7, fill: "#131512" }));
      svg.appendChild(svgEl("rect", { x: x + 1, y: y + 1, width: 5, height: 5, fill: "#EDEEE8" }));
      svg.appendChild(svgEl("rect", { x: x + 2, y: y + 2, width: 3, height: 3, fill: "#131512" }));
    }
    function reserved(x, y) {
      return (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9) || (x >= 20 && x <= 24 && y >= 20 && y <= 24);
    }
    /* one path per row so the code can draw itself in, top to bottom */
    for (var y = 0; y < n; y++) {
      var d = "";
      for (var x = 0; x < n; x++) {
        if (reserved(x, y)) continue;
        var on = (y === 6 || x === 6) ? (x + y) % 2 === 0 : r() > 0.52;
        if (on) d += "M" + x + " " + y + "h1v1h-1z";
      }
      if (d) svg.appendChild(svgEl("path", { d: d, fill: "#131512", class: "qr-row", style: "animation-delay:" + (1100 + y * 34) + "ms" }));
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    svg.appendChild(svgEl("rect", { x: 20, y: 20, width: 5, height: 5, fill: "#131512" }));
    svg.appendChild(svgEl("rect", { x: 21, y: 21, width: 3, height: 3, fill: "#EDEEE8" }));
    svg.appendChild(svgEl("rect", { x: 22, y: 22, width: 1, height: 1, fill: "#131512" }));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("f-name");
    var email = document.getElementById("f-email");
    var ok1 = validate(name), ok2 = validate(email);
    if (!ok1 || !ok2) { (ok1 ? email : name).focus(); return; }
    var t = form.querySelector('input[name="ticket"]:checked');
    var first = name.value.trim().split(/\s+/)[0];
    var ref = "KBW27" + Math.floor(100000 + rng(email.value + Date.now())() * 899999);
    document.getElementById("confirm-msg").textContent = "You're in, " + first + ". Here is your ticket.";
    document.getElementById("t-name").textContent = name.value.trim();
    document.getElementById("t-type").textContent = t.value + ", " + fmt(+t.dataset.price);
    document.getElementById("t-ref").textContent = ref;
    document.getElementById("t-email").textContent = "We sent a copy to " + email.value.trim() + ". This is a concept site, so no payment was taken.";
    drawQR(document.getElementById("t-qr"), ref + name.value);
    form.hidden = true;
    confirmBox.hidden = false;
    confirmBox.focus();
  });
  document.getElementById("reg-again").addEventListener("click", function () {
    form.reset();
    totalEl.textContent = fmt(24000);
    confirmBox.hidden = true;
    form.hidden = false;
    document.getElementById("f-name").focus();
  });
})();
