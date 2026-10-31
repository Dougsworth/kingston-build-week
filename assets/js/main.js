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
    { id: "rm", photo: "1641741478121-5c1f3d02c236", name: "Renée Morrison", role: "Founder, Tallawah", bio: "Renée started Tallawah from a spare room in Mandeville to help small farmers sell straight to hotels. It now works with nine hundred growers across three islands. She is honest about the two years it nearly failed and what changed." },
    { id: "kl", photo: "1769636929354-59165ba73c7e", name: "Kwame Lindo", role: "Staff Engineer, Quay", bio: "Kwame builds the shipping and customs tools at Quay that clear containers at Kingston port in hours instead of days. He is a maintainer of two open source logistics libraries and teaches a free evening class on systems design in Half Way Tree." },
    { id: "sp", photo: "1613730317185-5c455649f89d", name: "Sasha Pinnock", role: "Design Director, Blue Mahoe Labs", bio: "Sasha moved home to Georgetown after a decade designing banking apps in Toronto. At Blue Mahoe Labs she leads a studio of twelve designers working with governments across the region on public services people actually enjoy using." },
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

  /* Hero: the island draws itself, then the camera dives into downtown Kingston. WebGL, with a 2D fallback. */
  (function () {
    var hero = document.getElementById("hero");
    var canvas = document.getElementById("harbour");
    var pin = document.getElementById("hero-pin");
    var harbourLabel = document.getElementById("hero-harbour");
    var townTip = document.getElementById("hero-town");
    var DATA = window.KBW_JAMAICA;
    if (!hero || !canvas || !DATA) return;

    var LIME = [0.914, 0.925, 0.902], GOLD = [0.949, 0.698, 0.200], MIST = [0.561, 0.702, 0.776], BG = [0.059, 0.231, 0.341];

    /* World space is kilometres from the hall, x east, y south */
    var LON0 = -76.7928, LAT0 = 17.9663, KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KY = 110.57;
    function wx(lon) { return (lon - LON0) * KX; }
    function wy(lat) { return -(lat - LAT0) * KY; }
    function pairs(flat) { var o = []; for (var i = 0; i < flat.length; i += 2) o.push([wx(flat[i]), wy(flat[i + 1])]); return o; }
    var COAST = pairs(DATA.coast), PARISH = DATA.parishes.map(pairs);
    var ISL = (function () {
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      COAST.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
    })();
    function inside(x, y) {
      var c = false;
      for (var i = 0, j = COAST.length - 1; i < COAST.length; j = i++) {
        var a = COAST[i], b = COAST[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
      }
      return c;
    }
    /* North shore of Kingston Harbour, west to east */
    var SHORE = [[-76.8500, 17.9923], [-76.8368, 17.9864], [-76.8191, 17.9753], [-76.7982, 17.9634], [-76.7777, 17.9639], [-76.7475, 17.9634], [-76.7344, 17.9606], [-76.7293, 17.9560], [-76.7224, 17.9496], [-76.7077, 17.9460], [-76.6923, 17.9400]]
      .map(function (p) { return [wx(p[0]), wy(p[1])]; });
    function shoreY(x) {
      if (x <= SHORE[0][0]) return SHORE[0][1];
      for (var i = 1; i < SHORE.length; i++) if (x <= SHORE[i][0]) {
        var u = (x - SHORE[i - 1][0]) / (SHORE[i][0] - SHORE[i - 1][0]);
        return SHORE[i - 1][1] + (SHORE[i][1] - SHORE[i - 1][1]) * u;
      }
      return SHORE[SHORE.length - 1][1];
    }
    var TOWNS = [
      { name: "Negril", lon: -78.3481, lat: 18.2683, time: "About four hours by road" },
      { name: "Montego Bay", lon: -77.8939, lat: 18.4762, time: "About three hours by road" },
      { name: "Mandeville", lon: -77.5071, lat: 18.0417, time: "About an hour and a half by road" },
      { name: "Ocho Rios", lon: -77.1031, lat: 18.4076, time: "About an hour and a half by road" },
      { name: "Spanish Town", lon: -76.9574, lat: 17.9911, time: "About thirty minutes by road" },
      { name: "Port Antonio", lon: -76.4508, lat: 18.1757, time: "About two and a half hours by road" }
    ];
    TOWNS.forEach(function (tw) { tw.x = wx(tw.lon); tw.y = wy(tw.lat); tw.last = -1e9; });

    /* Timeline, in seconds */
    var T_TOWNS = 1.9, TZ0 = 3.3, TZ1 = 5.9, TS = TZ0 + 1.0;
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function smooth(a, b, v) { var x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
    function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

    var geo = null, W = 0, H = 0, DPR = 1;
    var routes = [], arcs = [], lastNode = -1, lastSpawn = 0, lastPointer = -1e9, lastAuto = 0, lastArc = 0, hoverTown = null;
    var t0 = performance.now(), running = false, visible = true, raf = 0;

    function relRect(elm, text) {
      var hr = hero.getBoundingClientRect(), r;
      if (text) { var rg = document.createRange(); rg.selectNodeContents(elm); r = rg.getBoundingClientRect(); } else r = elm.getBoundingClientRect();
      var ty = 0;
      try { var m = new DOMMatrix(getComputedStyle(elm).transform); ty = m.m42 || 0; } catch (e) { ty = 0; }
      return { l: r.left - hr.left, t: r.top - hr.top - ty, r: r.right - hr.left, b: r.bottom - hr.top - ty };
    }
    function hits(a, b, pad) { return a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad; }

    function camAt(t) {
      var e = ease(clamp((t - TZ0) / (TZ1 - TZ0), 0, 1));
      var k = Math.exp(Math.log(geo.k0) + (Math.log(geo.k1) - Math.log(geo.k0)) * e);
      var sx = geo.S0[0] + (geo.Pv[0] - geo.S0[0]) * e, sy = geo.S0[1] + (geo.Pv[1] - geo.S0[1]) * e;
      return { ox: sx - geo.V[0] * k, oy: sy - geo.V[1] * k, k: k, e: e };
    }
    function toScreen(cam, x, y) { return [cam.ox + x * cam.k, cam.oy + y * cam.k]; }

    /* Geometry */
    function build(w, h) {
      var r = rng("kingston" + Math.round(w / 50));
      var mobile = w < 700;
      var lines = document.querySelectorAll(".hero__line");
      var L = Array.prototype.map.call(lines, function (n) { return relRect(n, true); });
      var meta = relRect(document.querySelector(".hero__meta"));
      var gut = parseFloat(getComputedStyle(document.querySelector(".hero__content")).paddingLeft) || 16;
      gut = Math.min(gut, 56);
      var avoid = L.concat([meta]);

      /* Opening view: the whole island in the right half, clear of the title */
      var bx0 = mobile ? gut : Math.max(w * 0.5, L[1].r + 56), bx1 = w - gut;
      var k0 = (bx1 - bx0) / ISL.w;
      var cy0 = mobile ? (L[2].b + meta.t) / 2 : Math.min((L[1].t + meta.t) / 2 + 20, meta.t - ISL.h * k0 / 2 - 48);
      /* Street view */
      var s = Math.max(34, Math.min(72, w / 20));
      var k1 = s / 0.3;
      var Pv = mobile ? [w * 0.66, Math.max(L[2].b + 110, h * 0.48)] : [Math.max(w * 0.62, L[1].r + 150), h * 0.36];
      var V = [0, shoreY(0) - 6 / k1];
      var S0 = [(bx0 + bx1) / 2 + (V[0] - ISL.cx) * k0, cy0 + (V[1] - ISL.cy) * k0];
      /* Locator inset, top right */
      var pad = mobile ? 10 : 16;
      var iw = mobile ? Math.min(170, w - gut - (L[2].r + 24)) : 300;
      var kin = (iw - pad * 2) / ISL.w;
      var ih = ISL.h * kin + pad * 2;
      var inset = { l: w - gut - iw, t: mobile ? L[1].b + 10 : L[0].t + 8, w: iw, h: ih };
      inset.r = inset.l + iw; inset.b = inset.t + ih;
      var icx = inset.l + iw / 2, icy = inset.t + ih / 2;
      var icam = { ox: icx - ISL.cx * kin, oy: icy - ISL.cy * kin, k: kin };

      var out = { coast: [], detail: [], street: [] };
      function seg(group, ax, ay, bx, by, wd, col, alpha, delay, dur) {
        out[group].push({ ax: ax, ay: ay, bx: bx, by: by, w: wd, c: col, a: alpha, delay: delay, dur: dur || 0 });
      }

      /* Coastline, drawn by two pens leaving Kingston in opposite directions */
      var n = COAST.length, i0 = 0, bd = 1e9;
      COAST.forEach(function (p, i) { var d = p[0] * p[0] + p[1] * p[1]; if (d < bd) { bd = d; i0 = i; } });
      var cum = [0];
      for (var i = 1; i <= n; i++) { var A = COAST[(i0 + i - 1) % n], B = COAST[(i0 + i) % n]; cum.push(cum[i - 1] + Math.hypot(B[0] - A[0], B[1] - A[1])); }
      var per = cum[n];
      for (i = 0; i < n; i++) {
        var a = COAST[(i0 + i) % n], b = COAST[(i0 + i + 1) % n];
        var along = Math.min(cum[i], per - cum[i + 1]);
        var fwd = cum[i] <= per - cum[i + 1];
        seg("coast", fwd ? a[0] : b[0], fwd ? a[1] : b[1], fwd ? b[0] : a[0], fwd ? b[1] : a[1], 1.3, LIME, 0.82, 0.25 + (along / (per / 2)) * 1.55, 0.14);
      }
      /* Parish boundaries, faint and dashed */
      PARISH.forEach(function (ch) {
        var d0 = 1.0 + r() * 0.7, on = true, carry = 0;
        for (var q = 1; q < ch.length; q++) {
          var A = ch[q - 1], B = ch[q], len = Math.hypot(B[0] - A[0], B[1] - A[1]), u = 0;
          while (u < len) {
            var step = Math.min(1.1 - carry, len - u);
            if (on) seg("detail", A[0] + (B[0] - A[0]) * u / len, A[1] + (B[1] - A[1]) * u / len, A[0] + (B[0] - A[0]) * (u + step) / len, A[1] + (B[1] - A[1]) * (u + step) / len, 1, LIME, 0.16, d0, 0.5);
            u += step; carry += step;
            if (carry >= 1.1 - 1e-6) { carry = 0; on = !on; }
          }
        }
      });
      /* Blue Mountains contours, narrowing toward the peak */
      var C = [wx(-76.66), wy(18.064)], PK = [wx(-76.579), wy(18.046)], th = 0.1;
      [1, 0.82, 0.65, 0.49, 0.34, 0.2].forEach(function (sc, ri) {
        var cx = C[0] + (PK[0] - C[0]) * (1 - sc), cy = C[1] + (PK[1] - C[1]) * (1 - sc);
        var ph = r() * 6.28, prev = null, N = 84;
        for (var q = 0; q <= N; q++) {
          var f = q / N * Math.PI * 2;
          var rr = sc * (1 + 0.07 * Math.sin(3 * f + ph) + 0.04 * Math.sin(5 * f + ph * 2));
          var ex = Math.cos(f) * 21 * rr, ey = Math.sin(f) * 7.5 * rr;
          var p = [cx + ex * Math.cos(th) - ey * Math.sin(th), cy + ex * Math.sin(th) + ey * Math.cos(th)];
          if (prev && inside(p[0], p[1]) && inside(prev[0], prev[1])) seg("detail", prev[0], prev[1], p[0], p[1], 1, MIST, 0.18 + ri * 0.03, 1.35 + ri * 0.13, 0.6);
          prev = p;
        }
      });

      /* Street grid, laid out in the pixels of the final view, then stored in kilometres */
      function coast(x) { return Pv[1] + (shoreY((x - Pv[0]) / k1 + V[0]) - V[1]) * k1; }
      function toW(px, py) { return [(px - Pv[0]) / k1 + V[0], (py - Pv[1]) / k1 + V[1]]; }
      var venueX = Pv[0], rowH = s * 0.84;
      var cols = Math.ceil(w / s) + 2, rows = Math.ceil(h / rowH) + 1;
      var coreI0 = Math.round(venueX / s) - 5, coreI1 = coreI0 + 8;
      var nodes = [], idx = {}, edges = [];
      function addNode(x, y) { nodes.push({ x: x, y: y, adj: [] }); return nodes.length - 1; }
      function addEdge(a, b, major) {
        if (a < 0 || b < 0 || a === b) return;
        var A = nodes[a], B = nodes[b], len = Math.hypot(A.x - B.x, A.y - B.y);
        A.adj.push([b, len]); B.adj.push([a, len]);
        edges.push({ a: a, b: b, major: major });
      }
      for (i = -1; i <= cols; i++) {
        for (var jj = 0; jj <= rows; jj++) {
          var core = i >= coreI0 && i <= coreI1;
          var x = i * s + (venueX % s) - s * 0.5, y = jj * rowH + 10;
          var jit = core ? 0 : s * 0.32;
          x += (r() - 0.5) * jit; y += (r() - 0.5) * jit;
          if (!core) x += (i < coreI0 ? -1 : 1) * (y - coast(x)) * 0.06;
          if (y < coast(x) - 18) idx[i + "," + jj] = addNode(x, y);
        }
      }
      function at(i, jj) { var k = idx[i + "," + jj]; return k == null ? -1 : k; }
      for (i = -1; i <= cols; i++) for (jj = 0; jj <= rows; jj++) {
        var na = at(i, jj); if (na < 0) continue;
        var drop = i >= coreI0 && i <= coreI1 ? 0 : 0.2;
        if (r() > drop) addEdge(na, at(i + 1, jj), false);
        if (r() > drop * 0.8) addEdge(na, at(i, jj + 1), false);
      }
      var coastNodes = [];
      for (i = -1; i <= cols; i++) {
        var cx2 = i * s + (venueX % s) - s * 0.5;
        var cn = addNode(cx2, coast(cx2) - 6);
        coastNodes.push(cn);
        if (coastNodes.length > 1) addEdge(coastNodes[coastNodes.length - 2], cn, true);
        for (jj = rows; jj >= 0; jj--) { var g = at(i, jj); if (g >= 0) { addEdge(g, cn, false); break; } }
      }
      function avenue(i, jj, di) {
        var prev = -1;
        for (var k = 0; k < 40; k++) {
          var nn = at(i + di * k, jj - k);
          if (nn < 0) { if (jj - k < 0) break; continue; }
          if (prev >= 0) addEdge(prev, nn, true);
          prev = nn;
        }
      }
      var baseRow = 0;
      for (jj = rows; jj >= 0; jj--) { if (at(coreI0, jj) >= 0) { baseRow = jj; break; } }
      avenue(coreI0, baseRow, -1);
      avenue(coreI1, baseRow, 1);
      var kingI = Math.round(venueX / s) - Math.round(((venueX % s) - s * 0.5) / s);
      for (jj = 0; jj < rows; jj++) {
        var ka = at(kingI, jj), kb = at(kingI, jj + 1);
        if (ka >= 0 && kb >= 0) edges.forEach(function (e) { if ((e.a === ka && e.b === kb) || (e.a === kb && e.b === ka)) e.major = true; });
      }
      var venue = coastNodes[0]; bd = 1e9;
      coastNodes.forEach(function (q) { var d = Math.abs(nodes[q].x - venueX); if (d < bd) { bd = d; venue = q; } });

      /* Shortest path tree from the hall */
      var dist = nodes.map(function () { return Infinity; }), parent = nodes.map(function () { return -1; }), done = nodes.map(function () { return false; });
      dist[venue] = 0;
      for (var it = 0; it < nodes.length; it++) {
        var u = -1, du = Infinity;
        for (var q = 0; q < nodes.length; q++) if (!done[q] && dist[q] < du) { du = dist[q]; u = q; }
        if (u < 0) break;
        done[u] = true;
        nodes[u].adj.forEach(function (ed) { var nd = du + ed[1]; if (nd < dist[ed[0]]) { dist[ed[0]] = nd; parent[ed[0]] = u; } });
      }
      var maxDist = 0;
      dist.forEach(function (d) { if (d < Infinity && d > maxDist) maxDist = d; });

      var VN = nodes[venue];
      function street(ax, ay, bx, by, wd, col, alpha) {
        if (Math.hypot(ax - VN.x, ay - VN.y) > Math.hypot(bx - VN.x, by - VN.y)) { var tx = ax, ty = ay; ax = bx; ay = by; bx = tx; by = ty; }
        var A = toW(ax, ay), B = toW(bx, by);
        seg("street", A[0], A[1], B[0], B[1], wd, col, alpha, TS + Math.hypot(ax - VN.x, ay - VN.y) / Math.hypot(w, h) * 1.5, 0.5);
      }
      edges.forEach(function (e) {
        var A = nodes[e.a], B = nodes[e.b];
        street(A.x, A.y, B.x, B.y, e.major ? 1.5 : 1, LIME, e.major ? 0.42 : 0.17);
      });
      /* The Parade, at its real spot north of the hall */
      var PP = toScreen({ ox: Pv[0] - V[0] * k1, oy: Pv[1] - V[1] * k1, k: k1 }, wx(-76.7930), wy(17.9706));
      var hs = s * 0.62;
      street(PP[0] - hs, PP[1] - hs, PP[0] + hs, PP[1] - hs, 1, LIME, 0.34);
      street(PP[0] + hs, PP[1] - hs, PP[0] + hs, PP[1] + hs, 1, LIME, 0.34);
      street(PP[0] + hs, PP[1] + hs, PP[0] - hs, PP[1] + hs, 1, LIME, 0.34);
      street(PP[0] - hs, PP[1] + hs, PP[0] - hs, PP[1] - hs, 1, LIME, 0.34);
      /* Water, as broken strokes, only where the real map has sea */
      function wet(px, py) { var p = toW(px, py); return !inside(p[0], p[1]); }
      for (var wy0 = 0; wy0 < h; wy0 += 13) {
        var wx0 = -20 + r() * 30;
        while (wx0 < w) {
          var len = 8 + r() * 46;
          if (wy0 > coast(wx0) + 16 && wy0 > coast(wx0 + len) + 16 && wet(wx0, wy0 - 9) && wet(wx0 + len, wy0 - 9) && wet(wx0, wy0 + 9) && wet(wx0 + len, wy0 + 9) && wet(wx0 + len / 2, wy0)) {
            street(wx0, wy0, wx0 + len, wy0, 1, MIST, 0.15 + r() * 0.1);
          }
          wx0 += len + 10 + r() * 40;
        }
      }
      /* Ferry from the pier to Port Royal */
      var F0 = [wx(-76.7898), shoreY(wx(-76.7898)) + 0.05], F1 = [wx(-76.8305), wy(17.9415)];
      for (var fk = 0; fk < 22; fk += 2) {
        var ua = fk / 22, ub = (fk + 1) / 22, bow = 0.35;
        seg("street", F0[0] + (F1[0] - F0[0]) * ua, F0[1] + (F1[1] - F0[1]) * ua + Math.sin(ua * Math.PI) * bow, F0[0] + (F1[0] - F0[0]) * ub, F0[1] + (F1[1] - F0[1]) * ub + Math.sin(ub * Math.PI) * bow, 1.2, GOLD, 0.45, TS + 0.6 + ua * 0.6, 0.3);
      }

      var origins = [];
      nodes.forEach(function (nd, q3) { if (dist[q3] > maxDist * 0.35 && dist[q3] < Infinity) origins.push(q3); });
      nodes.forEach(function (nd) { var p = toW(nd.x, nd.y); nd.wx = p[0]; nd.wy = p[1]; });

      /* Labels: keep them clear of the title, the details and the inset */
      var block = avoid.concat([inset]);
      var pw = pin.offsetWidth || 150, ph = 20;
      var px = Pv[0] + 16 + pw > w - 12 ? Pv[0] - 16 - pw : Pv[0] + 16;
      var pinRect = { l: px, t: Pv[1] - 28, r: px + pw, b: Pv[1] - 28 + ph };
      var hb = toScreen({ ox: Pv[0] - V[0] * k1, oy: Pv[1] - V[1] * k1, k: k1 }, wx(-76.800), wy(17.9534));
      var hw = harbourLabel.offsetWidth || 130, hpos = null;
      [0, 1, -1, 2, -2, 3].some(function (k) {
        var x0 = clamp(hb[0] - hw / 2 + k * 90, 12, w - 12 - hw), y0 = hb[1] - 10;
        var rc = { l: x0, t: y0, r: x0 + hw, b: y0 + 20 };
        if (!block.some(function (b) { return hits(rc, b, 12); }) && !hits(rc, pinRect, 12) && y0 < h * 0.86) { hpos = [x0, y0]; return true; }
        return false;
      });

      return {
        lines: out, nodes: nodes, venue: venue, parent: parent, dist: dist, origins: origins, mobile: mobile,
        k0: k0, k1: k1, S0: S0, Pv: Pv, V: V, inset: inset, icam: icam, pin: [px, Pv[1] - 28], harbour: hpos
      };
    }

    function routeFor(start) {
      var pts = [], n = start, guard = 0;
      while (n >= 0 && guard++ < 2000) { pts.push(geo.nodes[n]); if (n === geo.venue) break; n = geo.parent[n]; }
      if (pts[pts.length - 1] !== geo.nodes[geo.venue]) return null;
      var segs = [], acc = 0;
      for (var i = 1; i < pts.length; i++) {
        var d = Math.hypot(pts[i].wx - pts[i - 1].wx, pts[i].wy - pts[i - 1].wy);
        segs.push({ ax: pts[i - 1].wx, ay: pts[i - 1].wy, bx: pts[i].wx, by: pts[i].wy, da: acc, db: acc + d });
        acc += d;
      }
      return { segs: segs, len: acc, ox: pts[0].wx, oy: pts[0].wy };
    }
    function spawn(start, now, complete) {
      var rt = routeFor(start);
      if (!rt || rt.len < 30 / geo.k1) return;
      rt.head = complete ? rt.len * 2 : 0; rt.life = 1; rt.arrived = complete ? now : 0;
      routes.push(rt);
      if (routes.length > 7) routes.shift();
    }
    function arcFor(tw) {
      var ax = tw.x, ay = tw.y, bx = geo.V[0], by = geo.V[1];
      var dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      if (ny > 0) { nx = -nx; ny = -ny; }
      var cx = (ax + bx) / 2 + nx * L * 0.28, cy = (ay + by) / 2 + ny * L * 0.28;
      var segs = [], acc = 0, px = ax, py = ay, N = 28;
      for (var i = 1; i <= N; i++) {
        var u = i / N, qx = (1 - u) * (1 - u) * ax + 2 * u * (1 - u) * cx + u * u * bx, qy = (1 - u) * (1 - u) * ay + 2 * u * (1 - u) * cy + u * u * by;
        var d = Math.hypot(qx - px, qy - py);
        segs.push({ ax: px, ay: py, bx: qx, by: qy, da: acc, db: acc + d });
        acc += d; px = qx; py = qy;
      }
      return { segs: segs, len: acc, head: 0, life: 1, arrived: 0, town: tw };
    }
    function launch(tw, now, complete) {
      var a = arcFor(tw);
      if (complete) { a.head = a.len * 2; a.arrived = now; }
      tw.last = now;
      arcs.push(a);
      if (arcs.length > 8) arcs.shift();
    }

    /* Rendering backends */
    var gl = null, prog, buf, tbuf, loc = {}, ranges = {};
    try { gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true, alpha: false }) || null; } catch (e) { gl = null; }
    var VS = [
      "attribute vec4 aSeg; attribute vec2 aCorner; attribute float aWidth; attribute vec4 aColor; attribute vec3 aExtra;",
      "uniform vec2 uRes; uniform vec3 uCam; uniform float uTime; uniform float uMode;",
      "varying float vAlong; varying float vSide; varying vec4 vColor; varying float vProg; varying float vD; varying float vW;",
      "void main(){",
      " vec2 a = uCam.xy + aSeg.xy * uCam.z, b = uCam.xy + aSeg.zw * uCam.z;",
      " vec2 dir = b - a; float L = max(length(dir), 0.0001); dir /= L;",
      " vec2 nrm = vec2(-dir.y, dir.x); float w = aWidth + 1.0;",
      " vec2 p = mix(a, b, aCorner.x) + dir * (aCorner.x * 2.0 - 1.0) * w * 0.5 + nrm * aCorner.y * w * 0.5;",
      " vAlong = aCorner.x; vSide = aCorner.y; vColor = aColor; vW = w;",
      " float dur = aExtra.y > 0.0 ? aExtra.y : 0.55;",
      " vProg = uMode < 0.5 ? clamp((uTime - aExtra.x) / dur, 0.0, 1.0) : 1.0;",
      " vD = mix(aExtra.y, aExtra.z, aCorner.x);",
      " vec2 clip = (p / uRes) * 2.0 - 1.0; gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);",
      "}"
    ].join("\n");
    var FS = [
      "precision highp float;",
      "uniform float uMode; uniform float uHead; uniform float uTail; uniform float uLife; uniform float uDpr; uniform float uAlpha;",
      "varying float vAlong; varying float vSide; varying vec4 vColor; varying float vProg; varying float vD; varying float vW;",
      "void main(){",
      " if (vAlong > vProg) discard;",
      " float edge = 1.0 - smoothstep(1.0 - 1.6 / (vW * uDpr), 1.0, abs(vSide));",
      " float a = vColor.a * edge * uAlpha;",
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
        ["uRes", "uCam", "uDpr", "uTime", "uMode", "uHead", "uTail", "uLife", "uAlpha"].forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
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
          out[o++] = mode ? 0 : L.delay; out[o++] = mode ? (L.da || 0) : L.dur; out[o++] = mode ? (L.db || 0) : 0;
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

    function resize() {
      var rect = hero.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width)); H = Math.max(1, Math.round(rect.height));
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      geo = build(W, H);
      routes = []; arcs = [];
      if (gl) {
        var all = [], first = 0;
        ["coast", "detail", "street"].forEach(function (g) { ranges[g] = [first * 6, geo.lines[g].length * 6]; first += geo.lines[g].length; all = all.concat(geo.lines[g]); });
        var arr = new Float32Array(all.length * 6 * STRIDE);
        pack(all, arr, 0, false);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      }
      pin.style.transform = "translate(" + Math.round(geo.pin[0]) + "px," + Math.round(geo.pin[1]) + "px)";
      if (geo.harbour) harbourLabel.style.transform = "translate(" + Math.round(geo.harbour[0]) + "px," + Math.round(geo.harbour[1]) + "px)";
      harbourLabel.hidden = !geo.harbour;
      hideTip();
      if (reduceMotion) {
        var picks = geo.origins.filter(function (_, i) { return i % Math.max(1, Math.floor(geo.origins.length / 4)) === 0; }).slice(0, 4);
        picks.forEach(function (o) { spawn(o, 0, true); });
        [1, 3, 5].forEach(function (i) { launch(TOWNS[i], 0, true); });
      }
    }

    /* Squares, outlines and dots in screen space */
    function square(out, x, y, r, col, a) { out.push({ ax: x - 0.01, ay: y, bx: x + 0.01, by: y, w: r * 2 - 1, c: col, a: a }); }
    function outline(out, x, y, r, col, a) {
      out.push({ ax: x - r, ay: y - r, bx: x + r, by: y - r, w: 1, c: col, a: a });
      out.push({ ax: x + r, ay: y - r, bx: x + r, by: y + r, w: 1, c: col, a: a });
      out.push({ ax: x + r, ay: y + r, bx: x - r, by: y + r, w: 1, c: col, a: a });
      out.push({ ax: x - r, ay: y + r, bx: x - r, by: y - r, w: 1, c: col, a: a });
    }
    function headPoint(tr) {
      for (var i = 0; i < tr.segs.length; i++) {
        var sg = tr.segs[i];
        if (tr.head <= sg.db) { var u = (tr.head - sg.da) / Math.max(sg.db - sg.da, 1e-6); return [sg.ax + (sg.bx - sg.ax) * u, sg.ay + (sg.by - sg.ay) * u]; }
      }
      return null;
    }

    function frameState(t, now) {
      var cam = camAt(t);
      var islandMain = 1 - smooth(0.1, 0.42, cam.e);
      var detailMain = 1 - smooth(0.05, 0.3, cam.e);
      var streetA = smooth(0.3, 0.8, cam.e);
      var coastA = (0.6 + 0.4 * islandMain) * (1 - smooth(0.62, 0.9, cam.e));
      var insetA = reduceMotion ? 1 : smooth(TZ1 - 0.5, TZ1 + 0.7, t);
      var townA = smooth(T_TOWNS, T_TOWNS + 0.6, t);
      var arcCam = insetA > 0.01 ? geo.icam : cam;
      var arcA = insetA > 0.01 ? insetA : islandMain;
      var marks = [], insetMarks = [];
      /* venue: a gold dot on the island that grows into the hall */
      var vs = toScreen(cam, geo.V[0], geo.V[1]);
      var vr = 3.5 + 3.5 * smooth(0.3, 1, cam.e);
      if (t > 1.6) square(marks, vs[0], vs[1], vr, GOLD, smooth(1.6, 2.1, t));
      /* towns on the main view while the island is in frame */
      TOWNS.forEach(function (tw, i) {
        var a = townA * islandMain * smooth(T_TOWNS + i * 0.12, T_TOWNS + i * 0.12 + 0.3, t);
        if (a <= 0.01) return;
        var p = toScreen(cam, tw.x, tw.y);
        square(marks, p[0], p[1], 2.5, LIME, a);
        var ph = ((now / 1000 + i * 0.37) % 1.8) / 1.8;
        if (!reduceMotion) outline(marks, p[0], p[1], 3 + ph * 9, LIME, a * 0.5 * (1 - ph));
        if (hoverTown === tw) outline(marks, p[0], p[1], 6, GOLD, a);
      });
      /* inset */
      if (insetA > 0.01) {
        var I = geo.inset;
        insetMarks.push({ ax: I.l, ay: I.t + I.h / 2, bx: I.r, by: I.t + I.h / 2, w: I.h, c: BG, a: insetA });
        outline(insetMarks, I.l + I.w / 2, I.t + I.h / 2, 0, LIME, 0);
        insetMarks.push({ ax: I.l, ay: I.t, bx: I.r, by: I.t, w: 1, c: LIME, a: 0.28 * insetA });
        insetMarks.push({ ax: I.r, ay: I.t, bx: I.r, by: I.b, w: 1, c: LIME, a: 0.28 * insetA });
        insetMarks.push({ ax: I.r, ay: I.b, bx: I.l, by: I.b, w: 1, c: LIME, a: 0.28 * insetA });
        insetMarks.push({ ax: I.l, ay: I.b, bx: I.l, by: I.t, w: 1, c: LIME, a: 0.28 * insetA });
      }
      var insetDots = [];
      if (insetA > 0.01) {
        TOWNS.forEach(function (tw, i) {
          var p = toScreen(geo.icam, tw.x, tw.y);
          square(insetDots, p[0], p[1], 2, LIME, insetA * 0.9);
          var ph = ((now / 1000 + i * 0.37) % 2.2) / 2.2;
          if (!reduceMotion) outline(insetDots, p[0], p[1], 2.5 + ph * 7, LIME, insetA * 0.45 * (1 - ph));
          if (hoverTown === tw) outline(insetDots, p[0], p[1], 5, GOLD, insetA);
        });
        var kp = toScreen(geo.icam, geo.V[0], geo.V[1]);
        square(insetDots, kp[0], kp[1], 3, GOLD, insetA);
      }
      /* trail heads and origins */
      routes.forEach(function (rt) {
        var o = toScreen(cam, rt.ox, rt.oy);
        square(marks, o[0], o[1], 2.5, LIME, 0.9 * rt.life * streetA);
        var hp = rt.head < rt.len ? headPoint(rt) : null;
        if (hp) { var s2 = toScreen(cam, hp[0], hp[1]); square(marks, s2[0], s2[1], 3, GOLD, streetA); }
      });
      arcs.forEach(function (ar) {
        var hp = ar.head < ar.len ? headPoint(ar) : null;
        if (hp) { var s3 = toScreen(arcCam, hp[0], hp[1]); square(insetA > 0.01 ? insetDots : marks, s3[0], s3[1], 2.5, GOLD, arcA); }
      });
      return { cam: cam, coastA: coastA, islandMain: islandMain, detailMain: detailMain, streetA: streetA, insetA: insetA, arcCam: arcCam, arcA: arcA, marks: marks, insetMarks: insetMarks, insetDots: insetDots };
    }

    function draw(now) {
      var t = reduceMotion ? 99 : (now - t0) / 1000;
      var F = frameState(t, now);
      if (gl) drawGL(t, F); else if (ctx2d) draw2D(t, F);
      var settled = reduceMotion || t > TZ1 - 0.15;
      pin.classList.toggle("is-placed", settled);
      harbourLabel.classList.toggle("is-placed", settled && !!geo.harbour);
    }

    function setCam(c) { gl.uniform3f(loc.uCam, c.ox, c.oy, c.k); }
    var SCREEN = { ox: 0, oy: 0, k: 1 };
    function drawGL(t, F) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(BG[0], BG[1], BG[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(loc.uRes, W, H);
      gl.uniform1f(loc.uDpr, DPR);
      gl.uniform1f(loc.uMode, 0);
      gl.uniform1f(loc.uTime, t);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      bindAttribs();
      setCam(F.cam);
      function range(g, alpha) { if (alpha > 0.005 && ranges[g][1]) { gl.uniform1f(loc.uAlpha, alpha); gl.drawArrays(gl.TRIANGLES, ranges[g][0], ranges[g][1]); } }
      range("coast", F.coastA);
      range("detail", F.detailMain);
      range("street", F.streetA);

      /* dynamic layers */
      var groups = [];
      groups.push({ cam: F.cam, mode: 1, alpha: F.streetA, tail: 260 / geo.k1, items: routes, width: 2.4 });
      groups.push({ cam: F.arcCam, mode: 1, alpha: F.insetA > 0.01 ? 0 : F.arcA, tail: 0, items: F.insetA > 0.01 ? [] : arcs, width: 1.8 });
      groups.push({ cam: SCREEN, mode: 0, alpha: 1, list: F.marks });
      var g2 = [];
      if (F.insetA > 0.01) {
        g2.push({ cam: SCREEN, mode: 0, alpha: 1, list: F.insetMarks });
        g2.push({ island: true });
        g2.push({ cam: geo.icam, mode: 1, alpha: F.insetA, tail: 0, items: arcs, width: 1.5 });
        g2.push({ cam: SCREEN, mode: 0, alpha: 1, list: F.insetDots });
      }
      drawDynamic(groups);
      if (g2.length) {
        drawDynamic([g2[0]]);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf); bindAttribs();
        gl.uniform1f(loc.uMode, 0); gl.uniform1f(loc.uTime, 99); setCam(geo.icam);
        gl.uniform1f(loc.uAlpha, 0.8 * F.insetA); gl.drawArrays(gl.TRIANGLES, ranges.coast[0], ranges.coast[1]);
        gl.uniform1f(loc.uAlpha, 0.75 * F.insetA); gl.drawArrays(gl.TRIANGLES, ranges.detail[0], ranges.detail[1]);
        drawDynamic([g2[2], g2[3]]);
      }
    }
    function drawDynamic(groups) {
      var lists = [], total = 0;
      groups.forEach(function (g) {
        if (g.items) {
          g.packs = g.items.map(function (tr) { return tr.segs.map(function (sg) { return { ax: sg.ax, ay: sg.ay, bx: sg.bx, by: sg.by, w: g.width, c: GOLD, a: 1, da: sg.da, db: sg.db }; }); });
          g.packs.forEach(function (l) { total += l.length; });
        } else total += g.list.length;
      });
      if (!total) return;
      var arr = new Float32Array(total * 6 * STRIDE), o = 0;
      groups.forEach(function (g) {
        if (g.items) g.packs.forEach(function (l) { o = pack(l, arr, o, true); });
        else o = pack(g.list.map(function (L) { L.delay = 0; L.dur = 1; return L; }), arr, o, false);
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
      bindAttribs();
      var first = 0;
      groups.forEach(function (g) {
        setCam(g.cam);
        gl.uniform1f(loc.uAlpha, g.alpha);
        if (g.items) {
          gl.uniform1f(loc.uMode, 1);
          g.items.forEach(function (tr, i) {
            var n = g.packs[i].length * 6;
            gl.uniform1f(loc.uHead, tr.head);
            gl.uniform1f(loc.uTail, g.tail || tr.len * 0.55);
            gl.uniform1f(loc.uLife, tr.life);
            if (g.alpha > 0.005) gl.drawArrays(gl.TRIANGLES, first, n);
            first += n;
          });
        } else {
          gl.uniform1f(loc.uMode, 0); gl.uniform1f(loc.uTime, 99);
          var n2 = g.list.length * 6;
          if (n2) gl.drawArrays(gl.TRIANGLES, first, n2);
          first += n2;
        }
      });
    }

    function rgba(c, a) { return "rgba(" + Math.round(c[0] * 255) + "," + Math.round(c[1] * 255) + "," + Math.round(c[2] * 255) + "," + a + ")"; }
    function draw2D(t, F) {
      var c = ctx2d;
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      c.fillStyle = "#0F3B57"; c.fillRect(0, 0, W, H);
      function lines(list, cam, alpha, timed) {
        if (alpha <= 0.005) return;
        list.forEach(function (L) {
          if (timed && t < L.delay) return;
          var a = toScreen(cam, L.ax, L.ay), b = toScreen(cam, L.bx, L.by);
          c.strokeStyle = rgba(L.c, L.a * alpha); c.lineWidth = L.w;
          c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
        });
      }
      function trails(items, cam, alpha, w) {
        items.forEach(function (tr) {
          c.strokeStyle = rgba(GOLD, 0.85 * tr.life * alpha); c.lineWidth = w; c.beginPath();
          tr.segs.forEach(function (sg) { if (sg.da > tr.head) return; var a = toScreen(cam, sg.ax, sg.ay), b = toScreen(cam, sg.bx, sg.by); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
          c.stroke();
        });
      }
      lines(geo.lines.coast, F.cam, F.coastA, true);
      lines(geo.lines.detail, F.cam, F.detailMain, true);
      lines(geo.lines.street, F.cam, F.streetA, true);
      trails(routes, F.cam, F.streetA, 2.4);
      if (F.insetA <= 0.01) trails(arcs, F.cam, F.arcA, 1.8);
      lines(F.marks, SCREEN, 1, false);
      if (F.insetA > 0.01) {
        lines(F.insetMarks, SCREEN, 1, false);
        lines(geo.lines.coast, geo.icam, 0.8 * F.insetA, false);
        lines(geo.lines.detail, geo.icam, 0.75 * F.insetA, false);
        trails(arcs, geo.icam, F.insetA, 1.5);
        lines(F.insetDots, SCREEN, 1, false);
      }
    }

    function step(now) {
      raf = 0;
      if (!running) return;
      var dt = Math.min(0.05, (now - (step.prev || now)) / 1000);
      step.prev = now;
      var t = (now - t0) / 1000;
      /* first wave: everyone heads for Kingston, then a steady trickle */
      TOWNS.forEach(function (tw, i) { if (!tw.sent && t > T_TOWNS + 0.25 + i * 0.16) { tw.sent = true; launch(tw, now); } });
      if (t > TZ1 + 0.4 && now - lastArc > 1300) { lastArc = now; launch(TOWNS[Math.floor(Math.random() * TOWNS.length)], now); }
      if (t > TZ1 + 0.6 && now - lastPointer > 2600 && now - lastAuto > 1500 && geo.origins.length) {
        lastAuto = now;
        spawn(geo.origins[Math.floor(Math.random() * geo.origins.length)], now);
      }
      var rs = 760 / geo.k1, rt = 260 / geo.k1;
      routes.forEach(function (tr) {
        if (tr.head < tr.len + rt) tr.head += rs * dt;
        else { if (!tr.arrived) tr.arrived = now; tr.life = Math.max(0, 1 - (now - tr.arrived) / 1800); }
      });
      routes = routes.filter(function (tr) { return tr.life > 0; });
      arcs.forEach(function (ar) {
        if (ar.head < ar.len * 1.6) ar.head += ar.len / 1.15 * dt;
        else { if (!ar.arrived) ar.arrived = now; ar.life = Math.max(0, 1 - (now - ar.arrived) / 900); }
      });
      arcs = arcs.filter(function (ar) { return ar.life > 0; });
      draw(now);
      raf = requestAnimationFrame(step);
    }
    function start() {
      if (running || reduceMotion) return;
      running = true; step.prev = 0; raf = requestAnimationFrame(step);
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    /* Pointer: towns tell you how far they are, streets light routes to the hall */
    function hideTip() { hoverTown = null; townTip.classList.remove("is-on"); }
    function townAt(x, y, t) {
      var F = camAt(t), insetOn = reduceMotion || t > TZ1 - 0.2, best = null, bd = 18 * 18, cam = null;
      if (insetOn) cam = geo.icam; else if (F.e < 0.25 && t > T_TOWNS) cam = F;
      if (!cam) return null;
      TOWNS.forEach(function (tw) {
        var p = toScreen(cam, tw.x, tw.y), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y);
        if (d < bd) { bd = d; best = { tw: tw, p: p }; }
      });
      return best;
    }
    function nearestNode(x, y) {
      var cam = camAt(99), best = -1, bd = 70 * 70;
      geo.nodes.forEach(function (n, i) {
        var p = toScreen(cam, n.wx, n.wy), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y);
        if (d < bd && geo.dist[i] < Infinity) { bd = d; best = i; }
      });
      return best;
    }
    function onPointer(e) {
      if (!geo) return;
      var rect = hero.getBoundingClientRect();
      var now = performance.now(), t = reduceMotion ? 99 : (now - t0) / 1000;
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      var hit = townAt(x, y, t);
      if (hit) {
        if (hoverTown !== hit.tw) {
          hoverTown = hit.tw;
          townTip.innerHTML = "<strong>" + hit.tw.name + "</strong>" + hit.tw.time + " to the hall";
          var tw = townTip.offsetWidth || 180;
          var I = geo.inset, inInset = hit.p[0] >= I.l && hit.p[0] <= I.r && hit.p[1] >= I.t && hit.p[1] <= I.b;
          var tx = inInset ? clamp(hit.p[0] - tw / 2, I.l, I.r - tw) : clamp(hit.p[0] - tw / 2, 12, W - 12 - tw);
          var ty = inInset ? I.b + 12 : hit.p[1] + 14;
          townTip.style.transform = "translate(" + Math.round(tx) + "px," + Math.round(ty) + "px)";
          townTip.classList.add("is-on");
          if (!reduceMotion && now - hit.tw.last > 700) launch(hit.tw, now);
          if (reduceMotion) draw(now);
        }
        return;
      }
      if (hoverTown) { hideTip(); if (reduceMotion) draw(now); }
      if (reduceMotion || t < TZ1) return;
      var I = geo.inset;
      if (x > I.l - 8 && x < I.r + 8 && y > I.t - 8 && y < I.b + 8) return;
      lastPointer = now;
      var n = nearestNode(x, y);
      if (n >= 0 && n !== lastNode && now - lastSpawn > 110) { lastNode = n; lastSpawn = now; spawn(n, now); }
    }
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerdown", onPointer, { passive: true });
    hero.addEventListener("pointerleave", function () { if (hoverTown) { hideTip(); if (reduceMotion) draw(performance.now()); } });

    resize();
    draw(performance.now());
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }).observe(hero);
    } else start();
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else if (visible) start(); });
    var rz;
    window.addEventListener("resize", function () {
      clearTimeout(rz);
      rz = setTimeout(function () {
        var rect = hero.getBoundingClientRect();
        if (Math.round(rect.width) === W && Math.abs(Math.round(rect.height) - H) < 120) return;
        t0 = Math.min(t0, performance.now() - (TZ1 + 2) * 1000);
        TOWNS.forEach(function (tw) { tw.sent = true; });
        resize(); draw(performance.now());
      }, 150);
    });
    window.kbwSpawnRoute = function () { if (geo && geo.origins.length) spawn(geo.origins[Math.floor(Math.random() * geo.origins.length)], performance.now()); };
  })();

  /* Prose that reads itself: words light up as they scroll past, key phrases get highlighted like code */
  (function () {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!blocks.length) return;
    function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { var sp = document.createElement("span"); sp.className = "w"; sp.textContent = part; frag.appendChild(sp); }
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) split(c);
      });
    }
    var items = blocks.map(function (b) {
      split(b);
      b.classList.add("is-split");
      return { el: b, words: Array.prototype.slice.call(b.querySelectorAll(".w")), marks: Array.prototype.slice.call(b.querySelectorAll("mark")), lit: -1 };
    });
    if (reduceMotion) {
      items.forEach(function (it) { it.el.classList.add("is-done"); it.marks.forEach(function (m) { m.classList.add("is-lit"); }); });
      return;
    }
    var pending = false;
    function update() {
      pending = false;
      var vh = window.innerHeight;
      items.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var line = vh * 0.72, n = 0;
        for (var i = 0; i < it.words.length; i++) {
          var wr = it.words[i].getBoundingClientRect();
          if (wr.top + wr.height * 0.5 < line - (wr.left - r.left) / Math.max(r.width, 1) * 60) n = i + 1; else break;
        }
        if (n !== it.lit) {
          it.words.forEach(function (w, k) { w.classList.toggle("on", k < n); });
          it.lit = n;
        }
        it.marks.forEach(function (m) {
          var mr = m.getBoundingClientRect();
          if (mr.top + mr.height / 2 < vh * 0.56) m.classList.add("is-lit");
        });
      });
    }
    function queue() { if (!pending) { pending = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    update();
  })();

  /* A deploy that runs on loop while it is on screen */
  (function () {
    var body = document.getElementById("term-body"), clock = document.getElementById("term-clock");
    if (!body) return;
    var CMD = "git push origin main";
    var OUT = [
      ["remote", "building coralbase at 4f2a9c1", 0.5],
      ["  test", "218 passed", 1.4],
      ["  bundle", "412 kB, down 18 kB", 0.8],
      ["  deploy", "kin1 ok", 1.1],
      ["  deploy", "bgi1 ok", 0.7],
      ["  sync", "offline queue drained, 0 lost", 0.9],
      ["", "live in 41s", 0.6, true]
    ];
    function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function row(o) { return '<span class="term__line' + (o[3] ? ' term__ok' : '') + '"><span class="term__k">' + esc(o[0]) + "</span>" + (o[0] ? "  " : "") + esc(o[1]) + "</span>"; }
    var full = '<span class="term__line"><span class="term__p">$</span> ' + CMD + "</span>" + OUT.map(row).join("");
    if (reduceMotion || !("IntersectionObserver" in window)) { body.innerHTML = full; clock.textContent = "00:41"; return; }
    var on = false, raf = 0, t0 = 0, plan = [], acc = 0.4;
    for (var i = 0; i <= CMD.length; i++) plan.push({ at: acc + i * 0.05, typed: i });
    acc += CMD.length * 0.05 + 0.35;
    OUT.forEach(function (o, k) { acc += o[2] * 0.7; plan.push({ at: acc, lines: k + 1 }); });
    var END = acc + 3.2;
    var lastKey = "";
    function frame(now) {
      raf = 0; if (!on) return;
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      if (t > END) { t0 = now; t = 0; }
      var typed = 0, lines = 0;
      plan.forEach(function (p) { if (t >= p.at) { if (p.typed != null) typed = p.typed; if (p.lines != null) lines = p.lines; } });
      var key = typed + "/" + lines;
      if (key !== lastKey) {
        lastKey = key;
        var html = '<span class="term__line"><span class="term__p">$</span> ' + CMD.slice(0, typed) + (lines === 0 ? '<span class="term__cur"></span>' : "") + "</span>";
        html += OUT.slice(0, lines).map(row).join("");
        if (lines === OUT.length) html += '<span class="term__line"><span class="term__p">$</span> <span class="term__cur"></span></span>';
        body.innerHTML = html;
      }
      var secs = lines === 0 ? 0 : Math.min(41, Math.round((t - plan[CMD.length].at) / (END - 3.2 - plan[CMD.length].at) * 41));
      clock.textContent = "00:" + (secs < 10 ? "0" : "") + secs;
      raf = requestAnimationFrame(frame);
    }
    body.innerHTML = full;
    new IntersectionObserver(function (en) {
      on = en[0].isIntersecting;
      if (on && !raf) { t0 = 0; lastKey = ""; raf = requestAnimationFrame(frame); }
    }, { threshold: 0.3 }).observe(body);
  })();

  /* A commit graph that draws itself once */
  (function () {
    var svg = document.getElementById("graph"), count = document.getElementById("graph-count");
    if (!svg) return;
    var r = rng("pier studio"), lanes = [24, 64, 104, 144], x0 = 8, x1 = 312;
    var paths = [], dots = [];
    function p(d, cls, delay) { paths.push({ d: d, cls: cls, delay: delay }); }
    p("M" + x0 + " " + lanes[0] + "H" + x1, "g--main", 0);
    for (var i = 0; i < 9; i++) dots.push([x0 + 12 + i * 36, lanes[0], "g--main", i * 0.12]);
    var branches = [[22, 118, 1, "g--a"], [70, 196, 2, "g--b"], [130, 250, 1, "g--a"], [162, 290, 3, "g--c"], [214, 300, 2, "g--b"]];
    branches.forEach(function (b, k) {
      var a = b[0], z = b[1], y = lanes[b[2]], d = 0.25 + k * 0.28;
      p("M" + a + " " + lanes[0] + "C" + (a + 14) + " " + lanes[0] + " " + (a + 6) + " " + y + " " + (a + 20) + " " + y + "H" + (z - 20) + "C" + (z - 6) + " " + y + " " + (z - 14) + " " + lanes[0] + " " + z + " " + lanes[0], b[3], d);
      for (var x = a + 30; x < z - 22; x += 20 + Math.floor(r() * 14)) dots.push([x, y, b[3], d + (x - a) / 300]);
    });
    var NS2 = "http://www.w3.org/2000/svg";
    paths.forEach(function (q) {
      var e = document.createElementNS(NS2, "path");
      e.setAttribute("d", q.d); e.setAttribute("class", "g__line " + q.cls); e.setAttribute("pathLength", "1");
      e.style.transitionDelay = q.delay + "s";
      svg.appendChild(e);
    });
    dots.forEach(function (q) {
      var c = document.createElementNS(NS2, "rect");
      c.setAttribute("x", q[0] - 3); c.setAttribute("y", q[1] - 3); c.setAttribute("width", 6); c.setAttribute("height", 6);
      c.setAttribute("class", "g__dot " + q[2]);
      c.style.transitionDelay = (q[3] + 0.3) + "s";
      svg.appendChild(c);
    });
    var END = 1486;
    function done() { svg.classList.add("is-drawn"); }
    if (reduceMotion || !("IntersectionObserver" in window)) { done(); count.textContent = END.toLocaleString("en-US"); return; }
    var io2 = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io2.disconnect();
      requestAnimationFrame(done);
      var t0 = 0;
      requestAnimationFrame(function tick(now) {
        if (!t0) t0 = now;
        var k = Math.min(1, (now - t0) / 2200);
        count.textContent = Math.round(END * (1 - Math.pow(1 - k, 3))).toLocaleString("en-US");
        if (k < 1) requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    io2.observe(svg);
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
