/* Optional motion. Navigation and project evidence remain usable without it. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const stackedStory = matchMedia('(max-width: 760px)');
  const body = document.body;
  const entrances = [];
  const pausedEntrances = new Set();
  const springStates = [];
  const activeSprings = new Set();
  const lightSurfaces = [];
  let springFrame = 0, springTime = 0, scrollFrame = 0, pageSuspended = false, story = null;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const motionVisible = () => !document.hidden && !pageSuspended;

  function syncMotion() {
    body.classList.toggle('reduced-effects', reducedMotion.matches);
    if (reducedMotion.matches) {
      entrances.forEach(animation => animation.finish());
      pausedEntrances.clear();
      cancelAnimationFrame(springFrame); springFrame = 0; springTime = 0;
      activeSprings.clear();
      springStates.forEach(state => {
        state.position = state.target = 1; state.velocity = 0;
        state.element.style.setProperty('--spring-scale', '1');
      });
      clearLights();
    } else {
      springStates.forEach(updateSpringTarget);
    }
    queueProgress();
  }
  reducedMotion.addEventListener('change', syncMotion);

  // Only input, scrolling and finite spring settling request animation frames.
  function paintProgress() {
    scrollFrame = 0;
    if (!motionVisible()) return;
    const height = document.documentElement.scrollHeight - innerHeight;
    body.style.setProperty('--scroll-progress', String(height > 0 ? clamp(scrollY / height) : 0));
    paintStory();
  }
  function queueProgress() {
    if (!scrollFrame && motionVisible()) scrollFrame = requestAnimationFrame(paintProgress);
  }
  addEventListener('scroll', queueProgress, { passive: true });
  addEventListener('resize', queueProgress, { passive: true });
  new ResizeObserver(queueProgress).observe(body);

  // Register the observer before enabling any hidden entrance state.
  const reveals = [...document.querySelectorAll('.section-heading, .work-card, .timeline-entry, .about-copy, .recognition-copy, .stack-grid > div, .engineering-card')];
  function reveal(element) { element.classList.add('is-revealed'); }
  function revealVisible() {
    reveals.forEach(element => {
      if (element.getBoundingClientRect().top < innerHeight - 24) reveal(element);
    });
  }
  try {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0.02 });
    reveals.forEach(element => {
      element.dataset.reveal = '';
      observer.observe(element);
    });
    revealVisible();
    body.classList.add('motion-ready');
    // Keyboard users never land on an invisible control while tabbing ahead.
    document.addEventListener('focusin', event => {
      const region = event.target.closest('[data-reveal]');
      if (region) reveal(region);
    });
    document.querySelectorAll('[data-filter]').forEach(filter => filter.addEventListener('click', revealVisible));
  } catch {
    body.classList.remove('motion-ready');
  }

  // The photograph settles once. It never moves with scrolling or the pointer.
  if (!reducedMotion.matches && Element.prototype.animate) {
    [document.querySelector('.hero-heading'), document.querySelector('.hero-copy')].filter(Boolean).forEach((element, index) => {
      entrances.push(element.animate([
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'none' }
      ], { duration: 900, delay: index * 100, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    });
    const portrait = document.querySelector('.hero-portrait img');
    if (portrait) entrances.push(portrait.animate([
      { opacity: 0.7, transform: 'scale(1.025)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 1400, easing: 'cubic-bezier(.22,1,.36,1)' }));
  }

  // Integrate a damped spring, retaining velocity when a gesture is interrupted.
  // Mass = 1; substeps keep the same physical response on slower displays.
  const stiffness = 380, damping = 25;
  function queueSpring() {
    if (!springFrame && activeSprings.size && motionVisible() && !reducedMotion.matches) {
      springFrame = requestAnimationFrame(paintSprings);
    }
  }
  function updateSpringTarget(state) {
    const disabled = state.element.disabled || state.element.getAttribute('aria-disabled') === 'true';
    state.target = disabled || reducedMotion.matches ? 1 : state.pointer !== null || state.key !== null ? 0.97 : state.hover ? state.hoverScale : 1;
    if (reducedMotion.matches) {
      state.position = 1; state.velocity = 0;
      state.element.style.setProperty('--spring-scale', '1');
      return;
    }
    if (Math.abs(state.position - state.target) > 0.0001 || Math.abs(state.velocity) > 0.001) {
      activeSprings.add(state);
      queueSpring();
    }
  }
  function paintSprings(now) {
    springFrame = 0;
    if (!motionVisible() || reducedMotion.matches) { springTime = 0; return; }
    const delta = springTime ? Math.min((now - springTime) / 1000, 0.04) : 1 / 60;
    springTime = now;
    activeSprings.forEach(state => {
      let remaining = delta;
      while (remaining > 0) {
        const step = Math.min(remaining, 1 / 120);
        const acceleration = stiffness * (state.target - state.position) - damping * state.velocity;
        state.velocity += acceleration * step;
        state.position += state.velocity * step;
        remaining -= step;
      }
      if (Math.abs(state.position - state.target) < 0.0001 && Math.abs(state.velocity) < 0.001) {
        state.position = state.target; state.velocity = 0;
        activeSprings.delete(state);
      }
      state.element.style.setProperty('--spring-scale', state.position.toFixed(5));
    });
    if (!activeSprings.size) springTime = 0;
    queueSpring();
  }
  function releasePointer(event) {
    springStates.forEach(state => {
      if (state.pointer !== event.pointerId) return;
      state.pointer = null;
      updateSpringTarget(state);
    });
  }
  const springSelector = '.btn, .nav-cv, .filter, .project-image, .modal-close, .trajectory-toolbar button, .engineering-card .text-link';
  document.querySelectorAll(springSelector).forEach(element => {
    const state = { element, position: 1, velocity: 0, target: 1, hoverScale: element.classList.contains('project-image') ? 1.015 : 1.02, hover: false, pointer: null, key: null };
    springStates.push(state);
    element.classList.add('spring-surface');
    element.addEventListener('pointerenter', event => {
      state.hover = precisePointer.matches && event.pointerType !== 'touch';
      updateSpringTarget(state);
    }, { passive: true });
    element.addEventListener('pointerleave', () => {
      state.hover = false; state.pointer = null;
      updateSpringTarget(state);
    }, { passive: true });
    element.addEventListener('pointerdown', event => {
      if (event.button !== 0 || element.disabled || element.getAttribute('aria-disabled') === 'true') return;
      if (event.pointerType === 'touch') state.hover = false;
      state.pointer = event.pointerId;
      updateSpringTarget(state);
    }, { passive: true });
    element.addEventListener('keydown', event => {
      const spaceActivates = element.matches('button, [role="button"]');
      if (event.defaultPrevented || event.repeat || (event.key !== 'Enter' && !(event.key === ' ' && spaceActivates))) return;
      state.key = event.key;
      updateSpringTarget(state);
    });
    element.addEventListener('keyup', event => {
      if (state.key !== event.key) return;
      state.key = null;
      updateSpringTarget(state);
    });
    element.addEventListener('blur', () => {
      state.key = null; state.pointer = null;
      updateSpringTarget(state);
    });
  });
  document.addEventListener('pointerup', releasePointer, { passive: true });
  document.addEventListener('pointercancel', releasePointer, { passive: true });
  function clearInteractions() {
    springStates.forEach(state => {
      state.hover = false; state.pointer = null; state.key = null;
      updateSpringTarget(state);
    });
  }
  addEventListener('blur', clearInteractions);
  precisePointer.addEventListener('change', () => {
    springStates.forEach(state => { state.hover = false; updateSpringTarget(state); });
    clearLights();
  });

  // Native document scrolling selects a chapter; no scroll capture or live region.
  function setStoryActive(index) {
    if (!story || story.active === index) return;
    story.active = index;
    story.section.dataset.activeStory = String(index);
    story.steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
    story.visuals.forEach((visual, visualIndex) => {
      const active = visualIndex === index;
      visual.classList.toggle('is-active', active);
      visual.setAttribute('aria-hidden', String(!active));
    });
  }
  function paintStory() {
    if (!story) return;
    // On a stacked layout the readable chapter sits below the pinned visual.
    const line = innerHeight * (stackedStory.matches ? 0.68 : 0.45);
    const bounds = story.steps.map(step => step.getBoundingClientRect());
    let index = 0;
    bounds.forEach((rect, stepIndex) => { if (rect.top <= line) index = stepIndex; });
    setStoryActive(index);
    const distance = bounds.at(-1).top - bounds[0].top;
    const progress = distance > 0 ? clamp((line - bounds[0].top) / distance) : 0;
    if (Math.abs(progress - story.progress) > 0.001) {
      story.progress = progress;
      story.section.style.setProperty('--story-progress', progress.toFixed(4));
      story.stepsContainer?.style.setProperty('--story-progress', progress.toFixed(4));
    }
  }
  const storySection = document.getElementById('engineering-story');
  if (storySection) {
    const steps = [...storySection.querySelectorAll('.story-step[data-story-step]')].sort((a, b) => Number(a.dataset.storyStep) - Number(b.dataset.storyStep));
    const visuals = steps.map(step => storySection.querySelector(`.story-visual[data-story-visual="${step.dataset.storyStep}"]`));
    if (steps.length >= 2 && visuals.every(Boolean)) {
      story = { section: storySection, steps, visuals, stepsContainer: storySection.querySelector('.story-steps'), active: -1, progress: -1 };
      paintStory();
      storySection.classList.add('story-ready');
      storySection.addEventListener('focusin', event => {
        const index = steps.indexOf(event.target.closest('.story-step'));
        if (index >= 0) setStoryActive(index);
      });
    }
  }

  // A grazing reflection follows a mouse locally, without tilting the content.
  function resetLight(surface) {
    cancelAnimationFrame(surface.frame); surface.frame = 0;
    surface.element.style.removeProperty('--pointer-x');
    surface.element.style.removeProperty('--pointer-y');
  }
  function clearLights() { lightSurfaces.forEach(resetLight); }
  document.querySelectorAll('.hero, .project-image, .trajectory-view').forEach(element => {
    const surface = { element, frame: 0, x: 50, y: 50 };
    lightSurfaces.push(surface);
    function paintLight() {
      surface.frame = 0;
      if (!motionVisible() || reducedMotion.matches || !precisePointer.matches) return;
      element.style.setProperty('--pointer-x', `${surface.x.toFixed(1)}%`);
      element.style.setProperty('--pointer-y', `${surface.y.toFixed(1)}%`);
    }
    element.addEventListener('pointermove', event => {
      if (!precisePointer.matches || reducedMotion.matches || event.pointerType === 'touch' || !motionVisible()) return;
      const rect = element.getBoundingClientRect();
      surface.x = clamp((event.clientX - rect.left) / rect.width) * 100;
      surface.y = clamp((event.clientY - rect.top) / rect.height) * 100;
      if (!surface.frame) surface.frame = requestAnimationFrame(paintLight);
    }, { passive: true });
    element.addEventListener('pointerleave', () => resetLight(surface), { passive: true });
  });

  function suspendMotion() {
    cancelAnimationFrame(springFrame); springFrame = 0; springTime = 0;
    cancelAnimationFrame(scrollFrame); scrollFrame = 0;
    clearLights();
    entrances.forEach(animation => {
      if (animation.playState !== 'running') return;
      animation.pause(); pausedEntrances.add(animation);
    });
  }
  function resumeMotion() {
    if (!motionVisible()) return;
    if (!reducedMotion.matches) pausedEntrances.forEach(animation => animation.play());
    pausedEntrances.clear();
    queueSpring(); queueProgress(); revealVisible();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInteractions(); suspendMotion();
    } else resumeMotion();
  });
  addEventListener('pagehide', () => { pageSuspended = true; clearInteractions(); suspendMotion(); });
  addEventListener('pageshow', () => { pageSuspended = false; resumeMotion(); });
  syncMotion();
  paintProgress();
  if (!motionVisible()) suspendMotion();
})();
