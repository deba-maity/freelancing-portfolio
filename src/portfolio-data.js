export const areas = [
  {
    id: "studio",
    label: "The studio",
    short: "Studio",
    number: "00",
    title: "A world of work.",
    description: "Meet the developer behind the work.",
    items: ["about"],
  },
  {
    id: "personal",
    label: "Personal Projects",
    short: "Projects",
    number: "01",
    title: "Built out of curiosity.",
    description:
      "Two independent Angular projects. One place to explore the ideas, interfaces, and source code.",
    items: ["health", "angular"],
  },
  {
    id: "professional",
    label: "Professional Work",
    short: "Work",
    number: "02",
    title: "Built for the real world.",
    description:
      "Public health, enterprise reporting, and cross-platform applications. Work delivered as part of professional teams.",
    items: ["healthcare", "enterprise", "mobile"],
  },
  {
    id: "experience",
    label: "Experience",
    short: "Experience",
    number: "03",
    title: "Every role adds a layer.",
    description:
      "4.5+ years across four teams. Select a step to see the work, responsibilities, and experience behind it.",
    items: ["role:tcs", "role:otobit", "role:rhythmflows", "role:vjl"],
  },
  {
    id: "skills",
    label: "Skills & Approach",
    short: "Skills",
    number: "04",
    title: "The tools. The thinking.",
    description:
      "Frontend depth, backend fluency, and the habits that help a team ship reliable software.",
    items: ["skill:frontend", "skill:backend", "skill:practice"],
  },
  {
    id: "contact",
    label: "Get in Touch",
    short: "Contact",
    number: "05",
    title: "Your idea. Our next build.",
    description:
      "A thoughtful interface. A complex system. Something that doesn’t exist yet.",
    items: ["contact", "resume"],
  },
];

