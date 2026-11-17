# Debajyoti Maity — A World of Work

A navigable architectural studio built in Three.js. The portfolio lives inside a continuous 3D environment: physical project exhibits, an extruded monogram, a career staircase, glass data towers, and a contact workbench. Scrolling moves the camera between six views; dragging orbits the entire space.

## Start here

**Do not open `index.html` directly.** This is a Vite application and needs its development server to load modules and assets.

On Windows, double-click **`start-portfolio.cmd`**. It installs dependencies if needed, starts Vite, and opens the browser. Keep that terminal window running.

Or open a terminal in this folder:

```sh
npm ci
npm run dev -- --port 5178 --open
```

Open the Local URL printed by Vite, normally **http://localhost:5178**. On subsequent runs, only the second command is needed. Requires Node.js 20.19+ or 22.12+.

## Explore

- Scroll, use the chapter navigation, or press Left/Right to travel between exhibits.
- Drag to orbit. On phones, swipe vertically to travel or horizontally to look around.
- Click an exhibit to approach it; click it again to open the project story.
- Pull apart the Angular exhibit's physical interface layers.
- Switch between daylight and evening lighting.
- Pause ambient movement, or use the operating system's reduced-motion preference.
- Open Index for direct navigation, experience, skills, education, résumé, and contact information.

The 3D scene is procedural geometry with live materials, shadows, lighting, and camera movement. The image poster is a fallback for unavailable WebGL. All project and contact information remains usable without the renderer. Scene rendering pauses when the document is hidden or a details dialog is open.

## Build and verify

```sh
npm run check
npm run build
npm run preview
npx playwright test
npm run test:a11y
```

The production output is `dist/`. Browser tests start the development server automatically if needed. Run `npx playwright install chromium` if the browser is missing. The accessibility audit expects a running server at port 5178 or the URL in `PORTFOLIO_BASE_URL`.

## Editing

| File                                | Purpose                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `index.html`                        | Chapter copy, navigation, contact links, and metadata                   |
| `src/studio.js`                     | Career and project content, navigation, dialogs, and controls           |
| `src/studio-scene.js`               | Architecture, exhibits, lighting, camera paths, and rendering lifecycle |
| `src/exhibit-textures.js`           | Procedural interface studies and physical exhibit labels                |
| `src/studio.css`                    | Responsive layout, typography, controls, and dialogs                    |
| `src/fonts.css`                     | Local font declarations                                                 |
| `scripts/resume.html`               | Editable résumé source                                                  |
| `public/Debajyoti-Maity-Resume.pdf` | Downloadable résumé                                                     |

Run `npm run resume` after editing the résumé source. With the development server running, `npm run social` exports the actual rendered studio as the fallback poster and social preview. The generated assets are included in production builds.

The exhibit screens are illustrative interface studies, identified in the project details. Live links open the original applications. Professional project descriptions use the supplied résumé; no internal screens, patient data, or proprietary client code are included.

## Hosting and history

Live: [debajyoti-maity-dimension.stonymoth6.chatgpt.site](https://debajyoti-maity-dimension.stonymoth6.chatgpt.site)

Source: [deba-maity/freelancing-portfolio](https://github.com/deba-maity/freelancing-portfolio)

- `main`: the architectural studio.
- `first-3d-portfolio`: the earlier orbital-sculpture design.
- `legacy-portfolio`: the original portfolio.

GitHub stores the source and history. Sites hosts the public website. GitHub pushes do not automatically update the live site; publish updates through Sites. Keep the existing project ID in `.openai/hosting.json`.

The stack is Vite, JavaScript, CSS, and Three.js. No backend, account, database, or external runtime service is required. Fonts and visual assets are local. Font licenses are included in `public/fonts/`; the monogram font retains the Helvetiker license metadata.
