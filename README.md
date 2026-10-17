# Kshitij Prasad | Portfolio

A static portfolio for robotics, automotive data engineering and software. Nouri and Scope lead a project gallery with real prototype screenshots. The dark photographic presentation uses the supplied full-resolution portrait. No build step or runtime framework is required.

## Preview

Run `python3 -m http.server 4173` from this directory and open `http://localhost:4173`. ES modules require an HTTP server.

## Active source

- `index.html`: projects, experience, background, contact and accessible case-study dialogs.
- `resume.html`: current consolidated professional profile with a light print layout and links to earlier documents.
- `css/editorial.css`: shared responsive layout, dialogs and print styles.
- `css/cinematic.css`: dark photographic presentation and landing-study layout.
- `css/experience.css` and `js/experience.js`: local light reflections, tactile controls, one-time entrances and reduced-motion handling. Pointer lighting only runs on precise pointers; normal page scrolling stays native.
- `css/studio.css`: geometric sans typography, floating project cards, evidence bento grid, sticky product showcase and multi-column footer. Button and card scale feedback comes from interruptible damped springs; the loop stops when settled.
- `js/portfolio.js`: navigation, project filters, modal focus handling, printing and lazy loading.
- `js/trajectory-view.js`: a cinematic Three.js quadrotor approach and moving-platform landing scenario. Pause, replay, timeline scrubbing and three camera views support inspection; a matching rendered poster remains available without WebGL. Playback pauses offscreen and in background tabs, and starts paused for reduced-motion preferences.
- `js/vendor/three.module.min.js`: locally hosted Three.js 0.160.0, under the adjacent MIT license.
- `css/fonts.css` and `media/fonts/`: locally hosted DM Sans and Instrument Serif with original OFL licenses.
- `media/brand-mark.svg`: a vector wordmark matching the site typography and favicon.
- `media/flight-study-poster.jpg`: a rendered frame of the Three.js scene for the static fallback.
- `media/uav-simulation.webp`: actual Gazebo viewport from the thesis, distinct from the illustrative scene.
- `media/campus-help.webp`: the public prototype interface.
- `media/portrait.webp`: optimized website image from the new portrait; no retouching or generated alterations.
- `media/portrait-full.png`: the original full-resolution PNG, available to download.
- `media/*-portfolio.webp`, `media/nouri-*.webp`, `media/scope-dashboard.webp`: optimized project photos and actual prototype screens using demonstration data.

Earlier scripts and styles remain in the repository for reference but are no longer loaded. The active page uses normal HTML for its gallery and project evidence.

## Content maintenance

The current profile combines recent CV information with project documentation and the bachelor’s thesis. The UAV result is explicitly scoped to Gazebo/PX4 SITL with one training seed and 100 evaluation episodes. Pixhawk hardware integration is separate; physical policy transfer remains future work. The flight scene uses an illustrative trajectory and model, with readouts calculated from the scene. It is presented separately from the recorded Gazebo/PX4 simulation and measured performance in the research case study.

Nouri is in development. Scope is a working insurance-renewal prototype in EXIST preparation; no funding award, customer outcome or university endorsement is implied. PAVE is a fleet-planning demonstrator with simulated demand and an optional PPO backend. Private source repositories and owner-only demo links are not published. Audi descriptions focus on the actual data-processing and scenario-retrieval contribution.

Project cards lead with the product and contribution, without repetitive development-status badges. The Nouri case study retains its current stage and sample-data note. No user counts are claimed. The evidence grid reports eleven projects, three benchmarked RL algorithms, one hundred PPO simulation evaluation episodes and the verified first-place PAVE award.

Current master’s studies appear once, in the résumé’s Education section. The homepage and profile introduction emphasize professional work and completed qualifications. The timeline follows the recent CVs: May 2026 for Audi and October 2024 as the end of Schanzer Racing.

The earlier CV PDFs remain in a collapsed earlier-documents section, below current project and thesis links. Update `resume.html` for the current profile. Video files load only when a visitor opens a case study and chooses to play them.

## Verification

Run `python3 tests/validate_site.py` for internal assets, links, unique IDs, project-dialog wiring and accessible media. Check JavaScript with `node --check js/portfolio.js` and `node --input-type=module --check < js/trajectory-view.js`.

Browser review should cover filters, mobile navigation, dialog focus and Escape, landing playback/scrubbing/camera controls, the résumé, portrait framing and horizontal overflow on desktop and mobile. Camera changes ease between views even while flight playback is paused, then stop rendering.

Local CSS and module URLs carry content revisions so a new deployment does not reuse an outdated presentation from the browser cache. Run `python3 scripts/version_assets.py` after editing styles or modules and commit the updated HTML and loader together.

## Deployment

The public production site is https://kshitijprasad.vercel.app/. Vercel deploys `main` to Production; pushes to other branches create Preview deployments. A successful preview does not update the public site. Merge a verified change into `main`, wait for the Production deployment to succeed, and check the public homepage and résumé. The repository homepage alias redirects to the canonical production address.
