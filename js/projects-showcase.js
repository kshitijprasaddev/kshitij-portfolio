/**
 * projects-showcase.js — Dystopian WebGL Gallery
 *
 * Architecture:
 *   • Three.js scene with one TextureLoader per project image
 *   • Each project is a large PlaneGeometry with a custom vertex + fragment
 *     shader that gives it a holographic ripple breathing in idle state
 *   • Camera sits at Z+8, looks at origin; navigating moves camera.position.z
 *     along a 3D rail — each project card is stationed 18 units apart on the Z axis
 *   • Transition: GSAP-style lerp moves camera; the main composite pass runs a
 *     second fullscreen quad over the renderer output that applies:
 *       – RGB chromatic aberration (splits R/G/B channels)
 *       – Scan-line noise
 *       – Vignette
 *       – Edge bleed / bloom-like emissive glow
 *   • Particle field: 3000 dust particles drifting in the tunnel, lit by the
 *     active card's emissive colour
 *   • Mouse: applies a 6-DOF camera tilt (rotateX/Y) for depth parallax
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  /* ══════════════════════════════════════════════════════════════
     PROJECT DATA
  ══════════════════════════════════════════════════════════════ */
  var PROJECTS = [
    { id: 'av-orchestrator', title: 'Autonomous Mobility Orchestrator',
      desc: 'Won 1st at PAVE Europe 2025. PPO agents coordinating 200+ autonomous vehicles across live city topology.',
      tags: ['PPO', 'Next.js', 'TomTom API', 'TypeScript'], image: 'media/av_orchestrator_map.jpg', accent: [0.16, 0.59, 1.0] },
    { id: 'project1', title: 'Schanzer Racing Electric',
      desc: 'Driverless FSE department at THI. LiDAR cone detection, real-time trajectory planning on NVIDIA Jetson.',
      tags: ['LiDAR', 'ROS2', 'C++', 'Autonomy'], image: 'media/schanzer_logo.png', accent: [1.0, 0.22, 0.12] },
    { id: 'akkodis', title: 'Akkodis Service Robot',
      desc: 'TurtleBot3 + RealSense + YOLOv8. Full autonomy: navigate, detect, grasp. Demonstrated live on factory floor.',
      tags: ['ROS2', 'YOLO', 'RealSense', 'MoveIt'], image: 'media/akkodis_logo.jpg', accent: [0.0, 0.88, 0.55] },
    { id: 'pixhawk', title: 'Pixhawk UAV Platform',
      desc: 'Custom-built multirotor for real-world RL validation. PX4 + MAVSDK; thesis policies run on-board post sim-to-real.',
      tags: ['PX4', 'MAVSDK', 'UAV', 'Pixhawk'], image: 'media/pixhawk_drone.jpg', accent: [0.88, 0.72, 0.0] },
    { id: 'campus-help', title: 'Campus Help',
      desc: 'Full-stack peer-tutoring platform for THI. Auth, real-time chat, algorithmic matching — built in a weekend.',
      tags: ['Next.js', 'Supabase', 'TypeScript', 'PostgreSQL'], image: 'Logos/THI logo.png', accent: [0.55, 0.28, 1.0] },
    { id: 'vr-dekra', title: 'VR Accident Reconstruction',
      desc: 'Forensic 3D scenes for DEKRA investigators. LiDAR scan + dashcam fused into navigable VR reconstructions.',
      tags: ['IPG CarMaker', 'CARLA', 'VR', 'Python'], image: 'DEKRA/vr-dekra-1.jpg', accent: [1.0, 0.45, 0.0] },
    { id: 'airbus-fyi', title: 'Airbus Fly Your Ideas',
      desc: 'Global aerospace competition by Airbus & UNESCO. Team Vortex — novel sustainable aviation architecture.',
      tags: ['Aerospace', 'Innovation', 'Airbus', 'Sustainability'], image: 'Logos/airbus fly your ideas.jpg', accent: [0.0, 0.72, 1.0] }
  ];

  var N = PROJECTS.length;

  /* ══════════════════════════════════════════════════════════════
     DOM
  ══════════════════════════════════════════════════════════════ */
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

  if (elTotal) elTotal.textContent = String(N).padStart(2, '0');

  /* ══════════════════════════════════════════════════════════════
     RENDERER
  ══════════════════════════════════════════════════════════════ */
  var W = wrap.clientWidth;
  var H = wrap.clientHeight;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020305, 1);
  renderer.autoClear = false;

  /* ── Scene A: the 3D world ────────────────────────────────── */
  var sceneA = new THREE.Scene();
  sceneA.fog = new THREE.FogExp2(0x020305, 0.028);

  var camera = new THREE.PerspectiveCamera(68, W / H, 0.1, 300);
  camera.position.set(0, 0, 8);

  /* ── Scene B: fullscreen composite pass ───────────────────── */
  var sceneB = new THREE.Scene();
  var cameraB = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ══════════════════════════════════════════════════════════════
     SHADERS
  ══════════════════════════════════════════════════════════════ */

  /* — Card vertex: idle breathing warp ——————————————————————— */
  var CARD_VERT = [
    'uniform float uTime;',
    'uniform float uActive; /* 0..1 how "selected" this card is */',
    'varying vec2 vUv;',
    'varying float vWave;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 p = position;',
    '  float wave = sin(p.x * 2.8 + uTime * 1.1) * cos(p.y * 2.2 + uTime * 0.8) * 0.04',
    '             + sin(p.x * 5.5 - uTime * 0.6) * 0.015;',
    '  wave *= (0.4 + uActive * 0.6);',
    '  vWave = wave;',
    '  p.z += wave;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
    '}'
  ].join('\n');

  /* — Card fragment: holographic image + emissive rim ————————— */
  var CARD_FRAG = [
    'precision highp float;',
    'uniform sampler2D uTex;',
    'uniform float uTime;',
    'uniform float uActive;',
    'uniform float uAspectImg;',
    'uniform float uAspectCard;',
    'uniform vec3 uAccent;',
    'varying vec2 vUv;',
    'varying float vWave;',
    '',
    'vec2 coverUV(vec2 uv, float cardA, float imgA) {',
    '  vec2 s = cardA > imgA ? vec2(1.0, imgA / cardA) : vec2(cardA / imgA, 1.0);',
    '  return (uv - 0.5) * s + 0.5;',
    '}',
    '',
    'void main() {',
    '  /* cover-fit the image */',
    '  vec2 uv = coverUV(vUv, uAspectCard, uAspectImg);',
    '  uv = clamp(uv, 0.0, 1.0);',
    '',
    '  /* scanline noise */',
    '  float scan = step(0.5, fract(vUv.y * 220.0 + uTime * 14.0)) * 0.045;',
    '',
    '  /* chromatic aberration on the image itself */',
    '  float abb = (1.0 - uActive) * 0.0 + vWave * 2.5;',
    '  vec2 off = vec2(abb * 0.012, 0.0);',
    '  vec4 col;',
    '  col.r = texture2D(uTex, uv + off).r;',
    '  col.g = texture2D(uTex, uv       ).g;',
    '  col.b = texture2D(uTex, uv - off).b;',
    '  col.a = 1.0;',
    '',
    '  /* darken inactive cards */',
    '  float brightness = 0.22 + uActive * 0.78;',
    '  col.rgb *= brightness;',
    '  col.rgb -= scan;',
    '',
    '  /* emissive rim glow: brighter near card edges */',
    '  vec2 rim = abs(vUv - 0.5) * 2.0;', /* 0..1 */
    '  float rimStr = pow(max(rim.x, rim.y), 6.0);',
    '  col.rgb += uAccent * rimStr * (0.3 + uActive * 0.7) * 0.9;',
    '',
    '  /* inner vignette (darkens centre slightly for depth) */',
    '  float vig = 1.0 - smoothstep(0.35, 1.1, length((vUv - 0.5)));',
    '  col.rgb *= 0.55 + vig * 0.45;',
    '',
    '  gl_FragColor = col;',
    '}'
  ].join('\n');

  /* — Composite fragment: post-processing over final render ─── */
  var COMPOSITE_VERT = [
    'varying vec2 vUv;',
    'void main() { vUv = uv; gl_Position = vec4(position, 1.0); }'
  ].join('\n');

  var COMPOSITE_FRAG = [
    'precision highp float;',
    'uniform sampler2D uScene;',
    'uniform float uTime;',
    'uniform float uFlash;  /* 0..1 transition flash */',
    'uniform vec2  uRes;',
    'varying vec2 vUv;',
    '',
    'float rand(vec2 co) {',
    '  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = vUv;',
    '',
    '  /* Barrel distortion — very subtle */',
    '  vec2 dc = uv - 0.5;',
    '  float r2 = dot(dc, dc);',
    '  uv = uv + dc * r2 * 0.045;',
    '',
    '  /* RGB split: channels offset by different amounts */',
    '  float split = 0.0018 + uFlash * 0.012;',
    '  vec4 col;',
    '  col.r = texture2D(uScene, uv + vec2( split, 0.0)).r;',
    '  col.g = texture2D(uScene, uv                    ).g;',
    '  col.b = texture2D(uScene, uv - vec2( split, 0.0)).b;',
    '  col.a = 1.0;',
    '',
    '  /* Scanlines */',
    '  float scanA = 0.04 + uFlash * 0.06;',
    '  float scan  = step(0.5, fract(uv.y * uRes.y * 0.5)) * scanA;',
    '  col.rgb -= scan;',
    '',
    '  /* Film grain */',
    '  float grain = (rand(uv + fract(uTime * 0.071)) - 0.5) * 0.038;',
    '  col.rgb += grain;',
    '',
    '  /* Vignette */',
    '  float v = 1.0 - smoothstep(0.38, 1.02, length((uv - 0.5) * 1.35));',
    '  col.rgb *= 0.18 + v * 0.82;',
    '',
    '  /* Transition flash — white overexposure */',
    '  col.rgb += uFlash * 0.55;',
    '',
    '  gl_FragColor = col;',
    '}'
  ].join('\n');

  /* ══════════════════════════════════════════════════════════════
     RENDER TARGET (world → texture → composite)
  ══════════════════════════════════════════════════════════════ */
  var rtOptions = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
  var renderTarget = new THREE.WebGLRenderTarget(W, H, rtOptions);

  var compositeMat = new THREE.ShaderMaterial({
    uniforms: {
      uScene: { value: renderTarget.texture },
      uTime:  { value: 0 },
      uFlash: { value: 0 },
      uRes:   { value: new THREE.Vector2(W, H) }
    },
    vertexShader:   COMPOSITE_VERT,
    fragmentShader: COMPOSITE_FRAG,
    depthTest: false, depthWrite: false
  });

  var compositeGeo  = new THREE.PlaneGeometry(2, 2);
  var compositeMesh = new THREE.Mesh(compositeGeo, compositeMat);
  sceneB.add(compositeMesh);

  /* ══════════════════════════════════════════════════════════════
     CARDS
     One card per project, stacked along the -Z rail.
     Rail spacing: each card is RAIL_STEP units apart.
     Camera Z resting positions: camZ(i) = CAMERA_BASE - i * RAIL_STEP
  ══════════════════════════════════════════════════════════════ */
  var CARD_W     = 9.0;
  var CARD_H     = 5.5;
  var RAIL_STEP  = 18.0;
  var CAMERA_BASE = 8.0;

  var cardMeshes = [];
  var texLoader  = new THREE.TextureLoader();
  var textures   = new Array(N).fill(null);
  var texAspects = new Array(N).fill(1.0);

  function makeCard(i) {
    var geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 32, 20);
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex:        { value: null },
        uTime:       { value: 0 },
        uActive:     { value: i === 0 ? 1.0 : 0.0 },
        uAspectImg:  { value: 1.0 },
        uAspectCard: { value: CARD_W / CARD_H },
        uAccent:     { value: new THREE.Vector3(PROJECTS[i].accent[0], PROJECTS[i].accent[1], PROJECTS[i].accent[2]) }
      },
      vertexShader:   CARD_VERT,
      fragmentShader: CARD_FRAG,
      side: THREE.FrontSide
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, -i * RAIL_STEP);
    sceneA.add(mesh);
    cardMeshes.push(mesh);
  }

  for (var i = 0; i < N; i++) makeCard(i);

  function loadTex(i) {
    if (textures[i]) return;
    texLoader.load(PROJECTS[i].image, function (tex) {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      textures[i]   = tex;
      if (tex.image) texAspects[i] = tex.image.naturalWidth / tex.image.naturalHeight || 1.5;
      cardMeshes[i].material.uniforms.uTex.value        = tex;
      cardMeshes[i].material.uniforms.uAspectImg.value  = texAspects[i];
    });
  }

  /* Load first two immediately, stream the rest */
  loadTex(0); loadTex(1);
  setTimeout(function () { for (var j = 2; j < N; j++) loadTex(j); }, 600);

  /* ══════════════════════════════════════════════════════════════
     PARTICLE FIELD — atmospheric dust in the tunnel
  ══════════════════════════════════════════════════════════════ */
  var PARTICLE_N = 2800;
  var pGeo = new THREE.BufferGeometry();
  var pPos = new Float32Array(PARTICLE_N * 3);
  var pVel = new Float32Array(PARTICLE_N);     /* individual z-drift speeds */
  var pScatter = new Float32Array(PARTICLE_N); /* random phase offsets */

  for (var pi = 0; pi < PARTICLE_N; pi++) {
    pPos[pi * 3]     = (Math.random() - 0.5) * 16;
    pPos[pi * 3 + 1] = (Math.random() - 0.5) * 10;
    pPos[pi * 3 + 2] = (Math.random() - 0.5) * N * RAIL_STEP;
    pVel[pi]         = 0.004 + Math.random() * 0.012;
    pScatter[pi]     = Math.random() * Math.PI * 2;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  var pMat = new THREE.PointsMaterial({
    color: 0x2997ff,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  var particles = new THREE.Points(pGeo, pMat);
  sceneA.add(particles);

  /* ══════════════════════════════════════════════════════════════
     AMBIENT EMISSIVE LIGHT PLANES
     One thin plane per card: extends the glow into 3D space
  ══════════════════════════════════════════════════════════════ */
  for (var gi = 0; gi < N; gi++) {
    var glowGeo = new THREE.PlaneGeometry(CARD_W * 2.2, CARD_H * 2.2);
    var a = PROJECTS[gi].accent;
    var glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(a[0] * 0.22, a[1] * 0.22, a[2] * 0.22),
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    var glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(0, 0, -gi * RAIL_STEP - 0.5);
    sceneA.add(glowMesh);
  }

  /* ══════════════════════════════════════════════════════════════
     STATE & NAVIGATION
  ══════════════════════════════════════════════════════════════ */
  var currentIndex  = 0;
  var targetCamZ    = CAMERA_BASE;
  var currentCamZ   = CAMERA_BASE;
  var transitioning = false;
  var flashVal      = 0;
  var clock         = { now: performance.now() };

  /* Camera tilt from mouse */
  var targetTilt = { rx: 0, ry: 0 };
  var currentTilt = { rx: 0, ry: 0 };

  function camZForIndex(i) {
    return CAMERA_BASE - i * RAIL_STEP;
  }

  function goTo(next) {
    next = ((next % N) + N) % N;
    if (transitioning || next === currentIndex) return;

    if (!textures[next]) { loadTex(next); }

    transitioning = true;
    flashVal = 1.0;   /* trigger composite flash */
    currentIndex = next;
    targetCamZ   = camZForIndex(next);

    setInfo(next, true);
    updateDots();

    /* End of transition — settled after lerp finishes (~900ms) */
    setTimeout(function () { transitioning = false; }, 950);
  }

  /* ══════════════════════════════════════════════════════════════
     INFO PANEL
  ══════════════════════════════════════════════════════════════ */
  function setInfo(idx, animate) {
    var p = PROJECTS[idx];
    if (!elTitle) return;

    function write() {
      if (elCurrent) elCurrent.textContent = String(idx + 1).padStart(2, '0');
      if (elTitle)   elTitle.textContent   = p.title;
      if (elDesc)    elDesc.textContent    = p.desc;
      if (elTags)    elTags.innerHTML      = p.tags.map(function (t) {
        return '<span>' + t + '</span>';
      }).join('');

      /* Accent colour on the counter */
      var ac = p.accent;
      var hex = 'rgb(' + Math.round(ac[0]*255) + ',' + Math.round(ac[1]*255) + ',' + Math.round(ac[2]*255) + ')';
      if (elCurrent) elCurrent.style.color = hex;

      var modal = document.getElementById('modal-' + p.id);
      if (elView) {
        elView.style.display = modal ? '' : 'none';
        elView.onclick = function () {
          if (!modal) return;
          document.body.classList.add('modal-open');
          modal.classList.add('show');
          if (typeof lucide !== 'undefined') setTimeout(function () { lucide.createIcons(); }, 100);
        };
      }
    }

    if (animate) {
      if (elTitle) { elTitle.style.opacity = '0'; elTitle.style.transform = 'translateY(18px)'; }
      if (elDesc)  { elDesc.style.opacity  = '0'; }
      if (elTags)  { elTags.style.opacity  = '0'; }
      setTimeout(function () {
        write();
        if (elTitle) { elTitle.style.opacity = '1'; elTitle.style.transform = 'translateY(0)'; }
        if (elDesc)  elDesc.style.opacity  = '1';
        if (elTags)  elTags.style.opacity  = '1';
      }, 280);
    } else {
      write();
    }
  }

  /* ── Dots ─────────────────────────────────────────────────── */
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

  if (elPrev) elPrev.addEventListener('click', function () { goTo(currentIndex - 1); });
  if (elNext) elNext.addEventListener('click', function () { goTo(currentIndex + 1); });

  document.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('modal-open')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
  });

  /* Touch / drag */
  var dragX = null;
  canvas.addEventListener('mousedown',  function (e) { dragX = e.clientX; });
  canvas.addEventListener('mouseup',    function (e) {
    if (dragX === null) return;
    var dx = e.clientX - dragX; dragX = null;
    if (Math.abs(dx) > 40) goTo(currentIndex + (dx < 0 ? 1 : -1));
  });
  canvas.addEventListener('mouseleave', function () { dragX = null; });
  canvas.addEventListener('touchstart', function (e) { dragX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchend',   function (e) {
    if (dragX === null) return;
    var dx = e.changedTouches[0].clientX - dragX; dragX = null;
    if (Math.abs(dx) > 40) goTo(currentIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* Mouse tilt */
  wrap.addEventListener('mousemove', function (e) {
    var r = wrap.getBoundingClientRect();
    targetTilt.ry =  ((e.clientX - r.left) / r.width  - 0.5) * 0.18;
    targetTilt.rx = -((e.clientY - r.top)  / r.height - 0.5) * 0.10;
  });
  wrap.addEventListener('mouseleave', function () {
    targetTilt.rx = 0; targetTilt.ry = 0;
  });

  /* ══════════════════════════════════════════════════════════════
     RESIZE
  ══════════════════════════════════════════════════════════════ */
  var resizeTO;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(function () {
      W = wrap.clientWidth; H = wrap.clientHeight;
      renderer.setSize(W, H);
      renderTarget.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      compositeMat.uniforms.uRes.value.set(W, H);
    }, 150);
  });

  /* ══════════════════════════════════════════════════════════════
     RENDER LOOP
  ══════════════════════════════════════════════════════════════ */
  var LERP_CAM    = 0.048;  /* camera position lerp factor */
  var LERP_TILT   = 0.065;  /* tilt lerp */
  var LERP_ACTIVE = 0.04;   /* per-card active uniform lerp */
  var FLASH_DECAY = 0.88;   /* flash decay per frame */

  setInfo(0, false);

  function render(ts) {
    requestAnimationFrame(render);

    var t = ts * 0.001;

    /* Lerp camera along Z rail */
    currentCamZ += (targetCamZ - currentCamZ) * LERP_CAM;
    camera.position.z = currentCamZ;

    /* Lerp camera tilt */
    currentTilt.rx += (targetTilt.rx - currentTilt.rx) * LERP_TILT;
    currentTilt.ry += (targetTilt.ry - currentTilt.ry) * LERP_TILT;
    camera.rotation.x = currentTilt.rx;
    camera.rotation.y = currentTilt.ry;

    /* Particle drift: each particle moves slightly in X/Y as it progresses on Z */
    var pPositions = pGeo.attributes.position.array;
    var halfRail   = N * RAIL_STEP * 0.5;
    for (var pi = 0; pi < PARTICLE_N; pi++) {
      var idx3 = pi * 3;
      pPositions[idx3 + 1] += Math.sin(t * 0.35 + pScatter[pi]) * 0.0008;
      pPositions[idx3]     += Math.cos(t * 0.22 + pScatter[pi]) * 0.0005;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* Update card uniforms */
    for (var ci = 0; ci < N; ci++) {
      var mu = cardMeshes[ci].material.uniforms;
      mu.uTime.value = t;
      var targetActive = ci === currentIndex ? 1.0 : 0.0;
      mu.uActive.value += (targetActive - mu.uActive.value) * LERP_ACTIVE;
    }

    /* Flash decay */
    flashVal *= FLASH_DECAY;
    compositeMat.uniforms.uFlash.value = flashVal;
    compositeMat.uniforms.uTime.value  = t;

    /* Pass 1: render 3D world to render target */
    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(sceneA, camera);

    /* Pass 2: composite over the render target */
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(sceneB, cameraB);
  }

  requestAnimationFrame(render);

})();
