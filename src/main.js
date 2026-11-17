import "./fonts.css";
import "./style.css";
import "./lab.css";
import "./polish.css";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = reducedMotion.matches;
let scenes;
let exploded = false;
let graphicsUnavailable = false;

function markGraphicsUnavailable() {
  graphicsUnavailable = true;
  $("#reset-scene").disabled = true;
  $("#hero-scene").setAttribute(
    "aria-label",
    "Sculptural orbital artwork. Explore the projects and experience below.",
  );
  $("#hero-scene").removeAttribute("tabindex");
  $("#hero-scene").style.cursor = "default";
}

const projects = {
  health: {
    eyebrow: "PERSONAL PROJECT / ANGULAR",
    name: "Health Planner",
    subtitle: "A little more clarity. A little more progress. Every day.",
    intro:
      "A diet and fitness planner that brings dashboards, personal goals, and progress tracking into one Angular application. The focus: making a daily routine easier to understand and follow.",
    decisions: [
      "Organized health information into dashboards so the next step is easier to find.",
      "Connected goal setting and tracking in a single planning experience.",
      "Used Angular to structure the application around reusable interface components.",
    ],
    stack: ["Angular", "TypeScript", "Dashboards", "Goal setting"],
    url: "https://deba-maity.github.io/healthplanner/",
    source: "https://github.com/deba-maity/healthplanner",
    note: "The dimensional preview is a visual concept created for this portfolio. Open the live project to explore the original application.",
  },
  angular: {
    eyebrow: "PERSONAL PROJECT / ANGULAR 17",
    name: "Angular Features Showcase",
    subtitle: "A working playground for the building blocks of modern Angular.",
    intro:
      "A practical collection of Angular 17 features, bringing routing, reactive forms, services, and dynamic component rendering into one explorable application.",
    decisions: [
      "Demonstrated routing and services as the connective tissue of an Angular application.",
      "Explored reactive forms for structured, maintainable user input.",
      "Showcased dynamic component rendering for flexible interface composition.",
    ],
    stack: ["Angular 17", "TypeScript", "Reactive forms", "Routing"],
    url: "https://deba-maity.github.io/Angular-features/",
    source: "https://github.com/deba-maity/Angular-features",
    note: "The dimensional preview is a visual concept created for this portfolio. Open the live project to explore the original application.",
  },
  healthcare: {
    eyebrow: "PROFESSIONAL WORK / VJL IT AUGMENTS",
    name: "Healthcare Test Data Platform",
    subtitle: "Complex diagnostic datasets. A clearer way to work.",
    intro:
      "Architected and developed a government healthcare test data platform for UK public health. The platform supports structured management of multi-disease diagnostic datasets, translating complex public-sector workflows into production-ready features.",
    decisions: [
      "Led Angular 18 frontend development and mentored a team of four developers.",
      "Designed modular frontend architecture with cross-functional stakeholders.",
      "Implemented lazy loading and efficient component rendering to support frontend performance.",
      "Delivered core platform features within two weeks using AI-assisted development workflows.",
    ],
    stack: [
      "Angular 18",
      "Modular architecture",
      "Performance",
      "Team leadership",
    ],
    note: "Professional project overview based on my role at VJL IT AUGMENTS. No internal screens, datasets, or proprietary source code are displayed.",
  },
};

const skillContent = {
  frontend: {
    title: "Interfaces are my home ground.",
    body: "Angular v4–v19 · React · Ionic · TypeScript · JavaScript · HTML5 · CSS3 · Tailwind · Bootstrap",
  },
  backend: {
    title: "The thinking goes beyond the screen.",
    body: "Java · Python · Node.js · Spring Boot · Django ORM · REST APIs · GraphQL · JWT · SQL · Redis · WebSockets",
  },
  toolkit: {
    title: "Better systems. Better ways of building.",
    body: "Git · Postman · Jest · Unit testing · Responsive design · Performance optimization · System design · Team leadership",
  },
};

$("#year").textContent = new Date().getFullYear();

const menuButton = $(".menu-toggle");
const mobileNav = $("#mobile-nav");
function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
  mobileNav.hidden = true;
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileNav.hidden = !open;
});
$$("#mobile-nav a").forEach((link) =>
  link.addEventListener("click", closeMenu),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!mobileNav.hidden && !event.target.closest(".site-header")) closeMenu();
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  document.documentElement.classList.add("js-reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px 30px 0px" },
  );
  $$(".reveal").forEach((element) => revealObserver.observe(element));
}

