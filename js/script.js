/**
 * Kshitij Prasad - Portfolio
 * Professional JavaScript with GSAP Animations + Three.js WebGL
 */

// ===== Three.js Particle Field =====
(function initWebGL() {
  const canvas = document.getElementById('webgl-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle system
  const PARTICLE_COUNT = 1200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const spread = 50;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    velocities[i * 3] = (Math.random() - 0.5) * 0.01;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    sizes[i] = Math.random() * 2 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(0x84cc16) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      uniform vec2 uMouse;
      varying float vAlpha;
      varying float vDist;

      void main() {
        vec3 pos = position;

        // Gentle wave motion
        pos.x += sin(uTime * 0.3 + position.y * 0.5) * 0.5;
        pos.y += cos(uTime * 0.2 + position.x * 0.3) * 0.5;
        pos.z += sin(uTime * 0.15 + position.x * 0.2 + position.y * 0.3) * 0.3;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

        // Mouse repulsion in screen space
        vec4 projected = projectionMatrix * mvPosition;
        vec2 screenPos = projected.xy / projected.w;
        float dist = distance(screenPos, uMouse);
        vDist = dist;

        // Push particles away from cursor
        if (dist < 0.3) {
          vec2 dir = normalize(screenPos - uMouse);
          float force = (0.3 - dist) * 3.0;
          mvPosition.xy += dir * force;
        }

        vAlpha = smoothstep(50.0, 5.0, -mvPosition.z) * 0.8;

        gl_PointSize = size * (15.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      varying float vDist;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;

        float glow = smoothstep(0.5, 0.0, d);
        float brightness = vDist < 0.3 ? 1.5 : 1.0;

        gl_FragColor = vec4(uColor * brightness, glow * vAlpha * 0.7);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Connecting lines between nearby particles
  const lineGeometry = new THREE.BufferGeometry();
  const MAX_LINES = 3000;
  const linePositions = new Float32Array(MAX_LINES * 6);
  const lineColors = new Float32Array(MAX_LINES * 6);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Mouse tracking
  const mouse = { x: 0, y: 0 };
  let mouseNDC = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Scroll-based camera parallax
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

  // Render loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;
    material.uniforms.uMouse.value.set(mouseNDC.x, mouseNDC.y);

    // Gentle rotation
    particles.rotation.y = elapsed * 0.03;
    particles.rotation.x = Math.sin(elapsed * 0.02) * 0.1;

    // Scroll parallax — move camera on Y
    camera.position.y = -scrollY * 0.005;

    // Update connecting lines
    const posArr = geometry.attributes.position.array;
    let lineIdx = 0;
    const CONNECT_DIST = 4.5;
    const green = new THREE.Color(0x84cc16);

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_LINES; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < MAX_LINES; j++) {
        const dx = posArr[i*3] - posArr[j*3];
        const dy = posArr[i*3+1] - posArr[j*3+1];
        const dz = posArr[i*3+2] - posArr[j*3+2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < CONNECT_DIST) {
          const alpha = 1 - dist / CONNECT_DIST;
          linePositions[lineIdx*6] = posArr[i*3];
          linePositions[lineIdx*6+1] = posArr[i*3+1];
          linePositions[lineIdx*6+2] = posArr[i*3+2];
          linePositions[lineIdx*6+3] = posArr[j*3];
          linePositions[lineIdx*6+4] = posArr[j*3+1];
          linePositions[lineIdx*6+5] = posArr[j*3+2];

          lineColors[lineIdx*6] = green.r * alpha;
          lineColors[lineIdx*6+1] = green.g * alpha;
          lineColors[lineIdx*6+2] = green.b * alpha;
          lineColors[lineIdx*6+3] = green.r * alpha;
          lineColors[lineIdx*6+4] = green.g * alpha;
          lineColors[lineIdx*6+5] = green.b * alpha;
          lineIdx++;
        }
      }
    }

    lineGeometry.setDrawRange(0, lineIdx * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
})();

// ===== PDF Viewer (Global Functions) =====
function openPdfViewer(pdfUrl, title) {
  const modal = document.getElementById('pdfViewerModal');
  const frame = document.getElementById('pdfViewerFrame');
  const titleEl = document.getElementById('pdfViewerTitle');
  const downloadBtn = document.getElementById('pdfDownloadBtn');
  
  if (!modal || !frame) return;
  
  // Build absolute URL for Google Docs Viewer
  const fullUrl = window.location.origin + '/' + pdfUrl;
  frame.src = 'https://docs.google.com/gview?url=' + encodeURIComponent(fullUrl) + '&embedded=true';
  
  if (titleEl) titleEl.textContent = title || 'Document';
  if (downloadBtn) {
    downloadBtn.href = pdfUrl;
    downloadBtn.download = '';
  }
  
  document.body.classList.add('modal-open');
  modal.classList.add('show');
  
  // Re-initialize Lucide icons in modal
  if (typeof lucide !== 'undefined') {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

function closePdfViewer() {
  const modal = document.getElementById('pdfViewerModal');
  const frame = document.getElementById('pdfViewerFrame');
  
  if (frame) frame.src = '';
  if (modal) {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // ===== Custom Cursor =====
  (function initCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || matchMedia('(pointer:coarse)').matches) return;

    document.body.style.cursor = 'none';

    let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth follow loop
    function moveCursor() {
      // Dot follows fast
      dotX += (mouseX - dotX) * 0.25;
      dotY += (mouseY - dotY) * 0.25;
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

      // Ring follows with delay (creates liquid feel)
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;

      requestAnimationFrame(moveCursor);
    }
    moveCursor();

    // Magnetic hover for interactive elements
    const hoverTargets = 'a, button, .btn, .exp-card, .exp-nav-btn, .exp-dot, .project-card, .nav-link, .theme-toggle, .music-toggle, .logo-item';

    document.querySelectorAll(hoverTargets).forEach(el => {
      el.style.cursor = 'none';
      el.addEventListener('mouseenter', () => {
        dot.classList.add('hovering');
        ring.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  })();

  // Set --level CSS variable on skill chips from data-level attribute
  document.querySelectorAll('.skill-chip[data-level]').forEach(chip => {
    chip.style.setProperty('--level', chip.dataset.level);
  });

  // ===== Theme Toggle (Dark/Light Mode) =====
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Re-initialize Lucide icons after theme change
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });
  }

  // ===== Music Player =====
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  
  if (musicToggle && bgMusic) {
    bgMusic.volume = 0.3;
    
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().then(() => {
          musicToggle.classList.add('playing');
        }).catch(e => console.log('Audio play failed:', e));
      } else {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
      }
    });
  }

  // ===== Scroll Progress Bar =====
  const scrollProgress = document.querySelector('.scroll-progress');
  
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = scrollPercent + '%';
    }
  }
  
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ===== Preloader =====
  const preloader = document.querySelector(".preloader");
  
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hidden");
      document.body.style.overflow = "";
      initAnimations();
      initAdvancedEffects();
    }, 1500);
  });

  // Fallback if load doesn't fire
  setTimeout(() => {
    if (!preloader.classList.contains("hidden")) {
      preloader.classList.add("hidden");
      document.body.style.overflow = "";
      initAnimations();
      initAdvancedEffects();
    }
  }, 4000);

  // ===== Custom Cursor (disabled for cleaner look) =====

  // ===== 3D Experience Carousel + Center Animation =====
  function initExpCarousel() {
    const cards = document.querySelectorAll('.exp-card');
    const ring = document.getElementById('expRing');
    const dots = document.querySelectorAll('.exp-dot');
    const prevBtn = document.getElementById('expPrev');
    const nextBtn = document.getElementById('expNext');
    const dragHint = document.getElementById('expDragHint');
    const TOTAL = cards.length;
    const ANGLE_STEP = 360 / TOTAL;
    // Radius — how far cards sit from center
    const RADIUS = 420;
    let current = 0;
    let autoTimer;
    let isDragging = false;
    let dragStartX = 0;
    let dragAngle = 0;
    let currentRotation = 0;

    function setCardClasses(activeIndex) {
      cards.forEach((card, i) => {
        card.classList.remove('exp-card--front', 'exp-card--side', 'exp-card--back');
        const diff = ((i - activeIndex) % TOTAL + TOTAL) % TOTAL;
        if (diff === 0) {
          card.classList.add('exp-card--front');
        } else if (diff === 1 || diff === TOTAL - 1) {
          card.classList.add('exp-card--side');
        } else {
          card.classList.add('exp-card--back');
        }
      });

      dots.forEach((d, i) => {
        d.classList.toggle('exp-dot--active', i === activeIndex);
      });
    }

    function goTo(index) {
      current = ((index % TOTAL) + TOTAL) % TOTAL;
      currentRotation = -current * ANGLE_STEP;
      ring.style.transform = `rotateY(${currentRotation}deg)`;
      setCardClasses(current);
    }

    // Position cards in a ring
    cards.forEach((card, i) => {
      const angle = i * ANGLE_STEP;
      card.style.transform = `rotateY(${angle}deg) translateZ(${RADIUS}px)`;
    });

    goTo(0);

    // Navigation
    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.i));
        resetAuto();
      });
    });

    // Click side cards to navigate
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index);
        if (idx !== current) {
          goTo(idx);
          resetAuto();
        }
      });
    });

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { goTo(current - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    });

    // Drag / swipe to rotate
    const stage = document.getElementById('expStage');

    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.exp-nav-btn') || e.target.closest('.exp-dot')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragAngle = currentRotation;
      stage.style.cursor = 'grabbing';
      if (dragHint) dragHint.classList.add('hidden');
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const sensitivity = 0.3;
      const newRot = dragAngle + dx * sensitivity;
      ring.style.transform = `rotateY(${newRot}deg)`;
      ring.style.transition = 'none';
    });

    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      stage.style.cursor = '';
      ring.style.transition = '';
      const dx = e.clientX - dragStartX;
      const sensitivity = 0.3;
      const totalRotation = dragAngle + dx * sensitivity;
      // Snap to nearest card
      const snappedIndex = Math.round(-totalRotation / ANGLE_STEP);
      goTo(snappedIndex);
      resetAuto();
    });

    // Auto-rotation
    function startAuto() {
      autoTimer = setInterval(() => { goTo(current + 1); }, 5000);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    startAuto();

    // Pause on hover
    stage.addEventListener('mouseenter', () => clearInterval(autoTimer));
    stage.addEventListener('mouseleave', () => startAuto());
  }

  // Center 3D animation — rotating icosahedron wireframe
  function initExp3DCenter() {
    const canvas = document.getElementById('exp3dCenter');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(320, 320);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Main icosahedron wireframe
    const icoGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const wireGeo = new THREE.WireframeGeometry(icoGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x84cc16,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wireframe);

    // Inner smaller icosahedron
    const innerGeo = new THREE.IcosahedronGeometry(0.8, 0);
    const innerWireGeo = new THREE.WireframeGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: 0x84cc16,
      transparent: true,
      opacity: 0.15,
    });
    const innerWire = new THREE.LineSegments(innerWireGeo, innerMat);
    scene.add(innerWire);

    // Vertex dots on outer shape
    const dotCount = icoGeo.attributes.position.count;
    const dotGeo = new THREE.BufferGeometry();
    const dotPos = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      dotPos[i * 3] = icoGeo.attributes.position.array[i * 3];
      dotPos[i * 3 + 1] = icoGeo.attributes.position.array[i * 3 + 1];
      dotPos[i * 3 + 2] = icoGeo.attributes.position.array[i * 3 + 2];
    }
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0x84cc16,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const dotPoints = new THREE.Points(dotGeo, dotMat);
    scene.add(dotPoints);

    // Glow ring
    const ringGeo = new THREE.TorusGeometry(2.0, 0.01, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x84cc16,
      transparent: true,
      opacity: 0.08,
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = Math.PI / 2;
    scene.add(glowRing);

    // Mouse tracking for subtle reactivity
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
      requestAnimationFrame(animate);
      const t = performance.now() * 0.001;

      // Gentle rotation
      wireframe.rotation.y = t * 0.15;
      wireframe.rotation.x = Math.sin(t * 0.08) * 0.3;

      innerWire.rotation.y = -t * 0.2;
      innerWire.rotation.z = t * 0.1;

      dotPoints.rotation.y = t * 0.15;
      dotPoints.rotation.x = Math.sin(t * 0.08) * 0.3;

      glowRing.rotation.z = t * 0.05;

      // Subtle mouse reactivity
      wireframe.rotation.y += mouseX * 0.15;
      wireframe.rotation.x += mouseY * 0.1;
      dotPoints.rotation.y += mouseX * 0.15;
      dotPoints.rotation.x += mouseY * 0.1;

      // Breathe effect on opacity
      wireMat.opacity = 0.25 + Math.sin(t * 0.5) * 0.08;
      innerMat.opacity = 0.12 + Math.sin(t * 0.7 + 1) * 0.05;

      renderer.render(scene, camera);
    }

    animate();

    // Responsive resize
    function resizeCenter() {
      const el = canvas.parentElement;
      if (!el) return;
      const s = Math.min(el.offsetWidth * 0.35, 320);
      canvas.style.width = s + 'px';
      canvas.style.height = s + 'px';
    }

    window.addEventListener('resize', resizeCenter);
    resizeCenter();
  }

  initExpCarousel();
  initExp3DCenter();

  // ===== Subtle Card Hover Effect (No 3D Tilt) =====
  function initCardHoverEffects() {
    const cards = document.querySelectorAll('.experience-card, .project-card, .glass-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Only update glow position, no 3D tilt
        card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
        card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
      });
    });
  }

  // ===== Magnetic Buttons =====
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ===== Text Reveal Animation =====
  function initTextReveal() {
    const titles = document.querySelectorAll('.section-title, .hero-title');
    
    titles.forEach(title => {
      const text = title.textContent;
      title.innerHTML = '';
      
      text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(30px)';
        span.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.03}s`;
        title.appendChild(span);
      });
    });
  }

  // ===== Initialize Advanced Effects =====
  function initAdvancedEffects() {
    initCardHoverEffects();
    
    // Animate text reveals when in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const spans = entry.target.querySelectorAll('span');
          spans.forEach(span => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
          });
        }
      });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('.section-title').forEach(el => observer.observe(el));
  }

  // ===== Advanced Antigravity Hero Animation (Google-style) =====
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const floatingCards = document.querySelectorAll(".floating-card");
  const gradientOrbs = document.querySelectorAll(".gradient-orb");
  const heroImageWrapper = document.querySelector(".hero-image-wrapper");
  const heroTitle = document.querySelector(".hero-title");
  const heroBadge = document.querySelector(".hero-badge");
  const heroStats = document.querySelector(".hero-stats");
  
  if (hero && heroContent) {
    let isInHero = true;
    let animationFrame;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    // Smooth interpolation for fluid motion
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    // Animation loop for smooth continuous movement
    function animateHero() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);
      
      // Apply transforms with eased values
      floatingCards.forEach((card, index) => {
        const intensity = 25 + (index * 12);
        const rotation = currentX * 3;
        const moveX = -currentX * intensity;
        const moveY = -currentY * intensity;
        card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(${1 + Math.abs(currentX) * 0.05})`;
      });
      
      gradientOrbs.forEach((orb, index) => {
        const intensity = 35 + (index * 15);
        const scale = 1 + Math.abs(currentX * currentY) * 0.1;
        const moveX = currentX * intensity;
        const moveY = currentY * intensity;
        orb.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale})`;
      });
      
      if (heroImageWrapper) {
        const tiltX = currentY * 8;
        const tiltY = -currentX * 8;
        const scale = 1 + Math.abs(currentX * currentY) * 0.02;
        heroImageWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      }
      
      // Subtle text parallax
      if (heroTitle) {
        heroTitle.style.transform = `translate(${currentX * 5}px, ${currentY * 3}px)`;
      }
      
      if (heroBadge) {
        heroBadge.style.transform = `translate(${-currentX * 8}px, ${-currentY * 5}px)`;
      }
      
      if (heroStats) {
        heroStats.style.transform = `translate(${currentX * 3}px, ${currentY * 2}px)`;
      }
      
      if (isInHero) {
        animationFrame = requestAnimationFrame(animateHero);
      }
    }
    
    hero.addEventListener("mousemove", (e) => {
      if (!isInHero) return;
      
      const rect = hero.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      targetX = (x - centerX) / centerX;
      targetY = (y - centerY) / centerY;
    });
    
    hero.addEventListener("mouseenter", () => {
      if (!animationFrame && isInHero) {
        animateHero();
      }
    });
    
    hero.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      
      // Let animation continue to smoothly return to center
      setTimeout(() => {
        floatingCards.forEach((card) => {
          card.style.transform = "";
        });
        gradientOrbs.forEach((orb) => {
          orb.style.transform = "";
        });
        if (heroImageWrapper) {
          heroImageWrapper.style.transform = "";
        }
        if (heroTitle) {
          heroTitle.style.transform = "";
        }
        if (heroBadge) {
          heroBadge.style.transform = "";
        }
        if (heroStats) {
          heroStats.style.transform = "";
        }
      }, 500);
    });
    
    // Start animation when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isInHero = entry.isIntersecting;
        if (isInHero && !animationFrame) {
          animateHero();
        } else if (!isInHero && animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      });
    }, { threshold: 0.1 });
    
    heroObserver.observe(hero);
    
    // Initial animation start
    animateHero();
  }

  // ===== Navigation =====
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-link");

  // Scroll effect for navbar
  let lastScroll = 0;
  
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      menuToggle.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });
  }

  // Close mobile menu on link click
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinks.classList.remove("active");
      if (menuToggle) menuToggle.classList.remove("active");
      document.body.classList.remove("menu-open");
    });
  });

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]");
  
  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      }
    });
  }
  
  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  // ===== Counter Animation =====
  function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  // Trigger counter animation when visible
  const statNumbers = document.querySelectorAll(".stat-number[data-count]");
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach((stat) => counterObserver.observe(stat));

  // ===== Skill Bars Animation =====
  const skillCategories = document.querySelectorAll(".skill-category");
  
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll(".skill-fill");
        fills.forEach((fill, index) => {
          setTimeout(() => {
            fill.style.width = fill.style.getPropertyValue("--fill");
          }, index * 100);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  
  skillCategories.forEach((category) => skillObserver.observe(category));

  // ===== Scroll Animations (Simple AOS alternative) =====
  const animatedElements = document.querySelectorAll("[data-aos]");
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.aosDelay || 0;
        setTimeout(() => {
          entry.target.classList.add("aos-animate");
        }, parseInt(delay));
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  
  animatedElements.forEach((el) => scrollObserver.observe(el));

  // ===== GSAP Animations =====

  function initAnimations() {
    if (typeof gsap === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero section parallax (only affects gradient orbs when scrolling)
    gsap.to(".gradient-orb", {
      y: -100,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Section headers - elegant fade in
    gsap.utils.toArray(".section-header").forEach((header) => {
      gsap.from(header, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // Experience cards - cascade handled by CSS IntersectionObserver
    // Only animate non-cascade experience cards (legacy support)
    gsap.utils.toArray(".experience-card:not(.cascade-item)").forEach((card, index) => {
      gsap.from(card, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Company logos in experience cards - subtle pop in
    gsap.utils.toArray(".company-logo").forEach((logo) => {
      gsap.from(logo, {
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: logo,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Logo marquee items - cascade fade in
    gsap.from(".logos-section", {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".logos-section",
        start: "top 95%",
        toggleActions: "play none none none",
      },
    });

    // 3D Experience Carousel — reveal on scroll
    const expStage = document.getElementById('expStage');
    if (expStage) {
      gsap.from(expStage, {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: expStage,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Project cards stagger - professional reveal
    const projectCardsGSAP = document.querySelectorAll(".project-card");
    if (projectCardsGSAP.length > 0) {
      gsap.set(projectCardsGSAP, { opacity: 1 });
      
      gsap.from(projectCardsGSAP, {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".projects-grid",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }
    
    // Skill categories animation
    gsap.utils.toArray(".skill-category").forEach((category, index) => {
      gsap.from(category, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: category,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Tech icons - show immediately without animation (CSS handles visibility)
    gsap.utils.toArray(".tech-icons").forEach(container => {
      const icons = container.querySelectorAll('.tech-icon');
      // Set to visible immediately
      gsap.set(icons, { scale: 1, opacity: 1 });
    });

    // Contact cards wave animation
    gsap.utils.toArray(".contact-card").forEach((card, index) => {
      gsap.from(card, {
        x: -50,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    });

    // Parallax effect for sections
    gsap.utils.toArray(".section").forEach(section => {
      const bg = section.querySelector('.section-header');
      if (bg) {
        gsap.to(bg, {
          y: -30,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });
  }

  // ===== Modal Functionality =====
  const projectCards = document.querySelectorAll(".project-card");
  const modals = document.querySelectorAll(".modal");

  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const projectId = card.getAttribute("data-project-id");
      const modal = document.getElementById(`modal-${projectId}`);
      if (modal) {
        openModal(modal);
      }
    });
  });

  function openModal(modal) {
    document.body.classList.add("modal-open");
    modal.classList.add("show");
    
    // Re-initialize icons in modal
    if (typeof lucide !== "undefined") {
      setTimeout(() => lucide.createIcons(), 100);
    }
  }

  function closeModal(modal) {
    // Pause all videos in the modal
    const videos = modal.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
    
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  // Modal close handlers
  modals.forEach((modal) => {
    const closeBtn = modal.querySelector(".modal-close");
    const backdrop = modal.querySelector(".modal-backdrop");
    
    if (closeBtn) {
      closeBtn.addEventListener("click", () => closeModal(modal));
    }
    
    if (backdrop) {
      backdrop.addEventListener("click", () => closeModal(modal));
    }
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Close PDF viewer if open
      const pdfModal = document.getElementById('pdfViewerModal');
      if (pdfModal && pdfModal.classList.contains('show')) {
        closePdfViewer();
        return;
      }
      
      modals.forEach((modal) => {
        if (modal.classList.contains("show")) {
          closeModal(modal);
        }
      });
    }
  });

  // ===== Back to Top Button =====
  const backToTop = document.getElementById("backToTop");
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });
  
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ===== Contact Form =====
  const contactForm = document.getElementById("contact-form");
  
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = contactForm.querySelector("#name").value;
      const email = contactForm.querySelector("#email").value;
      const message = contactForm.querySelector("#message").value;
      
      // Create mailto link
      const mailtoLink = `mailto:kshitijp21@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
      
      window.location.href = mailtoLink;
    });
  }

  // ===== Logo Marquee - Pause on Hover =====
  const marqueeContent = document.querySelector(".marquee-content");
  
  if (marqueeContent) {
    marqueeContent.addEventListener("mouseenter", () => {
      marqueeContent.style.animationPlayState = "paused";
    });
    
    marqueeContent.addEventListener("mouseleave", () => {
      marqueeContent.style.animationPlayState = "running";
    });
  }

  // ===== Video Lazy Loading =====
  const videos = document.querySelectorAll("video");
  
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const video = entry.target;
        const source = video.querySelector("source");
        if (source && source.dataset.src) {
          source.src = source.dataset.src;
          video.load();
        }
        videoObserver.unobserve(video);
      }
    });
  }, { rootMargin: "100px" });

  videos.forEach((video) => {
    videoObserver.observe(video);
  });

  // ===== Tech Icon Tooltip =====
  const techIcons = document.querySelectorAll(".tech-icon");
  
  techIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", () => {
      icon.style.zIndex = "10";
    });
    
    icon.addEventListener("mouseleave", () => {
      icon.style.zIndex = "";
    });
  });

  // ===== Magnetic Button Effect =====
  const magneticButtons = document.querySelectorAll(".btn-primary, .btn-secondary");
  
  magneticButtons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

  // ===== Tilt Effect on Cards =====
  const tiltCards = document.querySelectorAll(".project-card, .info-card, .contact-card");
  
  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // ===== Typing Effect for Role - REPLACED by Role Carousel =====
  // Old typing effect removed. New slide carousel below.
  
  // Role carousel removed for cleaner design

  // ===== Performance Optimization - Reduce animations on low-end devices =====
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  
  if (prefersReducedMotion.matches) {
    // Disable intensive animations
    document.querySelectorAll(".gradient-orb, .floating-card, .image-ring").forEach((el) => {
      el.style.animation = "none";
    });
    
    // Disable cursor effects
    cursorFollower.style.display = "none";
    cursorDot.style.display = "none";
  }

  // ===== Cascading Experience Cards on Scroll =====
  const cascadeItems = document.querySelectorAll('.cascade-item');
  
  if (cascadeItems.length > 0) {
    const cascadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cascade-visible');
          cascadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    
    cascadeItems.forEach(item => cascadeObserver.observe(item));
  }

  console.log("Portfolio loaded successfully! 🚀");
});
