/* Optional motion. Navigation and project evidence remain usable without it. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const body = document.body;
  const entrances = [];
  function syncMotion() {
    body.classList.toggle('reduced-effects', reducedMotion.matches);
    if (reducedMotion.matches) entrances.forEach(animation => animation.finish());
  }
  syncMotion();
  reducedMotion.addEventListener('change', syncMotion);

  // Only scroll events request a frame; there is no permanent animation loop.
  let scrollFrame = 0;
  function paintProgress() {
    scrollFrame = 0;
    const height = document.documentElement.scrollHeight - innerHeight;
    body.style.setProperty('--scroll-progress', String(height > 0 ? Math.max(0, Math.min(1, scrollY / height)) : 0));
  }
  function queueProgress() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(paintProgress);
  }
  addEventListener('scroll', queueProgress, { passive: true });
  addEventListener('resize', queueProgress, { passive: true });
  addEventListener('pageshow', queueProgress);
  new ResizeObserver(queueProgress).observe(body);
  paintProgress();

  // Register the observer before enabling any hidden entrance state.
  const reveals = [...document.querySelectorAll('.section-heading, .work-card, .timeline-entry, .about-copy, .recognition-copy, .stack-grid > div')];
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
    addEventListener('pageshow', revealVisible);
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

  // A grazing reflection follows a mouse locally, without tilting the content.
  document.querySelectorAll('.hero, .project-image, .trajectory-view').forEach(surface => {
    let frame = 0, x = 50, y = 50;
    function paintLight() {
      frame = 0;
      surface.style.setProperty('--pointer-x', `${x.toFixed(1)}%`);
      surface.style.setProperty('--pointer-y', `${y.toFixed(1)}%`);
    }
    surface.addEventListener('pointermove', event => {
      if (!precisePointer.matches || reducedMotion.matches) return;
      const rect = surface.getBoundingClientRect();
      x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
      y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
      if (!frame) frame = requestAnimationFrame(paintLight);
    }, { passive: true });
    surface.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame); frame = 0;
      surface.style.removeProperty('--pointer-x');
      surface.style.removeProperty('--pointer-y');
    });
  });
})();
