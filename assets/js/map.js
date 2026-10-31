/* Kingston Build Week. Interactive venue map of the Downtown Kingston waterfront. */
(function () {
  "use strict";

  var el = document.getElementById("venue-map");
  if (!el) return;
  var fig = el.closest(".map");
  var status = document.getElementById("map-status");
  function say(t) { if (status) status.textContent = t; }

  function start() {
    if (!window.L) { fig.classList.add("no-map"); return; }
    try { build(); } catch (err) {
      fig.classList.remove("has-map");
      fig.classList.add("no-map");
    }
  }

  function build() {
    fig.classList.add("has-map");

    var VENUE = [17.9650, -76.7928];
    var AIRPORT = [17.9357, -76.7875];
    var POINTS = [
      { k: "venue", n: "1", name: "The Waterfront Hall", note: "14 Ocean Boulevard. Doors open at 08:00 both days. Registration is in the lobby facing the harbour.", at: VENUE },
      { k: "parade", n: "2", name: "The Parade", note: "St William Grant Park, the heart of downtown. Route taxis and JUTC buses stop all around it.", at: [17.9706, -76.7930] },
      { k: "ferry", n: "3", name: "Ferry pier", note: "Water taxis across the harbour to Port Royal and Portmore.", at: [17.9654, -76.7898] },
      { k: "parking", n: "4", name: "Guest parking", note: "Secure lot on Harbour Street for registered guests. Show your ticket at the gate.", at: [17.9677, -76.7948] },
      { k: "coffee", n: "5", name: "Coffee on King Street", note: "A few cafes a short walk up King Street, open from seven.", at: [17.9688, -76.7922] },
      { k: "lunch", n: "6", name: "Lunch by the waterfront", note: "Cookshops and a food court along Ocean Boulevard, busy from noon.", at: [17.9659, -76.7960] }
    ];
    /* rough line of the Palisadoes and Windward Road from the airport into downtown */
    var AIRPORT_ROUTE = [AIRPORT, [17.9395, -76.7750], [17.9440, -76.7550], [17.9480, -76.7350], [17.9560, -76.7220], [17.9660, -76.7300], [17.9730, -76.7500], [17.9730, -76.7750], [17.9690, -76.7880], VENUE];

    var map = L.map(el, {
      center: VENUE, zoom: 16, minZoom: 12, maxZoom: 19,
      scrollWheelZoom: false, zoomControl: false, attributionControl: true
    });
    map.attributionControl.setPrefix(false);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    var street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, className: "kbw-tiles",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    var sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19, className: "kbw-sat", attribution: "Imagery &copy; Esri"
    });

    function icon(p) {
      var cls = "kbw-pin" + (p.k === "venue" ? " kbw-pin--venue" : "");
      return L.divIcon({ className: cls, html: "<span>" + p.n + "</span>", iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18] });
    }
    function walk(a, b) { return Math.max(1, Math.round(map.distance(a, b) / 75)); }
    function popup(p) {
      var html = '<div class="kbw-pop"><h3>' + p.name + "</h3><p>" + p.note + "</p>";
      if (p.k !== "venue") html += '<p class="kbw-pop__walk">About ' + walk(VENUE, p.at) + " min walk from the hall</p>";
      else html += '<p class="kbw-pop__walk"><a href="https://www.google.com/maps/dir/?api=1&amp;destination=17.9650,-76.7928&amp;travelmode=driving" target="_blank" rel="noopener">Directions in Google Maps</a></p>';
      return html + "</div>";
    }

    var markers = {};
    var rows = Array.prototype.slice.call(document.querySelectorAll(".legend .pt"));
    function setActive(k) {
      rows.forEach(function (r) { var on = r.dataset.pt === k; r.classList.toggle("on", on); r.setAttribute("aria-pressed", on); });
      Object.keys(markers).forEach(function (key) {
        var n = markers[key].getElement(); if (n) n.classList.toggle("on", key === k);
      });
    }
    POINTS.forEach(function (p) {
      var m = L.marker(p.at, { icon: icon(p), title: p.name, alt: p.name, keyboard: true, riseOnHover: true, zIndexOffset: p.k === "venue" ? 1000 : 0 })
        .bindPopup(popup(p), { className: "kbw-popup", maxWidth: 260 })
        .addTo(map);
      m.on("click", function () { setActive(p.k); });
      m.on("popupclose", function () { setActive(null); });
      markers[p.k] = m;
    });

    rows.forEach(function (r) {
      r.addEventListener("click", function () {
        var m = markers[r.dataset.pt]; if (!m) return;
        setActive(r.dataset.pt);
        map.flyTo(m.getLatLng(), 17, { duration: 0.6 });
        setTimeout(function () { m.openPopup(); }, 650);
        if (window.innerWidth < 1100) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    var area = L.latLngBounds(POINTS.map(function (p) { return p.at; })).pad(0.2);
    map.fitBounds(area);

    var airportLayer = L.layerGroup([
      L.polyline(AIRPORT_ROUTE, { color: "#0F3B57", weight: 3, dashArray: "6 8", lineCap: "round", interactive: false }),
      L.marker(AIRPORT, { icon: L.divIcon({ className: "kbw-pin kbw-pin--air", html: "<span></span>", iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10] }), title: "Norman Manley International Airport" })
        .bindPopup('<div class="kbw-pop"><h3>Norman Manley International</h3><p>About twenty five minutes to the hall by taxi along the Palisadoes. Taxis wait outside arrivals.</p></div>', { className: "kbw-popup", maxWidth: 240 })
    ]);

    var tools = fig.querySelectorAll("button[data-map]");
    var airBtn = fig.querySelector('[data-map="airport"]');
    var viewBtn = fig.querySelector('[data-map="view"]');
    function airportOff() {
      if (map.hasLayer(airportLayer)) map.removeLayer(airportLayer);
      if (airBtn) airBtn.setAttribute("aria-pressed", "false");
    }
    Array.prototype.forEach.call(tools, function (b) {
      b.addEventListener("click", function () {
        var mode = b.dataset.map;
        if (mode === "all") { airportOff(); map.closePopup(); map.flyToBounds(area, { duration: 0.6 }); say(""); }
        if (mode === "view") {
          var toSat = map.hasLayer(street);
          if (toSat) { map.removeLayer(street); sat.addTo(map); } else { map.removeLayer(sat); street.addTo(map); }
          b.textContent = toSat ? "Street view" : "Satellite view";
          fig.classList.toggle("is-sat", toSat);
        }
        if (mode === "airport") {
          if (map.hasLayer(airportLayer)) { airportOff(); map.flyToBounds(area, { duration: 0.6 }); say(""); return; }
          airportLayer.addTo(map);
          b.setAttribute("aria-pressed", "true");
          map.closePopup();
          map.flyToBounds(L.latLngBounds(AIRPORT_ROUTE).pad(0.15), { duration: 0.8 });
          say("From Norman Manley International, follow the Palisadoes into town. About twenty five minutes by taxi.");
        }
      });
    });
    if (viewBtn) viewBtn.setAttribute("aria-label", "Switch between street and satellite view");

    /* zoom with the wheel only after the map is clicked, so the page still scrolls */
    map.on("click focus", function () { map.scrollWheelZoom.enable(); });
    el.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });
  }

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
