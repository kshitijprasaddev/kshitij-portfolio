# Kshitij Prasad | Portfolio

A static portfolio for robotics, automotive data engineering and software. Nouri and Scope lead a project gallery with real prototype screenshots. The dark photographic presentation uses the supplied full-resolution portrait. No build step or runtime framework is required.

## Preview

Run `python3 -m http.server 4173` from this directory and open `http://localhost:4173`. ES modules require an HTTP server.

## Active source

- `index.html`: projects, experience, background, contact and accessible case-study dialogs.
- `resume.html`: current consolidated professional profile with a light print layout and links to earlier documents.
- `css/editorial.css`: shared responsive layout, dialogs and print styles.
- `css/cinematic.css`: dark photographic presentation and landing-study layout.
- `js/portfolio.js`: navigation, project filters, modal focus handling, printing and lazy loading.
- `js/trajectory-view.js`: optional, on-demand Three.js landing geometry. Visitors can inspect approach, alignment and descent, scrub the path and rotate the view. An SVG remains available without WebGL.
- `js/vendor/three.module.min.js`: locally hosted Three.js 0.160.0, under the adjacent MIT license.
- `media/portrait.webp`: optimized website image from the new portrait; no retouching or generated alterations.
- `media/portrait-full.png`: the original full-resolution PNG, available to download.
- `media/*-portfolio.webp`, `media/nouri-*.webp`, `media/scope-dashboard.webp`: optimized project photos and actual prototype screens using demonstration data.

Earlier scripts and styles remain in the repository for reference but are no longer loaded. The active page uses normal HTML for its gallery and project evidence.

## Content maintenance

The current profile combines recent CV information with project documentation and the bachelor’s thesis. The UAV result is explicitly scoped to Gazebo/PX4 SITL with one training seed and 100 evaluation episodes. Pixhawk hardware integration is separate; physical policy transfer remains future work. The landing illustration uses synthetic geometry and shows no recorded telemetry or measured performance.

Nouri is in development. Scope is a working insurance-renewal prototype in EXIST preparation; no funding award, customer outcome or university endorsement is implied. PAVE is a fleet-planning demonstrator with simulated demand and an optional PPO backend. Private source repositories and owner-only demo links are not published. Audi descriptions focus on the actual data-processing and scenario-retrieval contribution.

Master’s studies are described without choosing between degree abbreviations that differ across the source CVs. The timeline follows the recent CVs: May 2026 for Audi and October 2024 as the end of Schanzer Racing.

The earlier CV PDFs remain explicitly labeled as earlier documents. Update `resume.html` for the current profile. Video files load only when a visitor opens a case study and chooses to play them.

## Verification

Run `python3 tests/validate_site.py` for internal assets, links, unique IDs, project-dialog wiring and accessible media. Check JavaScript with `node --check js/portfolio.js` and `node --input-type=module --check < js/trajectory-view.js`.

Browser review should cover filters, mobile navigation, dialog focus and Escape, landing controls, the résumé and horizontal overflow on desktop and mobile. The site retains the existing static Vercel and GitHub Pages hosting configuration.
