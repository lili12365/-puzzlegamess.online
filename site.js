(function () {
  var GA_ID = "G-20558D21GJ";
  var ADS_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3376278485410551";
  var GTAG_SRC = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  var thirdPartyLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());

  function appendScript(src, options) {
    var script = document.createElement("script");
    script.src = src;
    script.async = true;

    if (options && options.crossOrigin) {
      script.crossOrigin = options.crossOrigin;
    }
    if (options && options.onload) {
      script.onload = options.onload;
    }

    document.head.appendChild(script);
  }

  function loadThirdParty() {
    if (thirdPartyLoaded) {
      return;
    }

    thirdPartyLoaded = true;

    appendScript(GTAG_SRC, {
      onload: function () {
        window.gtag("config", GA_ID);
      }
    });

    appendScript(ADS_SRC, {
      crossOrigin: "anonymous"
    });
  }

  function scheduleThirdPartyLoad() {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadThirdParty, { timeout: 4000 });
      return;
    }

    window.addEventListener(
      "load",
      function () {
        window.setTimeout(loadThirdParty, 2500);
      },
      { once: true }
    );
  }

  function bindIntentLoad() {
    ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (eventName) {
      window.addEventListener(eventName, loadThirdParty, { once: true, passive: true });
    });
  }

  function loadEmbed(wrapper) {
    if (!wrapper || wrapper.classList.contains("is-loaded")) {
      return;
    }

    var iframe = wrapper.querySelector("iframe[data-src]");
    if (!iframe) {
      return;
    }

    iframe.src = iframe.dataset.src;
    wrapper.classList.add("is-loaded");
  }

  function initDeferredEmbeds() {
    document.querySelectorAll(".iframe-wrap[data-embed-src]").forEach(function (wrapper) {
      var button = wrapper.querySelector(".embed-launch");

      if (button) {
        button.addEventListener("click", function () {
          loadEmbed(wrapper);
        });
      }
    });
  }

  scheduleThirdPartyLoad();
  bindIntentLoad();
  document.addEventListener("DOMContentLoaded", initDeferredEmbeds);
})();