const sections = $$("main>section[id]");
if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$(".desktop-nav a").forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    },
    { rootMargin: "-20% 0px -50% 0px" },
  );
  sections.forEach((section) => navObserver.observe(section));
}

$$(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (motionPaused || event.pointerType === "touch") return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--tilt-x", `${x * 22}px`);
    card.style.setProperty("--tilt-y", `${y * 14}px`);
    card.style.setProperty("--rotate-x", `${-y * 13}deg`);
    card.style.setProperty("--rotate-y", `${x * 18}deg`);
    card.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--tilt-x", "0px");
    card.style.setProperty("--tilt-y", "0px");
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  });
});

const dialog = $("#project-dialog");
let dialogOpener = null;
$$("[data-open-project]").forEach((button) =>
  button.addEventListener("click", () => {
    const project = projects[button.dataset.openProject];
    dialogOpener = button;
    $("#dialog-content").innerHTML = `
    <p class="eyebrow dialog-eyebrow">${project.eyebrow}</p>
    <h2 id="dialog-title">${project.name}</h2>
    <p class="dialog-subtitle">${project.subtitle}</p>
    <div class="tags">${project.stack.map((tag) => `<span>${tag}</span>`).join("")}</div>
    <div class="dialog-section"><h3>The idea</h3><p>${project.intro}</p></div>
    <div class="dialog-section"><h3>${button.dataset.openProject === "healthcare" ? "My contribution" : "Inside the build"}</h3><ul>${project.decisions.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    ${project.url ? `<div class="dialog-actions"><a class="button button-primary" href="${project.url}" target="_blank" rel="noopener noreferrer">Explore live project <span aria-hidden="true">↗</span></a><a class="text-link" href="${project.source}" target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a></div>` : '<div class="dialog-actions"><a class="button button-primary" href="mailto:debajyoti.maity29@gmail.com?subject=Let%E2%80%99s%20talk%20about%20your%20work">Talk about the work <span aria-hidden="true">↗</span></a></div>'}
    <p class="dialog-footnote">${project.note}</p>`;
    dialog.showModal();
    dialog.scrollTop = 0;
    $("#close-dialog").focus();
  }),
);
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () =>
  dialogOpener?.focus({ preventScroll: true }),
);

$$("[data-skill]").forEach((button) =>
  button.addEventListener("click", () => {
    const category = button.dataset.skill;
    $$("[data-skill]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    $("#skill-detail").innerHTML =
      `<h3>${skillContent[category].title}</h3><p>${skillContent[category].body}</p>`;
    scenes?.setCategory(category);
  }),
);

let toastTimeout;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3200);
}
$("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("debajyoti.maity29@gmail.com");
    showToast("Email copied. Let’s make something great.");
  } catch {
    showToast("Email: debajyoti.maity29@gmail.com");
  }
});

function updateMotion() {
  document.documentElement.classList.toggle("motion-paused", motionPaused);
  const button = $("#motion-toggle");
  button.setAttribute("aria-pressed", String(motionPaused));
  button.setAttribute(
    "aria-label",
    motionPaused ? "Resume animation" : "Pause animation",
  );
  button.title = motionPaused ? "Resume animation" : "Pause animation";
  button.innerHTML = `<span class="pause-icon" aria-hidden="true">${motionPaused ? "▶" : "Ⅱ"}</span>`;
  const labMotion = $("#lab-motion");
  labMotion.textContent = motionPaused ? "RESUME MOTION ▷" : "PAUSE MOTION Ⅱ";
  labMotion.setAttribute("aria-pressed", String(motionPaused));
  scenes?.setPaused(motionPaused);
}
$("#motion-toggle").addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotion();
});
$("#lab-motion").addEventListener("click", () => {
  motionPaused = !motionPaused;
  updateMotion();
});
reducedMotion.addEventListener("change", (event) => {
  motionPaused = event.matches;
  updateMotion();
});
updateMotion();

