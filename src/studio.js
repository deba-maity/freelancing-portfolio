import "./studio.css";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const chapters = $$(".chapter");
const dialog = $("#portfolio-dialog");
let world,
  active = 0,
  paused = motionQuery.matches,
  night = false,
  exploded = false,
  scrollFrame = 0,
  toastTimer,
  dialogTrigger;
const chapterNames = [
  "The studio",
  "Health Planner",
  "Angular Lab",
  "Systems at scale",
  "The journey",
  "Say hello",
];
const projects = {
  health: {
    number: "01",
    title: "Small steps. Better days.",
    name: "Health Planner",
    type: "Personal project / Angular",
    intro:
      "A diet and fitness planner that brings dashboards, personal goals, and progress tracking into one Angular application. Built to make a daily routine easier to understand and follow.",
    decisions: [
      "Organized health information into clear dashboards so the next step is easier to find.",
      "Connected goal setting and tracking in one planning experience.",
      "Used Angular to structure the application around reusable interface components.",
    ],
    stack: ["Angular", "TypeScript", "Dashboards", "Goal setting"],
    url: "https://deba-maity.github.io/healthplanner/",
    source: "https://github.com/deba-maity/healthplanner",
  },
  angular: {
    number: "02",
    title: "Take it apart. Make it work.",
    name: "Angular Features Showcase",
    type: "Personal project / Angular 17",
    intro:
      "A practical playground for the building blocks of modern Angular. Routing, reactive forms, services, and dynamic component rendering, brought together in one explorable application.",
    decisions: [
      "Demonstrated routing and services as the connective tissue of an Angular application.",
      "Explored reactive forms for structured and maintainable user input.",
      "Showcased dynamic component rendering for flexible interface composition.",
    ],
    stack: [
      "Angular 17",
      "TypeScript",
      "Reactive forms",
      "Routing",
      "Dynamic components",
    ],
    url: "https://deba-maity.github.io/Angular-features/",
    source: "https://github.com/deba-maity/Angular-features",
  },
  healthcare: {
    number: "03",
    title: "Complex data. Clear structure.",
    name: "Healthcare Test Data Platform",
    type: "Professional work / VJL IT AUGMENTS",
    intro:
      "Architected and developed a government healthcare test data platform for UK public health, enabling structured management of multi-disease diagnostic datasets. A complex public-sector workflow, translated into production-ready features.",
    decisions: [
      "Led Angular 18 frontend development and mentored a team of four developers.",
      "Designed a modular frontend architecture with cross-functional stakeholders.",
      "Improved frontend performance through lazy loading and efficient component rendering.",
      "Delivered core platform features within two weeks with AI-assisted development workflows.",
    ],
    stack: [
      "Angular 18",
      "Frontend architecture",
      "Performance",
      "Team leadership",
    ],
    note: "Professional project overview based on my role at VJL IT AUGMENTS. No internal screens, datasets, or proprietary source code are shown.",
  },
};
const roles = [
  {
    company: "VJL IT AUGMENTS",
    role: "Full-Stack Developer",
    dates: "Aug 2025 — Present",
    location: "Remote",
    points: [
      "Architected a government healthcare test data platform for UK public health, supporting structured multi-disease diagnostic datasets.",
      "Led Angular 18 frontend development, mentored four developers, and implemented lazy loading and efficient rendering.",
      "Shipped core features in two weeks using AI-assisted workflows, working with stakeholders on scalable frontend architecture.",
    ],
  },
  {
    company: "Rhythmflows Solutions",
    role: "Full-Stack Developer",
    dates: "Oct 2024 — Jul 2025",
    location: "Pune",
    points: [
      "Built enterprise dashboards and reporting systems for clients including HDFC, NSDL, and Bajaj.",
      "Designed REST APIs with Django ORM and SQL, with attention to query optimization and frontend-backend communication.",
      "Implemented real-time chat with Redis and WebSockets, alongside dark mode, responsive layouts, lazy loading, and chart visualizations.",
    ],
  },
  {
    company: "Otobit Pvt Ltd",
    role: "Full-Stack Developer",
    dates: "Mar 2023 — May 2024",
    location: "Surat",
    points: [
      "Built and deployed Angular and Ionic 6 applications for web and mobile, including gesture-based interactions.",
      "Integrated REST and GraphQL APIs with Node.js and Tailwind-based interfaces.",
      "Led three developers, built modules for dashboards, payments, authentication, and CRUD operations, and incorporated unit tests.",
    ],
  },
  {
    company: "Tata Consultancy Services",
    role: "Frontend, UI-UX Developer",
    dates: "Mar 2021 — Oct 2022",
    location: "Enterprise delivery",
    points: [
      "Built custom UI components and AngularJS features including lazy loading.",
      "Contributed to Java and Maven backend CRUD operations.",
      "Managed manual and unit testing across DEV, INT, and UAT environments to support reliable releases.",
    ],
  },
];

