(function () {
  var root = document.querySelector("[data-ig]");
  if (!root) return;

  var igUser = root.getAttribute("data-ig");
  var fbSlug = root.getAttribute("data-fb");
  var igWeb = "https://www.instagram.com/" + igUser + "/";
  var fbWeb = "https://www.facebook.com/" + fbSlug;
  var ua = navigator.userAgent || "";
  var android = /Android/i.test(ua);
  var ios = /iPhone|iPad|iPod/i.test(ua);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var busy = false;
  var launch = document.querySelector(".launch");
  var launchLabel = launch.querySelector("strong");

  function openWithFallback(appUrl, webUrl) {
    var left = false;
    function markLeft() {
      left = true;
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) markLeft();
    });
    window.addEventListener("pagehide", markLeft);
    window.location.href = appUrl;
    window.setTimeout(function () {
      if (!left) window.location.href = webUrl;
    }, 1200);
  }

  function goInstagram() {
    if (android) {
      window.location.href =
        "intent://instagram.com/_u/" +
        igUser +
        "/#Intent;package=com.instagram.android;scheme=https;S.browser_fallback_url=" +
        encodeURIComponent(igWeb) +
        ";end";
      return;
    }
    if (ios) {
      openWithFallback("instagram://user?username=" + igUser, igWeb);
      return;
    }
    window.location.href = igWeb;
  }

  function goFacebook() {
    if (android) {
      window.location.href =
        "intent://www.facebook.com/" +
        fbSlug +
        "#Intent;package=com.facebook.katana;scheme=https;S.browser_fallback_url=" +
        encodeURIComponent(fbWeb) +
        ";end";
      return;
    }
    if (ios) {
      openWithFallback(
        "fb://facewebmodal/f?href=" + encodeURIComponent(fbWeb),
        fbWeb
      );
      return;
    }
    window.location.href = fbWeb;
  }

  function play(button, kind, label, go) {
    if (busy) return;
    busy = true;
    button.classList.add("is-chosen");
    document.body.classList.add("is-leaving", kind === "ig" ? "is-ig" : "is-fb");
    launchLabel.textContent = "Abriendo " + label;
    launch.hidden = false;
    window.requestAnimationFrame(function () {
      launch.classList.add("is-on");
    });
    window.setTimeout(go, reduce ? 0 : 520);
  }

  document.getElementById("open-ig").addEventListener("click", function (event) {
    play(event.currentTarget, "ig", "Instagram", goInstagram);
  });
  document.getElementById("open-fb").addEventListener("click", function (event) {
    play(event.currentTarget, "fb", "Facebook", goFacebook);
  });
})();
