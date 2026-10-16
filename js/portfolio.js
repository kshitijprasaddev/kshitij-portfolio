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
  }
  function closeModal() {
    if (!activeModal) return;
    activeModal.querySelectorAll('video').forEach(video => video.pause());
    activeModal.classList.remove('show');
    activeModal = null;
    document.body.classList.remove('modal-open');
    pageRegions.forEach(region => { region.inert = false; });
    restoreFocus?.focus({ preventScroll: true });
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

  // Retained case studies use the original Lucide placeholders. A tiny local
  // subset avoids loading an entire icon library or a third-party script.
  const paths = {
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'external-link': '<path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6"/>',
    'book-open': '<path d="M12 6v15M3 3c5 0 7 1 9 3 2-2 4-3 9-3v15c-4 0-7 1-9 3-2-2-5-3-9-3Z"/>',
    check: '<path d="m5 12 4 4L20 5"/>'
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
    svg.innerHTML = paths[placeholder.dataset.lucide] || '<circle cx="12" cy="12" r="8"/><path d="m8 12 3 3 5-6"/>';
    placeholder.replaceWith(svg);
  });

  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());

  // The landing illustration is optional; project evidence remains normal HTML.
  const lab = document.getElementById('trajectory-view');
  if (lab) {
    const loader = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      loader.disconnect();
      import('./trajectory-view.js').catch(() => {
        // The SVG illustration remains available if the module cannot load.
      });
    }, { rootMargin: '350px' });
    loader.observe(lab);
  }
})();