function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}
function chapterHeight() {
  return chapters[0].getBoundingClientRect().height;
}
function travel(index) {
  if (dialog.open) dialog.close();
  world?.reset();
  window.scrollTo({
    top: index * chapterHeight(),
    behavior: motionQuery.matches ? "instant" : "smooth",
  });
}
function syncScroll() {
  scrollFrame = 0;
  const progress = Math.max(0, Math.min(5, scrollY / chapterHeight()));
  const next = Math.round(progress);
  world?.setProgress(progress);
  document.documentElement.style.setProperty("--nav-progress", progress / 5);
  if (next !== active || !document.body.dataset.chapter) {
    active = next;
    document.body.dataset.chapter = String(active);
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle("is-active", i === active);
      chapter.inert = i !== active;
      chapter.setAttribute("aria-hidden", String(i !== active));
    });
    $$(".tour-nav [data-stop]").forEach((button) => {
      if (Number(button.dataset.stop) === active)
        button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    $("#current-chapter").textContent = String(active).padStart(2, "0");
    $(".scene-caption span").textContent =
      "FIG. " +
      String(active + 1).padStart(2, "0") +
      " — " +
      chapterNames[active].toUpperCase();
  }
}
addEventListener(
  "scroll",
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  },
  { passive: true },
);
addEventListener("resize", () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
});
document.addEventListener("click", (event) => {
  const stop = event.target.closest("[data-stop]");
  if (stop) {
    travel(Number(stop.dataset.stop));
    return;
  }
  const project = event.target.closest("[data-project]");
  if (project) {
    openProject(project.dataset.project);
    return;
  }
  if (event.target.closest("[data-open-profile]")) openProfile();
});
$(".identity").addEventListener("click", (event) => {
  event.preventDefault();
  travel(0);
});
document.addEventListener("keydown", (event) => {
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    travel(Math.min(5, active + 1));
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    travel(Math.max(0, active - 1));
  }
  if (event.key === "Escape") {
    world?.reset();
  }
});

