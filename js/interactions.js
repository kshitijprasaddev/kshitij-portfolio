/**
 * Advanced Interactions — Layered Storytelling & Progressive Disclosure
 * Portal transitions, deep-dive expansions, cursor effects, skill physics
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     1. RIPPLE PORTAL TRANSITION ON NAV CLICK
     ═══════════════════════════════════════════════════ */
  const rippleCanvas = document.createElement('canvas');
  rippleCanvas.id = 'ripple-canvas';
  document.body.appendChild(rippleCanvas);
  const rCtx = rippleCanvas.getContext('2d');
  let rippleAnim = null;

  function sizeRippleCanvas() {
    rippleCanvas.width = window.innerWidth;
    rippleCanvas.height = window.innerHeight;
  }
  sizeRippleCanvas();
  window.addEventListener('resize', sizeRippleCanvas);

  function triggerRipple(x, y, cb) {
    if (rippleAnim) cancelAnimationFrame(rippleAnim);
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const duration = 700;
    const start = performance.now();
    rippleCanvas.style.opacity = '1';

    (function draw(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const r = ease * maxR;
      const alpha = 1 - t;

      rCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
      rCtx.beginPath();
      rCtx.arc(x, y, r, 0, Math.PI * 2);
      rCtx.strokeStyle = `rgba(132, 204, 22, ${alpha * 0.5})`;
      rCtx.lineWidth = 3 + (1 - t) * 8;
      rCtx.stroke();

      // Inner glow ring
      rCtx.beginPath();
      rCtx.arc(x, y, r * 0.85, 0, Math.PI * 2);
      rCtx.strokeStyle = `rgba(132, 204, 22, ${alpha * 0.15})`;
      rCtx.lineWidth = 1;
      rCtx.stroke();

      if (t < 1) {
        rippleAnim = requestAnimationFrame(draw);
      } else {
        rCtx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
        rippleCanvas.style.opacity = '0';
        rippleAnim = null;
        if (cb) cb();
      }
    })(start);
  }

  // Attach ripple to nav links
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const rect = link.getBoundingClientRect();
      triggerRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  });

  /* ═══════════════════════════════════════════════════
     2. DEEP-DIVE PROJECT CARD EXPANSION
     Full-screen morph when clicking a project card
     ═══════════════════════════════════════════════════ */
  const deepDiveOverlay = document.createElement('div');
  deepDiveOverlay.className = 'deep-dive-overlay';
  document.body.appendChild(deepDiveOverlay);

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      // The existing modal system handles the content;
      // we add a visual "morph" effect on top

      const rect = card.getBoundingClientRect();
      const clone = card.cloneNode(true);
      clone.className = 'deep-dive-clone';
      clone.style.cssText = [
        'position:fixed',
        'top:' + rect.top + 'px',
        'left:' + rect.left + 'px',
        'width:' + rect.width + 'px',
        'height:' + rect.height + 'px',
        'z-index:9998',
        'pointer-events:none',
        'transition: all 0.55s cubic-bezier(0.4,0,0,1)',
        'border-radius:14px',
        'overflow:hidden'
      ].join(';');

      document.body.appendChild(clone);

      // Trigger reflow then animate
      clone.offsetHeight;
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = '100vw';
      clone.style.height = '100vh';
      clone.style.borderRadius = '0';
      clone.style.opacity = '0';

      // Blur background
      deepDiveOverlay.classList.add('active');

      setTimeout(function () {
        if (clone.parentNode) clone.parentNode.removeChild(clone);
      }, 600);
    });
  });

  // Remove overlay when modal closes
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const target = m.target;
        if (target.classList.contains('modal') && !target.classList.contains('show')) {
          deepDiveOverlay.classList.remove('active');
        }
      }
    });
  });
  document.querySelectorAll('.modal').forEach(function (modal) {
    observer.observe(modal, { attributes: true });
  });

  /* ═══════════════════════════════════════════════════
     3. EXPERIENCE TIMELINE — PROGRESSIVE DISCLOSURE
     Click an entry → dramatic expand with layered reveal
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll('.st-entry').forEach(function (entry) {
    const body = entry.querySelector('.st-body');
    if (!body) return;

    // Wrap body list items for staggered reveal
    const items = body.querySelectorAll('.st-highlights li, .st-chips span');
    items.forEach(function (item, i) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(12px)';
      item.style.transition = 'opacity 0.35s ease ' + (i * 0.06) + 's, transform 0.35s ease ' + (i * 0.06) + 's';
    });

    // Observe open class
    const entryObserver = new MutationObserver(function () {
      if (entry.classList.contains('st-entry--open')) {
        items.forEach(function (item) {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        });
      } else {
        items.forEach(function (item) {
          item.style.opacity = '0';
          item.style.transform = 'translateY(12px)';
        });
      }
    });
    entryObserver.observe(entry, { attributes: true, attributeFilter: ['class'] });
  });

  /* ═══════════════════════════════════════════════════
     4. MAGNETIC CURSOR + TRAIL
     ═══════════════════════════════════════════════════ */
  const isMobile = window.matchMedia('(pointer: coarse)').matches;

  if (!isMobile) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    cursor.appendChild(cursorDot);
    cursor.appendChild(cursorRing);
    document.body.appendChild(cursor);

    let cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    (function moveCursor() {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cursorDot.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      cursorRing.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(moveCursor);
    })();

    // Hover scaling on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .st-head, .tech-icon, .skill-chip');
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorRing.classList.add('cursor-hover');
        cursorDot.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        cursorRing.classList.remove('cursor-hover');
        cursorDot.classList.remove('cursor-hover');
      });
    });

    // Magnetic pull on buttons
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const rect = btn.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (mx * 0.25) + 'px,' + (my * 0.25) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     5. SKILL CHIPS — HOVER GLOW + FLOAT
     ═══════════════════════════════════════════════════ */
  document.querySelectorAll('.skill-chip').forEach(function (chip, i) {
    // Subtle float offset per chip
    const delay = (i * 0.3) % 5;
    chip.style.animationDelay = delay + 's';
    chip.classList.add('skill-float');
  });

  /* ═══════════════════════════════════════════════════
     6. SCROLL-TRIGGERED SECTION ZOOM REVEAL
     Sections scale up from 0.92 → 1 as they enter viewport
     ═══════════════════════════════════════════════════ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Section zoom-in on scroll
    gsap.utils.toArray('.section').forEach(function (section) {
      gsap.fromTo(section, {
        scale: 0.94,
        opacity: 0.4,
        y: 60
      }, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 92%',
          end: 'top 40%',
          scrub: 0.5
        }
      });
    });

    // Featured achievement parallax layers
    const achieveGallery = document.querySelector('.achievement-gallery');
    if (achieveGallery) {
      gsap.from('.gallery-main', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: achieveGallery,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
      gsap.from('.gallery-side .gallery-image', {
        x: 80,
        opacity: 0,
        stagger: 0.2,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: achieveGallery,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });
    }

    // Project cards — staggered 3D rotate in
    gsap.utils.toArray('.project-card').forEach(function (card, i) {
      gsap.fromTo(card, {
        rotationY: -8,
        opacity: 0,
        x: i % 2 === 0 ? -40 : 40
      }, {
        rotationY: 0,
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Contact cards — slide in from different directions
    gsap.utils.toArray('.contact-card').forEach(function (card, i) {
      const direction = i % 2 === 0 ? -60 : 60;
      gsap.fromTo(card, { x: direction, opacity: 0, scale: 0.9 }, {
        x: 0, opacity: 1, scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Skill groups — cascade reveal
    gsap.utils.toArray('.skill-group').forEach(function (group, i) {
      gsap.fromTo(group, {
        y: 40,
        opacity: 0,
        scale: 0.95
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: group,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Hero title — dramatic split entrance
    const heroWords = document.querySelectorAll('.hero-title .word');
    heroWords.forEach(function (word, i) {
      gsap.fromTo(word, {
        y: 80,
        opacity: 0,
        rotationX: -20
      }, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        duration: 1,
        delay: 1.6 + i * 0.15,
        ease: 'power4.out'
      });
    });

    // Hero subtitle + description stagger
    gsap.fromTo('.hero-subtitle', {
      y: 30, opacity: 0
    }, {
      y: 0, opacity: 1,
      duration: 0.8,
      delay: 2.2,
      ease: 'power3.out'
    });

    gsap.fromTo('.hero-description', {
      y: 30, opacity: 0
    }, {
      y: 0, opacity: 1,
      duration: 0.8,
      delay: 2.4,
      ease: 'power3.out'
    });

    gsap.fromTo('.hero-cta', {
      y: 30, opacity: 0
    }, {
      y: 0, opacity: 1,
      duration: 0.8,
      delay: 2.6,
      ease: 'power3.out'
    });

    gsap.fromTo('.hero-stats', {
      y: 30, opacity: 0
    }, {
      y: 0, opacity: 1,
      duration: 0.8,
      delay: 2.8,
      ease: 'power3.out'
    });

    // Hero image wrapper scale-in
    gsap.fromTo('.hero-image-wrapper', {
      scale: 0.7,
      opacity: 0,
      rotationY: 15
    }, {
      scale: 1,
      opacity: 1,
      rotationY: 0,
      duration: 1.2,
      delay: 1.8,
      ease: 'power4.out'
    });
  }

  /* ═══════════════════════════════════════════════════
     7. TEXT SCRAMBLE EFFECT ON SECTION EYEBROWS
     Letters scramble briefly before resolving
     ═══════════════════════════════════════════════════ */
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';

  function scrambleText(el) {
    const original = el.textContent;
    const len = original.length;
    let iteration = 0;

    const interval = setInterval(function () {
      el.textContent = original.split('').map(function (char, i) {
        if (i < iteration) return original[i];
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }).join('');

      if (iteration >= len) clearInterval(interval);
      iteration += 1 / 2;
    }, 30);
  }

  const eyebrowObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        scrambleText(entry.target);
        eyebrowObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-eyebrow').forEach(function (el) {
    eyebrowObserver.observe(el);
  });

  /* ═══════════════════════════════════════════════════
     8. PARALLAX TILT ON GLASS CARDS (mouse hover)
     ═══════════════════════════════════════════════════ */
  if (!isMobile) {
    document.querySelectorAll('.glass-card, .featured-project').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) scale(1.01)';
        card.style.transition = 'transform 0.1s ease';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     9. PRELOADER ENHANCEMENT — count + reveal
     ═══════════════════════════════════════════════════ */
  const preloaderText = document.querySelector('.preloader-text');
  if (preloaderText) {
    let percent = 0;
    const countUp = setInterval(function () {
      percent += Math.floor(Math.random() * 8) + 2;
      if (percent > 100) percent = 100;
      preloaderText.textContent = percent + '%';
      if (percent >= 100) {
        clearInterval(countUp);
        preloaderText.textContent = 'Ready';
      }
    }, 50);
  }

})();
