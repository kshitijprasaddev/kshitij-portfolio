/* Core content and navigation work independently of the optional WebGL scene. */
(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  function closeMenu() {
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
    navigation?.classList.remove('open');
  }
  menu?.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open', expanded);
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });

  const navLinks = [...(navigation?.querySelectorAll('a[href^="#"]') || [])];
  const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (navSections.length) {
    const navObserver = new IntersectionObserver(() => {
      const current = navSections.filter(section => section.getBoundingClientRect().top <= window.innerHeight * 0.46).at(-1);
      navLinks.forEach(link => {
        if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    navSections.forEach(section => navObserver.observe(section));
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const projects = [...document.querySelectorAll('[data-category]')];
  filters.forEach(filter => filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    filters.forEach(button => {
      button.classList.toggle('active', button === filter);
      button.setAttribute('aria-pressed', String(button === filter));
    });
    projects.forEach(project => {
      project.hidden = category !== 'all' && project.dataset.category !== category;
    });
    const count = projects.filter(project => !project.hidden).length;
    document.getElementById('filter-status').textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown.`;
    document.querySelector('.project-archive').hidden = !document.querySelector('.project-archive [data-category]:not([hidden])');
  }));

  let activeModal = null;
  let restoreFocus = null;
  const pageRegions = [...document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link')];
  const focusable = 'a[href], button:not([disabled]), input, textarea, select, video[controls], [tabindex="0"]';
  const modals = [...document.querySelectorAll('.modal')];
  modals.forEach((modal, index) => {
    const heading = modal.querySelector('h2');
    if (heading) {
      heading.id ||= `project-dialog-title-${index}`;
      modal.setAttribute('aria-labelledby', heading.id);
    }
    modal.querySelectorAll('.modal-close, .modal-backdrop').forEach(control => {
      control.addEventListener('click', closeModal);
    });
  });
  function openModal(modal, trigger) {
    if (!modal) return;
    if (!activeModal) restoreFocus = trigger;
    else {
      activeModal.classList.remove('show');
      activeModal.querySelectorAll('video').forEach(video => video.pause());
    }
    activeModal = modal;
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    pageRegions.forEach(region => { region.inert = true; });
    modal.querySelector('.modal-container').scrollTop = 0;
    modal.querySelector('.modal-close')?.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('portfolio:modal-change', { detail: { open: true } }));
  }
  function closeModal() {
    if (!activeModal) return;
    activeModal.querySelectorAll('video').forEach(video => video.pause());
    activeModal.classList.remove('show');
    activeModal = null;
    document.body.classList.remove('modal-open');
    pageRegions.forEach(region => { region.inert = false; });
    restoreFocus?.focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('portfolio:modal-change', { detail: { open: false } }));
  }
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => openModal(document.getElementById(trigger.dataset.modal), trigger));
  });
  document.addEventListener('keydown', event => {
    if (!activeModal) return;
    if (event.key === 'Escape') closeModal();
    if (event.key !== 'Tab') return;
    const controls = [...activeModal.querySelectorAll(focusable)].filter(element => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });

  // One consistent local line-icon set, with no remote script dependency.
  const paths = {
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'external-link': '<path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6"/>',
    'book-open': '<path d="M12 6v15M3 3c5 0 7 1 9 3 2-2 4-3 9-3v15c-4 0-7 1-9 3-2-2-5-3-9-3Z"/>',
    check: '<path d="m5 12 4 4L20 5"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
    brain: '<path d="M9 4a3 3 0 0 0-5 3 4 4 0 0 0-1 7 4 4 0 0 0 6 5m6-15a3 3 0 0 1 5 3 4 4 0 0 1 1 7 4 4 0 0 1-6 5M9 3v18m6-18v18M5 9h4m6 6h4M5 16h4m6-8h4"/>',
    zap: '<path d="m13 2-9 12h7l-1 8 10-13h-8l1-7Z"/>',
    'bar-chart-2': '<path d="M4 3v17h17M8 16v-5m5 5V6m5 10V9"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    filter: '<path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z"/>',
    'git-branch': '<path d="M6 6v12m0-6h7a5 5 0 0 0 5-5"/><circle cx="6" cy="3" r="3"/><circle cx="6" cy="21" r="3"/><circle cx="18" cy="4" r="3"/>',
    'hard-drive': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h18m-4 3h.01M7 17h.01"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
    'play-circle': '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M8 8a6 6 0 0 0 0 8m8-8a6 6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>'
  };
  document.querySelectorAll('[data-lucide]').forEach(placeholder => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = paths[placeholder.dataset.lucide] || paths['arrow-right'];
    placeholder.replaceWith(svg);
  });

  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

  // The landing illustration is optional; project evidence remains normal HTML.
  const lab = document.getElementById('trajectory-view');
  if (lab) {
    const loader = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      loader.disconnect();
      import('./trajectory-view.js?v=3d234caa1d').catch(() => {
        // The rendered poster remains available if the module cannot load.
      });
    }, { rootMargin: '350px' });
    loader.observe(lab);
  }
})();
