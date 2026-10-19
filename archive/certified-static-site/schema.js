(function injectServiceSchema() {
  var src = "/schema/services.json";
  fetch(src, { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("schema missing");
      return res.json();
    })
    .then(function (data) {
      var el = document.createElement("script");
      el.type = "application/ld+json";
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
    })
    .catch(function () {
      /* schema is optional for the page to work */
    });
})();
