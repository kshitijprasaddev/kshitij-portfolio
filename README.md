# Kshitij Prasad — Portfolio

A static portfolio for robotics, AI, autonomous systems, and automotive data engineering. Projects lead the page; the WebGL autonomy lab is an optional enhancement. No build step or runtime framework is required.

## Preview

Run `python3 -m http.server 4173` from this directory and open `http://localhost:4173`. ES modules require an HTTP server rather than opening `index.html` directly.

## Active source

- `index.html`: project overview, experience, background, contact, and project dialogs.
- `resume.html`: current consolidated professional profile, with print styles and links to the earlier PDF documents.
- `css/editorial.css`: responsive page, dialog, and print styles.
- `js/portfolio.js`: mobile navigation, project filters, accessible dialogs, and printing.
- `js/autonomy-scene.js`: an illustrative Three.js drone scene with cursor interaction and pause/play. It respects reduced motion, stops when offscreen or the tab is hidden, and keeps an SVG fallback when WebGL is unavailable.
- `js/vendor/three.module.min.js`: locally hosted Three.js 0.160.0, under the adjacent MIT license.
- `media/*-portfolio.webp`: optimized derivatives of the existing portfolio photographs and screenshots.
- `media/portrait.jpg`: the supplied portrait, preserved without alteration.
- `media/nouri-*.webp` and `media/scope-dashboard.webp`: screenshots of the actual prototypes using demonstration data.

The earlier scripts and stylesheet remain in the repository but are no longer loaded by the page. Their multi-canvas effects and project carousel have been replaced by the focused autonomy scene and a fully readable HTML gallery.

## Content maintenance

The current profile combines the recent robotics, data engineering, ADAS, and reinforcement learning CV information with the existing public project descriptions. Nouri and Scope lead the gallery, with details drawn from the local project documentation. Both are labeled as in-development work; Scope is described as an EXIST preparation effort, without implying funding or university endorsement. Private project sources and owner-private demo links are not published. Master’s studies are described without selecting between the differing degree abbreviations in the source CVs. The timeline uses May 2026 for Audi and October 2024 as the end of Schanzer Racing, following the recent CVs.

The existing CV and résumé PDFs are preserved and explicitly labeled as earlier documents. Edit the current HTML résumé when updating the profile. Videos load only when a visitor opens a case study and chooses to play them. The WebGL scene uses synthetic geometry and an illustrative flight path; it displays no live telemetry or claimed performance measurements.

## Verification

Run `python3 tests/validate_site.py` for internal asset/link validation, duplicate IDs, project-dialog wiring, accessible image labels, and résumé checks. Check JavaScript with `node --check js/portfolio.js` and `node --input-type=module --check < js/autonomy-scene.js`.

Browser review should cover project filters, mobile navigation, dialog keyboard focus and Escape, pause/play, the résumé, and horizontal overflow at desktop and mobile widths. Hosting stays compatible with the existing static Vercel configuration and GitHub Pages.