export const projects = {
  health: {
    area: "personal",
    number: "01",
    name: "Health Planner",
    subtitle: "Small steps. Better days.",
    type: "Personal project",
    role: "Angular application",
    accent: "#58794b",
    summary: "Diet, fitness, goals, and progress in one Angular application.",
    intro:
      "A diet and fitness planner that brings dashboards, personal goals, and progress tracking into one Angular application. Built to make a daily routine easier to understand and follow.",
    decisions: [
      "Organized health information into dashboards so the next step is easier to find.",
      "Connected goal setting and tracking in a single planning experience.",
      "Used Angular to structure the application around reusable interface components.",
    ],
    stack: ["Angular", "TypeScript", "Dashboards", "Goal setting"],
    url: "https://deba-maity.github.io/healthplanner/",
    source: "https://github.com/deba-maity/healthplanner",
    related: ["angular"],
  },
  angular: {
    area: "personal",
    number: "02",
    name: "Angular Features Showcase",
    subtitle: "Take it apart. Make it work.",
    type: "Personal project",
    role: "Angular 17 playground",
    accent: "#3b59b5",
    summary:
      "An explorable playground for routes, forms, services, and dynamic components.",
    intro:
      "A practical collection of Angular 17 features, bringing routing, reactive forms, services, and dynamic component rendering into one explorable application.",
    decisions: [
      "Demonstrated routing and services as the connective tissue of an Angular application.",
      "Explored reactive forms for structured, maintainable user input.",
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
    related: ["health"],
  },
  healthcare: {
    area: "professional",
    number: "01",
    name: "Healthcare Test Data Platform",
    subtitle: "Complex data. Clear structure.",
    type: "Professional work",
    company: "VJL IT AUGMENTS",
    role: "Full-Stack Developer · Frontend lead",
    dates: "Aug 2025 — Present",
    accent: "#497567",
    summary:
      "Structured diagnostic datasets and modular Angular architecture for UK public health.",
    intro:
      "Architected and developed a government healthcare test data platform for UK public health, enabling structured management of multi-disease diagnostic datasets. The work translated complex public-sector workflows into production-ready features.",
    decisions: [
      "Led Angular 18 frontend development and mentored a team of four developers.",
      "Designed modular, scalable frontend architecture with cross-functional stakeholders.",
      "Implemented lazy loading and efficient component rendering to improve frontend performance.",
      "Delivered core platform features within two weeks using AI-assisted development workflows.",
    ],
    stack: [
      "Angular 18",
      "Frontend architecture",
      "Performance",
      "Team leadership",
    ],
    facts: [
      { value: "4", label: "developers mentored" },
      { value: "2 weeks", label: "core feature delivery" },
    ],
    related: ["enterprise", "mobile"],
  },
  enterprise: {
    area: "professional",
    number: "02",
    name: "Enterprise Dashboards & Reporting",
    subtitle: "Make complex information usable.",
    type: "Professional work",
    company: "Rhythmflows Solutions",
    role: "Full-Stack Developer",
    dates: "Oct 2024 — Jul 2025",
    accent: "#73549b",
    summary:
      "Reporting interfaces, optimized APIs, and real-time collaboration for enterprise clients.",
    intro:
      "Developed enterprise dashboards and reporting systems for clients including HDFC, NSDL, and Bajaj. The work connected data-heavy interfaces with efficient backend queries and real-time communication.",
    decisions: [
      "Built dashboards and reporting interfaces for enterprise workflows.",
      "Designed and integrated REST APIs using Django ORM and SQL, with query optimization and scalable frontend-backend communication.",
      "Implemented user-to-user chat using Redis and WebSockets.",
      "Added dark mode, lazy loading, responsive layouts, and chart visualizations.",
    ],
    stack: [
      "Django ORM",
      "SQL",
      "REST APIs",
      "Redis",
      "WebSockets",
      "Data visualization",
    ],
    related: ["healthcare", "mobile"],
  },
  mobile: {
    area: "professional",
    number: "03",
    name: "Cross-Platform Web & Mobile",
    subtitle: "One connected experience. More places to use it.",
    type: "Professional work",
    company: "Otobit Pvt Ltd",
    role: "Full-Stack Developer · Team lead",
    dates: "Mar 2023 — May 2024",
    accent: "#bc633d",
    summary:
      "Angular and Ionic applications with gesture-based interactions and connected backend modules.",
    intro:
      "Developed and deployed cross-platform mobile and web applications using Angular and Ionic 6. The work covered responsive interfaces, mobile gestures, API integrations, and modular services.",
    decisions: [
      "Built responsive interfaces and gesture-based interactions for mobile.",
      "Integrated REST and GraphQL APIs using Node.js, with Tailwind-based UI.",
      "Implemented microservices-based modules for dashboards, payments, authentication, and CRUD operations.",
      "Led a team of three developers and incorporated unit testing to improve reliability.",
    ],
    stack: [
      "Angular",
      "Ionic 6",
      "Node.js",
      "REST",
      "GraphQL",
      "Tailwind",
      "Unit testing",
    ],
    facts: [{ value: "3", label: "developers led" }],
    related: ["healthcare", "enterprise"],
  },
};

export const roles = [
  {
    id: "vjl",
    company: "VJL IT AUGMENTS",
    short: "VJL",
    role: "Full-Stack Developer",
    dates: "Aug 2025 — Present",
    location: "Remote",
    summary:
      "Public-health data platforms, Angular architecture, and frontend leadership.",
    project: "healthcare",
    points: [
      "Architected a government healthcare test data platform for UK public health, supporting structured multi-disease diagnostic datasets.",
      "Led Angular 18 frontend development, mentored four developers, and implemented lazy loading and efficient rendering.",
      "Delivered core features in two weeks using AI-assisted workflows, collaborating with stakeholders on scalable frontend architecture.",
    ],
  },
  {
    id: "rhythmflows",
    company: "Rhythmflows Solutions",
    short: "Rhythmflows",
    role: "Full-Stack Developer",
    dates: "Oct 2024 — Jul 2025",
    location: "Pune",
    summary: "Enterprise dashboards, optimized REST APIs, and real-time chat.",
    project: "enterprise",
    points: [
      "Built enterprise dashboards and reporting systems for clients including HDFC, NSDL, and Bajaj.",
      "Designed REST APIs with Django ORM and SQL, focusing on query optimization and frontend-backend communication.",
      "Implemented real-time chat with Redis and WebSockets, alongside dark mode, lazy loading, responsive layouts, and chart visualizations.",
    ],
  },
  {
    id: "otobit",
    company: "Otobit Pvt Ltd",
    short: "Otobit",
    role: "Full-Stack Developer",
    dates: "Mar 2023 — May 2024",
    location: "Surat",
    summary:
      "Cross-platform applications, API integrations, and a team of three.",
    project: "mobile",
    points: [
      "Built and deployed Angular and Ionic 6 applications for web and mobile, including gesture-based interactions.",
      "Integrated REST and GraphQL APIs with Node.js and Tailwind-based interfaces.",
      "Led three developers, built modules for dashboards, payments, authentication, and CRUD operations, and incorporated unit testing.",
    ],
  },
  {
    id: "tcs",
    company: "Tata Consultancy Services",
    short: "TCS",
    role: "Frontend, UI-UX Developer",
    dates: "Mar 2021 — Oct 2022",
    location: "Enterprise delivery",
    summary: "Custom interfaces, Java-backed workflows, and reliable releases.",
    points: [
      "Built custom UI components and AngularJS features including lazy loading.",
      "Contributed to backend CRUD operations using Java and Maven.",
      "Managed manual and unit testing across DEV, INT, and UAT environments to support stable releases.",
    ],
  },
];

export const skillGroups = {
  frontend: {
    name: "Frontend & Mobile",
    label: "FRONTEND",
    summary: "The part people touch. The details they notice.",
    intro:
      "My strongest focus is building responsive, maintainable interfaces across web and mobile. I work across Angular generations, React, and Ionic, with an emphasis on clear component structure and efficient rendering.",
    skills: [
      "Angular v4–v19",
      "React",
      "Ionic",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind",
      "Bootstrap",
    ],
    practice: [
      "Reusable component architecture",
      "Responsive layouts and mobile gestures",
      "Lazy loading and efficient rendering",
    ],
    related: ["health", "angular", "mobile"],
  },
  backend: {
    name: "Backend & APIs",
    label: "BACKEND",
    summary: "The systems that make an interface useful.",
    intro:
      "I connect frontend experiences to backend services, data models, and real-time communication. My work includes Java and Python backends, REST and GraphQL integrations, and event-driven features with Redis and WebSockets.",
    skills: [
      "Java",
      "Python",
      "Node.js",
      "Spring Boot",
      "Django ORM",
      "REST APIs",
      "GraphQL",
      "JWT",
      "Redis",
      "WebSockets",
      "SQL",
    ],
    practice: [
      "Frontend-backend integration",
      "Query optimization and structured data access",
      "Real-time communication",
    ],
    related: ["enterprise", "mobile", "healthcare"],
  },
  practice: {
    name: "Engineering & Leadership",
    label: "CRAFT",
    summary: "Reliable software is also a way of working.",
    intro:
      "I combine hands-on development with testing, performance work, and frontend leadership. I have led teams of three and four developers, and worked across development, integration, and user acceptance testing environments.",
    skills: [
      "Git",
      "Postman",
      "Jest",
      "Unit testing",
      "Responsive design",
      "Performance optimization",
      "System design",
      "Team leadership",
    ],
    practice: [
      "Modular, scalable frontend architecture",
      "Testing across DEV, INT, and UAT",
      "Mentoring and stakeholder collaboration",
    ],
    related: ["healthcare", "mobile"],
  },
};

export function itemMeta(id) {
  if (projects[id])
    return {
      id,
      kind: "project",
      name: projects[id].name,
      area: projects[id].area,
      action: "Open project",
    };
  if (id.startsWith("role:")) {
    const r = roles.find((r) => r.id === id.slice(5));
    if (r)
      return {
        id,
        kind: "role",
        name: r.company,
        area: "experience",
        action: "View role",
      };
  }
  if (id.startsWith("skill:")) {
    const s = skillGroups[id.slice(6)];
    if (s)
      return {
        id,
        kind: "skill",
        name: s.name,
        area: "skills",
        action: "Explore skills",
      };
  }
  const area = areas.find((a) => a.id === id);
  if (area && id !== "studio")
    return {
      id,
      kind: id === "contact" ? "contact" : "collection",
      name: area.label,
      area: id,
      action: id === "contact" ? "Get in touch" : "Open collection",
    };
  if (id === "about")
    return {
      id,
      kind: "about",
      name: "Meet Debajyoti",
      area: "studio",
      action: "About me",
    };
  if (id === "resume")
    return {
      id,
      kind: "resume",
      name: "Résumé & Education",
      area: "contact",
      action: "Open résumé",
    };
  if (id === "light")
    return {
      id,
      kind: "action",
      name: "The studio lamp",
      area: "contact",
      action: "Change the lighting",
    };
  return {
    id: "index",
    kind: "index",
    name: "Studio index",
    area: "studio",
    action: "Explore the portfolio",
  };
}

export const areaIndex = (id) =>
  Math.max(
    0,
    areas.findIndex((a) => a.id === id),
  );