function openDialog(html) {
  if (!dialog.open) dialogTrigger = document.activeElement;
  $("#dialog-body").innerHTML = html;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = "hidden";
  world?.setSuspended(true);
  $("#close-dialog").focus();
}
function openProject(id) {
  const p = projects[id];
  if (!p) return;
  const image = world?.images[id];
  openDialog(
    '<p class="dialog-eyebrow">PROJECT FILE ' +
      p.number +
      " / " +
      p.type +
      '</p><h2 id="dialog-title">' +
      p.name +
      '</h2><p class="dialog-intro">' +
      p.intro +
      '</p><div class="dialog-layout"><div class="dialog-content"><h3>The work behind the interface</h3><ul>' +
      p.decisions.map((s) => "<li>" + s + "</li>").join("") +
      '</ul><div class="tag-row">' +
      p.stack.map((s) => "<span>" + s + "</span>").join("") +
      '</div><div class="dialog-links">' +
      (p.url
        ? '<a href="' +
          p.url +
          '" target="_blank" rel="noopener">Open live project ↗</a><a href="' +
          p.source +
          '" target="_blank" rel="noopener">View source ↗</a>'
        : '<a href="mailto:debajyoti.maity29@gmail.com">Discuss the work ↗</a>') +
      '</div></div><div class="dialog-visual">' +
      (image
        ? '<img class="dialog-art" src="' +
          image +
          '" alt="Illustrative ' +
          p.name +
          ' interface study" width="1024" height="640">'
        : "") +
      '<p class="art-caption">' +
      (p.note ||
        "The studio exhibit is an illustrative interface study created for this portfolio. Open the live project to explore the original application.") +
      "</p></div></div>",
  );
}
function openProfile() {
  openDialog(
    '<p class="dialog-eyebrow">THE PERSON BEHIND THE STUDIO</p><h2 id="dialog-title">Frontend craft.<br>Full-stack thinking.</h2><p class="dialog-intro">I’m Debajyoti Maity, a frontend-focused full-stack developer with 4.5+ years of experience building web and mobile applications. My work connects interface design, backend integration, and team leadership across enterprise and public-sector projects.</p>' +
      roles
        .map(
          (r) =>
            '<article class="profile-row"><div class="profile-date">' +
            r.dates +
            "<br>" +
            r.location +
            "</div><div><h3>" +
            r.company +
            '</h3><span class="profile-role">' +
            r.role +
            "</span><ul>" +
            r.points.map((p) => "<li>" + p + "</li>").join("") +
            "</ul></div></article>",
        )
        .join("") +
      '<h3 class="profile-section-title">The toolkit</h3><div class="skills-grid"><div><h4>Interfaces</h4><p>Angular v4–v19 · React · Ionic · TypeScript · JavaScript · HTML5 · CSS3 · Tailwind · Bootstrap · Jest</p></div><div><h4>Systems</h4><p>Java · Python · Node.js · Spring Boot · Django ORM · REST APIs · GraphQL · JWT · Redis · WebSockets</p></div><div><h4>Practice</h4><p>Git · Postman · Responsive design · Performance optimization · System design · Unit testing · Team leadership</p></div></div><div class="education"><strong>B.Tech in Computer Science</strong>University of Engineering and Management · 2016–2020</div><div class="dialog-links" style="margin-top:25px"><a href="/Debajyoti-Maity-Resume.pdf" target="_blank" rel="noopener">Read the résumé ↗</a><a href="mailto:debajyoti.maity29@gmail.com">Get in touch ↗</a></div>',
  );
}
$("#index-button").addEventListener("click", () => {
  openDialog(
    '<p class="dialog-eyebrow">FIND YOUR WAY AROUND</p><h2 id="dialog-title">A small world.<br>A lot to explore.</h2><div class="index-grid"><nav class="index-list" aria-label="Studio index">' +
      chapterNames
        .map(
          (s, i) =>
            '<button data-stop="' +
            i +
            '"><span>' +
            String(i).padStart(2, "0") +
            "</span>" +
            s +
            " ↗</button>",
        )
        .join("") +
      '</nav><div class="index-aside"><h3 class="profile-section-title">Debajyoti Maity</h3><p>Frontend-focused full-stack developer. Angular, React, Ionic, and the systems that make them work.</p><button class="text-link" data-open-profile>Experience & skills <span class="round-arrow">↗</span></button><a href="mailto:debajyoti.maity29@gmail.com">debajyoti.maity29@gmail.com ↗</a><a href="tel:+917679101800">+91 7679101800 ↗</a><a href="https://www.linkedin.com/in/debajyoti-maity-004920185/" target="_blank" rel="noopener">LinkedIn ↗</a><a href="https://github.com/deba-maity" target="_blank" rel="noopener">GitHub ↗</a><a href="/Debajyoti-Maity-Resume.pdf" target="_blank" rel="noopener">Read the résumé ↗</a></div></div>',
  );
});
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  world?.setSuspended(false);
  if (dialogTrigger?.isConnected && !dialogTrigger.closest("[inert]"))
    dialogTrigger.focus({ preventScroll: true });
});
$("#reset-view").addEventListener("click", () => world?.reset());
$("#exhibit-action").addEventListener("click", () => {
  exploded = !exploded;
  $("#exhibit-action").setAttribute("aria-pressed", String(exploded));
  $("#exhibit-action").textContent = exploded
    ? "Bring the layers together ↙"
    : "Pull the layers apart ↗";
  world?.setExploded(exploded);
});
$("#lighting-toggle").addEventListener("click", () => {
  night = !night;
  document.body.classList.toggle("night", night);
  $("#lighting-toggle").setAttribute("aria-pressed", String(night));
  $("#lighting-toggle").title = night
    ? "Switch to daylight"
    : "Switch to evening lighting";
  $("#lighting-toggle span").textContent = night ? "Daylight" : "Evening light";
  world?.setNight(night);
});
function syncMotion() {
  const b = $("#motion-toggle");
  b.setAttribute("aria-pressed", String(paused));
  b.title = paused ? "Resume ambient animation" : "Pause ambient animation";
  b.querySelector("span").textContent = paused
    ? "Resume motion"
    : "Pause motion";
  world?.setPaused(paused);
}
$("#motion-toggle").addEventListener("click", () => {
  paused = !paused;
  syncMotion();
});
motionQuery.addEventListener("change", () => {
  paused = motionQuery.matches;
  syncMotion();
});
$("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("debajyoti.maity29@gmail.com");
    toast("Email copied. Let’s build something.");
  } catch {
    toast("debajyoti.maity29@gmail.com");
  }
});
function graphicsUnavailable() {
  document.body.classList.add("graphics-unavailable");
  $("#scene-status-text").textContent =
    "Still view · all project details available";
  $("#world").classList.add("has-poster");
}
syncScroll();
syncMotion();
import("./studio-scene.js")
  .then(async ({ createStudio }) => {
    world = await createStudio($("#world"), {
      reducedMotion: motionQuery.matches,
      onNavigate: (index) => {
        if (index === active && index > 0) {
          if (index < 4)
            openProject(["", "health", "angular", "healthcare"][index]);
          else if (index === 4) openProfile();
          else location.href = "mailto:debajyoti.maity29@gmail.com";
        } else travel(index);
      },
      onOrbit: (value) => {
        document.body.classList.toggle("is-orbiting", value);
        $("#scene-status-text").textContent = value
          ? "Exploring · scroll to return to the tour"
          : "Live 3D · built with intention";
      },
      onReady: () => {
        document.body.classList.remove("graphics-unavailable");
        $("#scene-status-text").textContent = "Live 3D · built with intention";
      },
      onFailure: graphicsUnavailable,
    });
    syncScroll();
    syncMotion();
    if (import.meta.env.DEV) window.__studio = world;
  })
  .catch(graphicsUnavailable);
addEventListener("pagehide", () => world?.setSuspended(true));
addEventListener("pageshow", () => world?.setSuspended(false));
if (import.meta.hot) import.meta.hot.dispose(() => world?.dispose());
