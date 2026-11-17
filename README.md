# Debajyoti Maity — Beyond the Interface

A custom portfolio built around an interactive 3D “interface engine.” Its three layers connect the visual concept to Debajyoti’s frontend, backend, and systems experience.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. For the development scripts and browser checks in this repository, use:

```sh
npm run dev -- --port 5178
```

## Build and verify

```sh
npm run check
npm run build
npm run preview
npx playwright test
npm run test:a11y
```

The static production output is in `dist/`. Tests start a local server automatically when one is not running and use a single Chromium worker. If Chromium is not already installed, run `npx playwright install chromium` before testing.

## Experience

- A custom Three.js sculpture with reflective rings, an embossed monogram, and drag/keyboard rotation.
- An immersive engine view with exploded layers, inspectable frontend/backend/architecture stories, and a blueprint rendering mode.
- Dimensional project previews and accessible case-study dialogs with real project and source links.
- A 3D skills constellation, four-role experience timeline, direct contact actions, and a downloadable résumé.
- Responsive layouts, native keyboard-accessible dialogs, reduced-motion support, WebGL fallback, and rendering that stops offscreen.
- Local variable fonts, a social preview image, and a tagged PDF résumé.

## Editing

| File                                | Purpose                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| `index.html`                        | Page structure, experience, education, contact information, metadata |
| `src/main.js`                       | Project stories, skills copy, interactions, modal lifecycle          |
| `src/scene.js`                      | 3D geometry, materials, camera, animation, GPU resource lifecycle    |
| `src/style.css`                     | Main page layout and responsive design                               |
| `src/lab.css`                       | Immersive engine layout and controls                                 |
| `src/fonts.css`                     | Local font declarations                                              |
| `scripts/resume.html`               | Editable print résumé source                                         |
| `public/Debajyoti-Maity-Resume.pdf` | Downloadable résumé                                                  |
| `scripts/social-card.html`          | Social preview composition                                           |

Run `npm run resume` after editing the résumé source. With the development server on port 5178, run `node scripts/build-social-card.mjs` after changing the social preview composition. The generated files are included in production builds.

The project images are purpose-built interface concepts, labeled as such. Live application links lead to the original projects. Professional work is described using the supplied résumé; no private client screens or datasets are included.

## Stack and deployment

Vite, JavaScript, CSS, and Three.js. No backend, database, accounts, or external runtime APIs are required. Fonts and all visual assets are bundled locally. Three.js loads separately from the primary page code.

The live portfolio is public at [debajyoti-maity-dimension.stonymoth6.chatgpt.site](https://debajyoti-maity-dimension.stonymoth6.chatgpt.site).

Source is maintained in [deba-maity/freelancing-portfolio](https://github.com/deba-maity/freelancing-portfolio):

- `main` contains this 3D portfolio.
- `legacy-portfolio` preserves the previous portfolio and its original commit.

GitHub stores the source and history; Sites hosts the published portfolio. Pushing a commit to GitHub does not automatically update the live Sites deployment. Publish changes through Sites when they are ready to go live.

`.openai/hosting.json` holds the existing Sites project identity and static output configuration. Keep the project ID when publishing updates so they use the same site.

Font license notices are included in `public/fonts/`. The monogram font is a subset of the Helvetiker font bundled with Three.js and retains its original license metadata.

`src/polish.css` contains the shared material, depth, and pointer interaction details. The accessibility audit expects a running server on port 5178, or a URL supplied through `PORTFOLIO_BASE_URL`. Automated checks complement manual keyboard and visual review; they do not substitute for testing on physical devices.
