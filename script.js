const initIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const initLoadState = () => {
  requestAnimationFrame(() => {
    document.body.classList.add("is-loaded");
  });
};

const initTheme = () => {
  const root = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  if (!toggle) {
    return;
  }

  const updateToggleState = () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
  };

  toggle.addEventListener("click", () => {
    const nextTheme =
      root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);
    updateToggleState();
  });

  mediaQuery.addEventListener("change", (event) => {
    if (!localStorage.getItem("portfolio-theme")) {
      root.setAttribute("data-theme", event.matches ? "dark" : "light");
      updateToggleState();
    }
  });

  updateToggleState();
};

const initReveal = () => {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealItems.forEach((item) => observer.observe(item));
};

const initTilt = () => {
  const card = document.querySelector("[data-tilt-card]");

  if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const frame = card.querySelector(".hero-frame");
  if (!frame) {
    return;
  }

  const resetTransform = () => {
    frame.style.transform = "";
  };

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 8;
    const rotateX = (0.5 - y) * 7;

    frame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  });

  card.addEventListener("pointerleave", resetTransform);
};

const initCursorGlow = () => {
  const glow = document.querySelector(".cursor-glow");

  if (!glow || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let rafId = null;
  let pointerX = 0;
  let pointerY = 0;

  const render = () => {
    glow.style.transform = `translate3d(${pointerX - glow.offsetWidth / 2}px, ${pointerY - glow.offsetHeight / 2}px, 0)`;
    rafId = null;
  };

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    document.body.classList.add("cursor-active");

    if (rafId === null) {
      rafId = requestAnimationFrame(render);
    }
  });

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-active");
  });
};

initIcons();
initLoadState();
initTheme();
initReveal();
initTilt();
initCursorGlow();
