(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("#nav-menu");

  if (nav && toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const tabs = document.querySelectorAll("[data-plan-tab]");
  const panels = document.querySelectorAll("[data-plan-panel]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-plan-tab");
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      panels.forEach((panel) => {
        const match = panel.getAttribute("data-plan-panel") === id;
        panel.hidden = !match;
      });
    });
  });

  const cookies = document.querySelector("[data-cookies]");
  const accept = document.querySelector("[data-cookies-accept]");
  const key = "bait-yaavs-cookies";
  if (cookies && accept) {
    if (!localStorage.getItem(key)) cookies.classList.add("is-visible");
    accept.addEventListener("click", () => {
      localStorage.setItem(key, "1");
      cookies.classList.remove("is-visible");
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = [...carousel.querySelectorAll("[data-hero-slide]")];
    const dotsWrap = carousel.querySelector("[data-hero-dots]");
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = 0;
    let timer;

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `hero__dot${i === index ? " is-active" : ""}`;
        btn.setAttribute("aria-label", `Banner ${i + 1}`);
        btn.addEventListener("click", () => go(i));
        dotsWrap.appendChild(btn);
      });
    };

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, n) => slide.classList.toggle("is-active", n === index));
      renderDots();
      restart();
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 5500);
    };

    prev?.addEventListener("click", () => go(index - 1));
    next?.addEventListener("click", () => go(index + 1));
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", restart);
    renderDots();
    restart();
  }

  const splash = document.querySelector("#entry-splash");
  if (splash) {
    window.setTimeout(() => {
      splash.classList.add("is-done");
      document.body.classList.remove("is-entry-active");
    }, 1800);
  }

  const header = document.querySelector("#site-header");
  if (header) {
    const syncHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