const lab = $("#lab-dialog");
const heroScene = $("#hero-scene");
const heroSceneParent = heroScene.parentElement;
const heroSceneNext = heroScene.nextElementSibling;
const layerStories = [
  {
    title: "Make the complex feel simple.",
    body: "Responsive interfaces, purposeful components, and the small interactions that make a product feel right.",
    stack: "ANGULAR · REACT · IONIC",
  },
  {
    title: "Keep the conversation flowing.",
    body: "Thoughtful APIs and real-time communication connect the interface to the information people need.",
    stack: "REST · GRAPHQL · WEBSOCKETS · REDIS",
  },
  {
    title: "Build for what comes next.",
    body: "Modular architecture, reliable testing, and teams that share knowledge. The work behind the work.",
    stack: "SYSTEM DESIGN · PERFORMANCE · LEADERSHIP",
  },
];
function selectLayer(index) {
  $$("[data-layer]").forEach((button) => {
    const active = Number(button.dataset.layer) === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $$("[data-layer-label]").forEach((label) =>
    label.classList.toggle(
      "active",
      Number(label.dataset.layerLabel) === index,
    ),
  );
  const story = layerStories[index];
  $("#layer-story").innerHTML =
    `<p class="layer-story-title">${story.title}</p><p>${story.body}</p><span>${story.stack}</span>`;
  scenes?.selectLayer(index);
}
function setExploded(value) {
  exploded = value;
  lab.classList.toggle("exploded", value);
  const button = $("#assembly-toggle");
  button.setAttribute("aria-pressed", String(value));
  button.children[1].textContent = value
    ? "Reassemble the stack"
    : "Explode the stack";
  scenes?.setExploded(value);
}
function setBlueprint(value) {
  lab.classList.toggle("blueprint-mode", value);
  $$("[data-render]").forEach((button) => {
    const active = (button.dataset.render === "blueprint") === value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  scenes?.setBlueprint(value);
}
let labOpener = null;
function openLab(event) {
  if (graphicsUnavailable) {
    showToast(
      "3D exploration is unavailable in this browser. You can still explore all the work below.",
    );
    return;
  }
  if (!scenes) {
    showToast("The engine is warming up. Try again in a moment.");
    return;
  }
  if (!scenes.available) {
    showToast(
      "3D exploration is unavailable in this browser. You can still explore all the work below.",
    );
    return;
  }
  lab.showModal();
  labOpener = event.currentTarget;
  lab.scrollTop = 0;
  $("#lab-stage").appendChild(heroScene);
  scenes.setLab(true);
  setExploded(false);
  setBlueprint(false);
  selectLayer(0);
  $("#close-lab").focus();
}
$("#open-lab").addEventListener("click", openLab);
$("#hero-lab-button").addEventListener("click", openLab);
$("#close-lab").addEventListener("click", () => lab.close());
lab.addEventListener("close", () => {
  heroSceneParent.insertBefore(heroScene, heroSceneNext);
  scenes?.setLab(false);
  setExploded(false);
  setBlueprint(false);
  labOpener?.focus({ preventScroll: true });
});
$("#assembly-toggle").addEventListener("click", () => setExploded(!exploded));
$$("[data-layer]").forEach((button) =>
  button.addEventListener("click", () => {
    if (!exploded) setExploded(true);
    selectLayer(Number(button.dataset.layer));
  }),
);
$$("[data-render]").forEach((button) =>
  button.addEventListener("click", () =>
    setBlueprint(button.dataset.render === "blueprint"),
  ),
);
$("#lab-reset").addEventListener("click", () => scenes?.reset());

// Keep the content immediately usable while the 3D engine loads independently.
import("./scene.js")
  .then(({ createScenes }) => {
    scenes = createScenes({
      hero: $("#hero-scene"),
      skills: $("#skills-scene"),
      paused: motionPaused,
    });
    scenes.setCategory($("[data-skill].active").dataset.skill);
    if (!scenes.available) markGraphicsUnavailable();
    if (import.meta.env.DEV) window.__portfolio3D = scenes;
    scenes.onProject((positions) =>
      positions.forEach((position, index) => {
        const label = $(`[data-layer-label="${index}"]`);
        label.style.transform = `translate(${position.x}px,${position.y}px)`;
      }),
    );
    scenes.onLayer((index) => {
      if (!exploded) setExploded(true);
      selectLayer(index);
    });
    $("#reset-scene").addEventListener("click", () => scenes.reset());
  })
  .catch((error) => {
    console.warn(
      "The 3D scene could not start; the static sculpture remains available.",
      error,
    );
    markGraphicsUnavailable();
    $("#open-lab").setAttribute("aria-label", "3D exploration unavailable");
  });
