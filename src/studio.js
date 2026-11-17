import "./studio.css";
import "./collections.css";
import {
  areas,
  projects,
  roles,
  skillGroups,
  itemMeta,
  areaIndex,
} from "./portfolio-data.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const dialog = $("#portfolio-dialog");
let world,
  active = 0,
  paused = motionQuery.matches,
  night = false,
  exploded = false,
  scrollFrame = 0,
  toastTimer,
  dialogTrigger;
let panelStack = [],
  pointerPosition = { x: 0, y: 0 },
  hoveredItem = null;
const headings = [
  "A world<br> of <em>work.</em>",
  "Personal<br> <em>projects.</em>",
  "Professional<br> <em>work.</em>",
  "Built up.<br> <em>Step by step.</em>",
  "The tools.<br> <em>The thinking.</em>",
  "Your idea.<br> <em>Our next build.</em>",
];
const itemSummary = (id) =>
  projects[id]?.summary ||
  (id.startsWith("role:")
    ? roles.find((r) => r.id === id.slice(5))?.dates
    : id.startsWith("skill:")
      ? skillGroups[id.slice(6)]?.summary
      : "");
function objectLink(id) {
  const meta = itemMeta(id);
  return (
    '<button class="object-link" data-open="' +
    id +
    '"><span><b>' +
    esc(meta.name) +
    "</b><small>" +
    esc(itemSummary(id)) +
    '</small></span><span class="object-link-arrow" aria-hidden="true">↗</span></button>'
  );
}
function renderChapters() {
  $("#chapter-content").innerHTML = areas
    .map((a, i) => {
      const intro =
        i === 0
          ? "I'm Debajyoti. I build the interfaces you see—and the systems you don't."
          : a.description;
      const body =
        i === 0
          ? '<button class="text-link" data-open="about">Meet the developer <span class="round-arrow" aria-hidden="true">↗</span></button><div class="hero-footnote"><span>CLICK AN OBJECT. OPEN ITS STORY.</span><span>4.5+ YEARS · FRONTEND & FULL-STACK</span></div>'
          : i === 5
            ? '<button class="text-link" data-open="contact">Let’s make it happen <span class="round-arrow" aria-hidden="true">↗</span></button><div class="contact-links"><button data-copy-email>Copy email ⧉</button><button data-open="resume">Résumé ↗</button><a href="https://www.linkedin.com/in/debajyoti-maity-004920185/" target="_blank" rel="noopener">LinkedIn ↗</a></div>'
            : '<div class="chapter-items">' +
              a.items.map(objectLink).join("") +
              '</div><button class="collection-link" data-open="' +
              a.id +
              '">Open ' +
              a.label.toLowerCase() +
              ' <span aria-hidden="true">↗</span></button>';
      return (
        '<section id="' +
        a.id +
        '" class="chapter ' +
        (i === 0 ? "is-active" : "") +
        '" data-chapter="' +
        i +
        '" aria-labelledby="title-' +
        a.id +
        '"><div class="chapter-copy"><p class="eyebrow"><span class="chapter-number">' +
        a.number +
        "</span> " +
        (i === 0
          ? "WELCOME TO MY LITTLE UNIVERSE"
          : esc(a.label.toUpperCase())) +
        "</p><" +
        (i === 0 ? "h1" : "h2") +
        ' id="title-' +
        a.id +
        '">' +
        headings[i] +
        "</" +
        (i === 0 ? "h1" : "h2") +
        '><p class="chapter-description">' +
        esc(intro) +
        "</p>" +
        body +
        "</div></section>"
      );
    })
    .join("");
  $(".tour-nav").innerHTML =
    areas
      .map(
        (a, i) =>
          '<button data-stop="' +
          i +
          '" ' +
          (i === 0 ? 'aria-current="step"' : "") +
          ' aria-label="Move to ' +
          esc(a.label) +
          '"><span>' +
          a.number +
          "</span><b>" +
          a.short +
          "</b></button>",
      )
      .join("") + '<span class="nav-progress" aria-hidden="true"></span>';
}
renderChapters();
const chapters = $$(".chapter");
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3200);
}
function chapterHeight() {
  return chapters[0].getBoundingClientRect().height;
}
function travel(index) {
  if (dialog.open) dialog.close();
  hideTooltip();
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
    document.body.dataset.area = areas[active].id;
    chapters.forEach((el, i) => {
      el.classList.toggle("is-active", i === active);
      el.inert = i !== active;
      el.setAttribute("aria-hidden", String(i !== active));
    });
    $$(".tour-nav [data-stop]").forEach((b) => {
      if (Number(b.dataset.stop) === active)
        b.setAttribute("aria-current", "step");
      else b.removeAttribute("aria-current");
    });
    $("#current-chapter").textContent = areas[active].number;
    $(".scene-caption span").textContent =
      "AREA " +
      areas[active].number +
      " — " +
      areas[active].label.toUpperCase();
    hideTooltip();
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

function imageFor(id) {
  return world?.images[id] || "/exhibits/" + id + ".png";
}
function tags(values) {
  return (
    '<div class="tag-row">' +
    values.map((t) => "<span>" + esc(t) + "</span>").join("") +
    "</div>"
  );
}
function heading(kicker, title, description = "") {
  return (
    '<p class="dialog-eyebrow">' +
    esc(kicker) +
    '</p><h2 id="dialog-title" tabindex="-1">' +
    esc(title) +
    "</h2>" +
    (description ? '<p class="dialog-intro">' + esc(description) + "</p>" : "")
  );
}
function projectCard(id) {
  const p = projects[id];
  return (
    '<button class="collection-card" data-open="' +
    id +
    '" style="--card-accent:' +
    p.accent +
    '"><img src="' +
    imageFor(id) +
    '" alt="" width="1024" height="640" loading="lazy"><span class="collection-card-copy"><small>' +
    esc(p.company || p.role) +
    "</small><strong>" +
    esc(p.name) +
    "</strong><span>" +
    esc(p.summary) +
    "</span><b>Open project ↗</b></span></button>"
  );
}
function roleCard(role) {
  return (
    '<button class="timeline-card" data-open="role:' +
    role.id +
    '"><span class="timeline-date">' +
    esc(role.dates) +
    "</span><strong>" +
    esc(role.company) +
    "</strong><span>" +
    esc(role.role) +
    "</span><small>" +
    esc(role.summary) +
    '</small><b aria-hidden="true">↗</b></button>'
  );
}
function skillCard(id) {
  const s = skillGroups[id];
  return (
    '<button class="skill-card" data-open="skill:' +
    id +
    '"><span class="skill-symbol" aria-hidden="true">' +
    { frontend: "⌘", backend: "{ }", practice: "✳" }[id] +
    "</span><strong>" +
    esc(s.name) +
    "</strong><span>" +
    esc(s.summary) +
    "</span><small>" +
    s.skills.slice(0, 4).map(esc).join(" · ") +
    '</small><b aria-hidden="true">↗</b></button>'
  );
}
function related(ids, title = "Connected work") {
  return (
    '<section class="related-work"><h3>' +
    title +
    "</h3>" +
    ids
      .map(
        (id) =>
          '<button data-open="' +
          id +
          '"><span>' +
          esc(projects[id].name) +
          '</span><b aria-hidden="true">↗</b></button>',
      )
      .join("") +
    "</section>"
  );
}
function renderProject(id) {
  const p = projects[id],
    area = areas[areaIndex(p.area)];
  const facts = p.facts
    ? '<div class="project-facts">' +
      p.facts
        .map(
          (f) =>
            "<div><strong>" +
            esc(f.value) +
            "</strong><span>" +
            esc(f.label) +
            "</span></div>",
        )
        .join("") +
      "</div>"
    : "";
  return (
    '<button class="panel-parent" data-parent="' +
    p.area +
    '">← ' +
    area.label +
    "</button>" +
    heading(p.type + (p.company ? " / " + p.company : ""), p.name, p.intro) +
    '<figure class="project-figure"><img class="dialog-art" src="' +
    imageFor(id) +
    '" alt="Illustrative interface study for ' +
    esc(p.name) +
    '" width="1024" height="640"><figcaption>Illustrative interface study · ' +
    (p.area === "personal"
      ? "open the live application below to see the original."
      : "no internal screens or client data are shown.") +
    "</figcaption></figure>" +
    (id === "angular"
      ? '<button class="panel-scene-action" data-toggle-layers aria-pressed="' +
        exploded +
        '">' +
        (exploded
          ? "Bring the 3D layers together ↙"
          : "Separate the 3D layers ↗") +
        "</button>"
      : "") +
    '<div class="project-context"><div><small>MY ROLE</small><span>' +
    esc(p.role) +
    "</span></div>" +
    (p.dates
      ? "<div><small>WHEN</small><span>" + esc(p.dates) + "</span></div>"
      : "<div><small>COLLECTION</small><span>Personal Projects</span></div>") +
    "</div>" +
    facts +
    '<section class="dialog-content"><h3>What I built & contributed</h3><ul>' +
    p.decisions.map((d) => "<li>" + esc(d) + "</li>").join("") +
    "</ul></section>" +
    tags(p.stack) +
    '<div class="dialog-links">' +
    (p.url
      ? '<a href="' +
        p.url +
        '" target="_blank" rel="noopener">Open live project ↗</a><a href="' +
        p.source +
        '" target="_blank" rel="noopener">View source ↗</a>'
      : '<a href="mailto:debajyoti.maity29@gmail.com">Discuss this work ↗</a>') +
    "</div>" +
    (p.area === "professional"
      ? '<p class="project-note">Professional work completed in my role at ' +
        esc(p.company) +
        ". This overview describes my contribution; proprietary code and datasets are not published.</p>"
      : "") +
    related(p.related, "More in " + area.label.toLowerCase())
  );
}
function renderCollection(id) {
  const area = areas[areaIndex(id)];
  let content = "";
  if (id === "personal" || id === "professional")
    content =
      '<div class="collection-cards">' +
      area.items.map(projectCard).join("") +
      "</div>";
  if (id === "experience")
    content =
      '<div class="timeline-list">' +
      roles.map(roleCard).join("") +
      '</div><p class="collection-note">Click any role for the full responsibilities and the related work.</p>';
  if (id === "skills")
    content =
      '<div class="skill-cards">' +
      Object.keys(skillGroups).map(skillCard).join("") +
      '</div><p class="collection-note">Explore each group to see the tools and the work they support.</p>';
  return (
    heading("COLLECTION " + area.number, area.label, area.description) + content
  );
}
function renderRole(id) {
  const r = roles.find((r) => r.id === id.slice(5));
  return (
    '<button class="panel-parent" data-parent="experience">← All experience</button>' +
    heading("EXPERIENCE / " + r.location, r.company, r.summary) +
    '<div class="role-banner"><span>' +
    esc(r.role) +
    "</span><strong>" +
    esc(r.dates) +
    "</strong></div>" +
    '<section class="dialog-content"><h3>Responsibilities & contribution</h3><ul>' +
    r.points.map((s) => "<li>" + esc(s) + "</li>").join("") +
    "</ul></section>" +
    (r.project ? related([r.project], "Explore the work from this role") : "") +
    '<div class="role-navigation">' +
    roles
      .filter((role) => role.id !== r.id)
      .map(
        (role) =>
          '<button data-replace="role:' +
          role.id +
          '">' +
          esc(role.short) +
          " ↗</button>",
      )
      .join("") +
    "</div>"
  );
}
function renderSkills(id) {
  const key = id.slice(6),
    s = skillGroups[key];
  return (
    '<button class="panel-parent" data-parent="skills">← All skills</button>' +
    heading("SKILLS & APPROACH", s.name, s.intro) +
    '<nav class="skill-tabs" aria-label="Skill groups">' +
    Object.entries(skillGroups)
      .map(
        ([k, v]) =>
          '<button data-replace="skill:' +
          k +
          '" ' +
          (key === k ? 'aria-current="page"' : "") +
          ">" +
          v.label +
          "</button>",
      )
      .join("") +
    "</nav>" +
    tags(s.skills) +
    '<section class="dialog-content"><h3>How this shows up in the work</h3><ul>' +
    s.practice.map((t) => "<li>" + esc(t) + "</li>").join("") +
    "</ul></section>" +
    related(s.related, "See it in practice")
  );
}
function renderAbout() {
  return (
    heading(
      "THE PERSON BEHIND THE STUDIO",
      "Debajyoti Maity.",
      "Frontend-focused full-stack developer. 4.5+ years building web and mobile applications, connecting thoughtful interfaces with the systems behind them.",
    ) +
    '<div class="about-monogram" aria-hidden="true">dm<span>·</span><small>FRONTEND CRAFT / FULL-STACK THINKING</small></div>' +
    '<p class="panel-prose">My work spans Angular, React, and Ionic interfaces; Java and Python backends; and frontend leadership on enterprise and government-domain projects. I turn complex workflows into modular, responsive applications.</p>' +
    '<div class="about-facts"><div><strong>4.5+</strong><span>years of experience</span></div><div><strong>4</strong><span>professional teams</span></div><div><strong>Web + mobile</strong><span>connected experiences</span></div></div>' +
    '<div class="panel-paths"><button data-open="experience">Explore my experience ↗</button><button data-open="skills">Look inside the toolkit ↗</button><button data-open="resume">Résumé & education ↗</button></div>' +
    '<div class="dialog-links"><button data-open="contact">Start a conversation ↗</button></div>'
  );
}
function renderResume() {
  return (
    heading(
      "RÉSUMÉ & EDUCATION",
      "The full picture.",
      "A concise record of my experience, technical skills, and education.",
    ) +
    '<div class="resume-preview"><span class="resume-mark">DM</span><div><strong>Debajyoti Maity</strong><p>Frontend-focused Full-Stack Developer</p><span>4.5+ years · Angular · React · Ionic</span></div><small>PDF / ONE PAGE</small></div>' +
    '<div class="dialog-links"><a href="/Debajyoti-Maity-Resume.pdf" target="_blank" rel="noopener">Read résumé ↗</a><a href="/Debajyoti-Maity-Resume.pdf" download="Debajyoti-Maity-Resume.pdf">Download PDF ↓</a></div>' +
    '<section class="education"><h3>Education</h3><strong>B.Tech in Computer Science</strong>University of Engineering and Management<br>2016–2020</section>' +
    '<div class="panel-paths"><button data-open="experience">Read the experience timeline ↗</button><button data-open="skills">Explore skills ↗</button><button data-open="contact">Get in touch ↗</button></div>'
  );
}
function renderContact() {
  return (
    heading(
      "LET’S BUILD SOMETHING",
      "Start with a hello.",
      "Tell me about the interface, application, or system you have in mind.",
    ) +
    '<a class="contact-address" href="mailto:debajyoti.maity29@gmail.com"><small>EMAIL</small><strong>debajyoti.maity29@gmail.com</strong><span>Write an email ↗</span></a>' +
    '<button class="copy-button" data-copy-email>Copy email address ⧉</button>' +
    '<div class="contact-directory"><a href="tel:+917679101800"><span>Phone</span><strong>+91 7679101800 ↗</strong></a><a href="https://www.linkedin.com/in/debajyoti-maity-004920185/" target="_blank" rel="noopener"><span>LinkedIn</span><strong>Connect professionally ↗</strong></a><a href="https://github.com/deba-maity" target="_blank" rel="noopener"><span>GitHub</span><strong>Explore the code ↗</strong></a><button data-open="resume"><span>Résumé</span><strong>Read or download ↗</strong></button></div>' +
    '<p class="contact-note">Frontend development · Full-stack applications · Web & mobile experiences</p>'
  );
}
function renderIndex() {
  return (
    heading(
      "FIND YOUR WAY AROUND",
      "A world with a little order.",
      "Browse by collection, or click an object in the studio to open its story.",
    ) +
    '<div class="directory-grid">' +
    [
      {
        id: "about",
        number: "00",
        label: "About Debajyoti",
        note: "The developer behind the studio",
      },
      ...areas.slice(1).map((a) => ({
        id: a.id,
        number: a.number,
        label: a.label,
        note:
          a.id === "contact"
            ? "Email, phone & social links"
            : a.items.length +
              " " +
              {
                personal: "personal projects",
                professional: "professional work stories",
                experience: "roles",
                skills: "skill groups",
              }[a.id],
      })),
    ]
      .map(
        (a) =>
          '<button data-open="' +
          a.id +
          '"><small>' +
          a.number +
          "</small><strong>" +
          a.label +
          "</strong><span>" +
          a.note +
          '</span><b aria-hidden="true">↗</b></button>',
      )
      .join("") +
    "</div>" +
    '<div class="directory-bottom"><button data-open="resume">Résumé & education ↗</button><a href="mailto:debajyoti.maity29@gmail.com">Get in touch ↗</a></div>'
  );
}
function renderPanel(id) {
  const meta = itemMeta(id);
  const renderers = {
    project: () => renderProject(id),
    collection: () => renderCollection(id),
    role: () => renderRole(id),
    skill: () => renderSkills(id),
    about: renderAbout,
    resume: renderResume,
    contact: renderContact,
    index: renderIndex,
  };
  $("#dialog-body").innerHTML = (renderers[meta.kind] || renderIndex)();
  $("#panel-context").textContent =
    meta.kind === "index"
      ? "STUDIO INDEX"
      : areas[areaIndex(meta.area)].label.toUpperCase();
  $("#dialog-back").hidden = panelStack.length < 2;
  dialog.dataset.item = id;
  document.body.dataset.selection = id;
  dialog.scrollTop = 0;
  $("#dialog-body").scrollTop = 0;
  world?.inspect(id === "index" ? null : id);
}
function openItem(id, { replace = false, parent = false } = {}) {
  const meta = itemMeta(id);
  if (meta.kind === "action") {
    toggleLighting();
    return;
  }
  hideTooltip();
  if (!dialog.open) {
    dialogTrigger =
      document.activeElement === document.body
        ? $(".tour-nav [aria-current]")
        : document.activeElement;
    panelStack = [];
  }
  if (parent) panelStack = [id];
  else if (replace && panelStack.length) panelStack[panelStack.length - 1] = id;
  else if (panelStack.at(-1) !== id) panelStack.push(id);
  renderPanel(id);
  if (!dialog.open) dialog.showModal();
  document.body.classList.add("has-panel");
  document.body.style.overflow = "hidden";
  world?.inspect(id === "index" ? null : id, { open: true });
  $("#close-dialog").focus({ preventScroll: true });
}
document.addEventListener("click", (event) => {
  const target = event.target.closest(
    "[data-stop],[data-open],[data-replace],[data-parent],[data-copy-email],[data-toggle-layers]",
  );
  if (!target) return;
  if (target.hasAttribute("data-stop"))
    return travel(Number(target.dataset.stop));
  if (target.hasAttribute("data-open")) return openItem(target.dataset.open);
  if (target.hasAttribute("data-replace"))
    return openItem(target.dataset.replace, { replace: true });
  if (target.hasAttribute("data-parent"))
    return openItem(target.dataset.parent, { parent: true });
  if (target.hasAttribute("data-toggle-layers")) return toggleLayers();
  if (target.hasAttribute("data-copy-email")) copyEmail(target);
});
$("#dialog-back").addEventListener("click", () => {
  if (panelStack.length > 1) {
    panelStack.pop();
    renderPanel(panelStack.at(-1));
    $("#dialog-back").hidden
      ? $("#close-dialog").focus()
      : $("#dialog-back").focus();
  }
});
$("#index-button").addEventListener("click", () => openItem("index"));
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
  document.body.classList.remove("has-panel");
  document.body.style.overflow = "";
  delete document.body.dataset.selection;
  world?.inspect(null, { open: false });
  if (dialogTrigger?.isConnected && !dialogTrigger.closest("[inert]"))
    dialogTrigger.focus({ preventScroll: true });
  panelStack = [];
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
    hideTooltip();
  }
});
$("#reset-view").addEventListener("click", () => {
  world?.reset();
  hideTooltip();
});
function toggleLighting() {
  night = !night;
  document.body.classList.toggle("night", night);
  $("#lighting-toggle").setAttribute("aria-pressed", String(night));
  $("#lighting-toggle").title = night
    ? "Switch to daylight"
    : "Switch to evening lighting";
  $("#lighting-toggle span").textContent = night ? "Daylight" : "Evening light";
  world?.setNight(night);
}
$("#lighting-toggle").addEventListener("click", toggleLighting);
function toggleLayers() {
  exploded = !exploded;
  $("#exhibit-action").setAttribute("aria-pressed", String(exploded));
  $("#exhibit-action").textContent = exploded
    ? "Bring Angular layers together ↙"
    : "Separate Angular layers ↗";
  $$("[data-toggle-layers]").forEach((b) => {
    b.setAttribute("aria-pressed", String(exploded));
    b.textContent = exploded
      ? "Bring the 3D layers together ↙"
      : "Separate the 3D layers ↗";
  });
  world?.setExploded(exploded);
}
$("#exhibit-action").addEventListener("click", toggleLayers);
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
async function copyEmail(trigger) {
  try {
    await navigator.clipboard.writeText("debajyoti.maity29@gmail.com");
    const original = trigger.textContent;
    trigger.textContent = "Email copied ✓";
    setTimeout(() => {
      if (trigger.isConnected) trigger.textContent = original;
    }, 3200);
    toast("Email copied. Let’s build something.");
  } catch {
    toast("debajyoti.maity29@gmail.com");
  }
}
function hideTooltip() {
  hoveredItem = null;
  $("#object-tooltip").classList.remove("visible");
  world?.setHovered(null);
}
function showTooltip(id) {
  if (dialog.open || !id) {
    $("#object-tooltip").classList.remove("visible");
    hoveredItem = null;
    return;
  }
  hoveredItem = id;
  const meta = itemMeta(id);
  $(".tooltip-category").textContent = areas[areaIndex(meta.area)].label;
  $(".tooltip-name").textContent = meta.name;
  $(".tooltip-action").textContent = meta.action + " ↗";
  const tip = $("#object-tooltip");
  tip.style.left = Math.min(innerWidth - 260, pointerPosition.x + 18) + "px";
  tip.style.top =
    Math.max(90, Math.min(innerHeight - 120, pointerPosition.y - 70)) + "px";
  tip.classList.add("visible");
}
document.addEventListener(
  "pointermove",
  (event) => {
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (hoveredItem) showTooltip(hoveredItem);
  },
  { passive: true },
);
document.addEventListener("pointerover", (event) => {
  const pin = event.target.closest(
    ".hotspot[data-open], .object-link[data-open]",
  );
  if (pin) world?.setHovered(pin.dataset.open);
});
document.addEventListener("pointerout", (event) => {
  if (event.target.closest(".hotspot[data-open], .object-link[data-open]"))
    world?.setHovered(null);
});
document.addEventListener("focusin", (event) => {
  const trigger = event.target.closest(
    ".hotspot[data-open], .object-link[data-open]",
  );
  if (trigger) world?.setHovered(trigger.dataset.open);
});
document.addEventListener("focusout", (event) => {
  if (event.target.closest(".hotspot[data-open], .object-link[data-open]"))
    world?.setHovered(null);
});
function graphicsUnavailable() {
  document.body.classList.add("graphics-unavailable");
  $("#scene-status-text").textContent =
    "Still view · open any collection to explore";
  hideTooltip();
}
syncScroll();
syncMotion();
import("./studio-scene.js")
  .then(async ({ createStudio }) => {
    world = await createStudio($("#world"), {
      reducedMotion: motionQuery.matches,
      onSelect: (id) => openItem(id),
      onHover: showTooltip,
      onOrbit: (value) => {
        document.body.classList.toggle("is-orbiting", value);
        if (value) hideTooltip();
        $("#scene-status-text").textContent = value
          ? "Looking around · click an object to open it"
          : "Click an object to open its story";
      },
      onReady: () => {
        document.body.classList.remove("graphics-unavailable");
        $("#scene-status-text").textContent =
          "Click an object to open its story";
      },
      onFailure: graphicsUnavailable,
    });
    syncScroll();
    syncMotion();
    world.setNight(night);
    if (dialog.open)
      world.inspect(panelStack.at(-1) === "index" ? null : panelStack.at(-1), {
        open: true,
      });
    if (import.meta.env.DEV) window.__studio = world;
  })
  .catch(graphicsUnavailable);
addEventListener("pagehide", () => world?.setSuspended(true));
addEventListener("pageshow", () => world?.setSuspended(false));
if (import.meta.hot) import.meta.hot.dispose(() => world?.dispose());
