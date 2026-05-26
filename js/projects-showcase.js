/**
 * projects-showcase.js — Three.js WebGL project image slider
 *
 * Full-viewport plane with a GLSL wave-distortion transition shader.
 * Scroll position between projects is lerped; mouse moves apply a
 * sub-pixel parallax shift on the current image. Navigation via
 * arrow buttons, dot indicators, and keyboard ← →.
 *
 * Safe alongside script.js / webgl-scene.js / interactions.js —
 * uses a completely separate canvas (#proj-canvas) and scene.
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  /* ── Project data ─────────────────────────────────────────────── */
  var PROJECTS = [
    {
      id:    'av-orchestrator',
      title: 'Autonomous Mobility Orchestrator',
      desc:  'Won 1st at PAVE Europe 2025. RL-based fleet optimizer for city-wide autonomous mobility — PPO agents routing 200+ vehicles in real time.',
      tags:  ['PPO', 'Next.js', 'TomTom API', 'TypeScript'],
      image: 'media/av_orchestrator_map.jpg'
    },
    {
      id:    'project1',
      title: 'Schanzer Racing Electric',
      desc:  'Driverless department at THI. LiDAR-based cone detection, trajectory planning, and embedded real-time control on NVIDIA Jetson.',
      tags:  ['LiDAR', 'ROS2', 'Autonomy', 'C++'],
      image: 'media/schanzer_logo.png'
    },
    {
      id:    'akkodis',
      title: 'Akkodis Service Robot',
      desc:  'TurtleBot3 + Intel RealSense + YOLOv8. Navigates cluttered environments, detects objects, and picks them up autonomously.',
      tags:  ['ROS2', 'YOLO', 'RealSense', 'MoveIt'],
      image: 'media/akkodis_logo.jpg'
    },
    {
      id:    'pixhawk',
      title: 'Pixhawk Drone Platform',
      desc:  'Custom-built UAV for real-world RL testing. PX4 + MAVSDK, runs my thesis policies on hardware after sim-to-real transfer.',
      tags:  ['PX4', 'MAVSDK', 'UAV', 'Pixhawk'],
      image: 'media/pixhawk_drone.jpg'
    },
    {
      id:    'campus-help',
      title: 'Campus Help',
      desc:  'THI had no way for students to find tutors. I built one — full-stack with auth, real-time chat, and a matching algorithm.',
      tags:  ['Next.js', 'Supabase', 'TypeScript', 'PostgreSQL'],
      image: 'Logos/THI logo.png'
    },
    {
      id:    'vr-dekra',
      title: 'VR Accident Reconstruction',
      desc:  '3D laser scans plus dashcam footage processed into forensic VR reconstructions for DEKRA accident investigators.',
      tags:  ['IPG CarMaker', 'CARLA', 'VR', 'Python'],
      image: 'DEKRA/vr-dekra-1.jpg'
    },
    {
      id:    'airbus-fyi',
      title: 'Airbus Fly Your Ideas',
      desc:  'Global aerospace challenge by Airbus & UNESCO. Team entry with a novel proposal for next-generation sustainable aviation.',
      tags:  ['Aerospace', 'Innovation', 'Airbus', 'Sustainability'],
      image: 'Logos/airbus fly your ideas.jpg'
    }
  ];

  /* ── DOM refs ─────────────────────────────────────────────────── */
  var wrap   = document.getElementById('projects-showcase');
  var canvas = document.getElementById('proj-canvas');
  if (!wrap || !canvas) return;

  var elTitle   = document.getElementById('proj-title');
  var elDesc    = document.getElementById('proj-desc');
  var elTags    = document.getElementById('proj-tags');
  var elView    = document.getElementById('proj-view');
  var elCurrent = document.getElementById('proj-current');
  var elTotal   = document.getElementById('proj-total');
  var elDots    = document.getElementById('proj-dots');
  var elPrev    = document.getElementById('proj-prev');
  var elNext    = document.getElementById('proj-next');

  if (elTotal) elTotal.textContent = String(PROJECTS.length).padStart(2, '0');

  /* ── Three.js setup ───────────────────────────────────────────── */
  var W = wrap.clientWidth;
  var H = wrap.clientHeight;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0a, 1);

  var scene  = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  /* ── Shader ───────────────────────────────────────────────────── */
  var VERT = /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  /* Cover-fit a texture inside the viewport, centred */
  var FRAG = /* glsl */`
    precision mediump float;
    #define PI 3.14159265358979

    uniform sampler2D uTex1;
    uniform sampler2D uTex2;
    uniform float uProgress;   /* 0 → 1 */
    uniform float uAspect;     /* viewport W/H */
    uniform float uTex1A;      /* texture1 W/H */
    uniform float uTex2A;      /* texture2 W/H */
    uniform vec2  uMouse;      /* -1..1, lerped */

    varying vec2 vUv;

    /* Scale UV so the texture covers the viewport (object-fit: cover) */
    vec2 coverUV(vec2 uv, float viewA, float texA) {
      vec2 s;
      if (viewA > texA) {
        s = vec2(1.0, texA / viewA);
      } else {
        s = vec2(viewA / texA, 1.0);
      }
      return (uv - 0.5) * s + 0.5;
    }

    void main() {
      float p = uProgress;

      /* Sine-wave distortion peaks in the middle of the transition */
      float wave = sin(vUv.x * PI * 5.0 + p * PI * 3.5)
                 * sin(vUv.y * PI * 2.5 + p * PI * 1.5)
                 * smoothstep(0.0, 0.45, p)
                 * smoothstep(1.0, 0.45, p)
                 * 0.12;

      /* Subtle mouse parallax on the outgoing image */
      vec2 parallax = uMouse * 0.012 * (1.0 - p);

      vec2 uv1 = coverUV(vUv + vec2(0.0, wave) + parallax, uAspect, uTex1A);
      vec2 uv2 = coverUV(vUv - vec2(0.0, wave * 0.6),       uAspect, uTex2A);

      /* Clamp so we don't sample outside texture borders */
      uv1 = clamp(uv1, 0.0, 1.0);
      uv2 = clamp(uv2, 0.0, 1.0);

      vec4 c1 = texture2D(uTex1, uv1);
      vec4 c2 = texture2D(uTex2, uv2);

      vec4 color = mix(c1, c2, smoothstep(0.0, 1.0, p));

      /* Vignette — subtle darkening at edges */
      float vignette = 1.0 - smoothstep(0.45, 1.05, length((vUv - 0.5) * vec2(1.0, uAspect < 1.0 ? 1.0 : 1.0 / uAspect)));
      color.rgb *= 0.28 + vignette * 0.72;

      gl_FragColor = color;
    }
  `;

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      uTex1:     { value: null },
      uTex2:     { value: null },
      uProgress: { value: 0.0 },
      uAspect:   { value: W / H },
      uTex1A:    { value: 1.0 },
      uTex2A:    { value: 1.0 },
      uMouse:    { value: new THREE.Vector2(0, 0) }
    },
    vertexShader:   VERT,
    fragmentShader: FRAG
  });

  var geo  = new THREE.PlaneGeometry(2, 2);
  var mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  /* ── Texture loading ──────────────────────────────────────────── */
  var textures      = new Array(PROJECTS.length).fill(null);
  var texAspects    = new Array(PROJECTS.length).fill(1.0);
  var loader        = new THREE.TextureLoader();
  var currentIndex  = 0;
  var transitioning = false;

  function loadTex(i) {
    if (textures[i]) return;
    loader.load(PROJECTS[i].image, function (tex) {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      textures[i]   = tex;
      if (tex.image) {
        texAspects[i] = tex.image.naturalWidth / tex.image.naturalHeight || 1.0;
      }
      /* Bootstrap the first display */
      if (i === 0 && !mat.uniforms.uTex1.value) {
        mat.uniforms.uTex1.value  = tex;
        mat.uniforms.uTex2.value  = tex;
        mat.uniforms.uTex1A.value = texAspects[i];
        mat.uniforms.uTex2A.value = texAspects[i];
        setInfo(0, false);
      }
    });
  }

  /* Load first two immediately, rest in background */
  loadTex(0);
  loadTex(1);
  setTimeout(function () {
    for (var i = 2; i < PROJECTS.length; i++) loadTex(i);
  }, 800);

  /* ── Transition ───────────────────────────────────────────────── */
  function goTo(next) {
    next = ((next % PROJECTS.length) + PROJECTS.length) % PROJECTS.length;
    if (transitioning || next === currentIndex) return;
    if (!textures[next]) { loadTex(next); return; } /* not ready yet */

    transitioning = true;
    mat.uniforms.uTex2.value  = textures[next];
    mat.uniforms.uTex2A.value = texAspects[next];

    var start    = null;
    var DURATION = 860; /* ms */

    function step(ts) {
      if (!start) start = ts;
      var raw = Math.min((ts - start) / DURATION, 1.0);
      /* Cubic ease in-out */
      var p = raw < 0.5 ? 4 * raw * raw * raw
                        : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      mat.uniforms.uProgress.value = p;

      if (raw < 1.0) {
        requestAnimationFrame(step);
      } else {
        mat.uniforms.uTex1.value  = textures[next];
        mat.uniforms.uTex1A.value = texAspects[next];
        mat.uniforms.uProgress.value = 0.0;
        currentIndex  = next;
        transitioning = false;
        updateDots();
      }
    }

    setInfo(next, true);
    requestAnimationFrame(step);
  }

  /* ── Info panel ───────────────────────────────────────────────── */
  function setInfo(idx, animate) {
    var p = PROJECTS[idx];
    if (!elTitle) return;

    function write() {
      if (elCurrent) elCurrent.textContent = String(idx + 1).padStart(2, '0');
      elTitle.textContent = p.title;
      elDesc.textContent  = p.desc;
      elTags.innerHTML    = p.tags.map(function (t) {
        return '<span>' + t + '</span>';
      }).join('');

      var modal = document.getElementById('modal-' + p.id);
      elView.style.display = modal ? '' : 'none';
      elView.onclick = function () {
        if (!modal) return;
        document.body.classList.add('modal-open');
        modal.classList.add('show');
        if (typeof lucide !== 'undefined') {
          setTimeout(function () { lucide.createIcons(); }, 100);
        }
      };
    }

    if (animate) {
      elTitle.style.opacity = '0';
      elTitle.style.transform = 'translateY(12px)';
      elDesc.style.opacity  = '0';
      elTags.style.opacity  = '0';
      setTimeout(function () {
        write();
        elTitle.style.opacity = '1';
        elTitle.style.transform = 'translateY(0)';
        elDesc.style.opacity  = '1';
        elTags.style.opacity  = '1';
      }, 220);
    } else {
      write();
    }

    updateDots();
  }

  /* ── Dot indicators ───────────────────────────────────────────── */
  if (elDots) {
    PROJECTS.forEach(function (_, i) {
      var dot = document.createElement('div');
      dot.className = 'proj-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', function () { goTo(i); });
      elDots.appendChild(dot);
    });
  }

  function updateDots() {
    if (!elDots) return;
    elDots.querySelectorAll('.proj-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  /* ── Navigation ───────────────────────────────────────────────── */
  if (elPrev) elPrev.addEventListener('click', function () { goTo(currentIndex - 1); });
  if (elNext) elNext.addEventListener('click', function () { goTo(currentIndex + 1); });

  document.addEventListener('keydown', function (e) {
    /* Only fire if user isn't in a text input and no modal is open */
    if (document.body.classList.contains('modal-open')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
  });

  /* Swipe / drag on the canvas */
  var dragStartX = null;
  canvas.addEventListener('mousedown', function (e) { dragStartX = e.clientX; });
  canvas.addEventListener('mouseup',   function (e) {
    if (dragStartX === null) return;
    var dx = e.clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(dx) > 40) dx < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  });
  canvas.addEventListener('touchstart', function (e) {
    dragStartX = e.touches[0].clientX;
  }, { passive: true });
  canvas.addEventListener('touchend', function (e) {
    if (dragStartX === null) return;
    var dx = e.changedTouches[0].clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(dx) > 40) dx < 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }, { passive: true });

  /* ── Mouse parallax ───────────────────────────────────────────── */
  var targetMouse = new THREE.Vector2(0, 0);
  var lerpedMouse = new THREE.Vector2(0, 0);

  wrap.addEventListener('mousemove', function (e) {
    var r = wrap.getBoundingClientRect();
    targetMouse.x =  (e.clientX - r.left) / r.width  * 2 - 1;
    targetMouse.y = -((e.clientY - r.top)  / r.height * 2 - 1);
  });
  wrap.addEventListener('mouseleave', function () {
    targetMouse.set(0, 0);
  });

  /* ── Resize ───────────────────────────────────────────────────── */
  var resizeTO;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(function () {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      renderer.setSize(W, H);
      mat.uniforms.uAspect.value = W / H;
    }, 150);
  });

  /* ── Render loop ──────────────────────────────────────────────── */
  function render() {
    requestAnimationFrame(render);
    lerpedMouse.lerp(targetMouse, 0.055);
    mat.uniforms.uMouse.value = lerpedMouse;
    renderer.render(scene, camera);
  }

  render();

})();
