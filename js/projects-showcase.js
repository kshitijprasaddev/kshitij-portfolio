/**
 * projects-showcase.js  Â·  Dystopian WebGL Gallery  Â·  v4
 *
 * ARCHITECTURE
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Pass 0 â€” 3D Scene (sceneA, perspectiveCamera)
 *   â€¢ N project cards on a Z-rail, 18 units apart
 *   â€¢ Each card: PlaneGeometry 40Ã—24 verts, custom vert+frag shader
 *       Vertex: compound sine-wave breathing + spiral twist on navigate
 *       Fragment: cover-fit image, holographic scanlines, RGB aberration,
 *                 per-card accent emissive rim, internal grid overlay
 *   â€¢ 3 600 particles in tunnel â€” additive blended, drift in Lissajous loops
 *   â€¢ N glow quads (additive) behind each card
 *   â€¢ Grid floor plane â€” infinite perspective grid texture
 *
 * Pass 1 â€” Post-process composite (sceneB, orthoCamera, renderTarget)
 *   â€¢ Barrel lens distortion
 *   â€¢ RGB split (surges on navigate)
 *   â€¢ Rolling scanlines
 *   â€¢ Film grain
 *   â€¢ Deep vignette
 *   â€¢ Transition flash / whiteout
 *   â€¢ Dynamic fog colour tinted by active card accent
 *
 * Navigation
 *   â€¢ Button click  â†’ goTo(n)
 *   â€¢ Dot click     â†’ goTo(n)
 *   â€¢ Keyboard â† / â†’ â†’ goTo(n Â± 1)
 *   â€¢ Wheel / trackpad (inside showcase) â†’ accumulates delta, snaps per project
 *   â€¢ Touch swipe   â†’ goTo(n Â± 1)
 *   â€¢ Canvas click  â†’ opens modal for active project
 *
 * Camera
 *   â€¢ Flies along Z-rail with springy lerp
 *   â€¢ Lateral mouse tilt (rotX/Y)
 *   â€¢ During transition: vertical spiral arc (camera.y oscillates)
 *
 * All shaders written as template-literal strings (ES5 compat via var).
 */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     PROJECT MANIFEST
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var PROJECTS = [
    { id: 'av-orchestrator',
      title: 'Autonomous Mobility Orchestrator',
      category: 'Reinforcement Learning', year: '2025',
      desc: 'Won 1st at PAVE Europe 2025. PPO fleet optimizer routing 200+ AVs across live city topology. Real-time decision making at city scale.',
      tags: ['PPO', 'Next.js', 'TomTom API', 'TypeScript', 'Python'],
      image: 'media/av_orchestrator_map.jpg',
      accent: new THREE.Color(0.16, 0.59, 1.0) },
    { id: 'audi-data',
      title: 'Audi: 32 PB Pipeline & CLIP Search',
      category: 'Data Engineering · AI · PPE · PPC', year: '2026',
      desc: 'Processing 32 PB of Audi vehicle bus & camera data across PPE (Q6 e-tron, A6 e-tron) & PPC (A5, Q5, A6 C9) platforms. CV object tracking + CLIP semantic search for natural-language scenario retrieval.',
      tags: ['CLIP', 'PPE', 'PPC', 'Computer Vision', 'Semantic Search', 'Python', 'ADAS'],
      image: 'A250570_web_2880.jpg',
      accent: new THREE.Color(0.85, 0.10, 0.10) },
    { id: 'project1',
      title: 'Schanzer Racing Electric',
      category: 'Autonomous Vehicles', year: '2024',
      desc: 'Driverless FSE department, THI. LiDAR cone detection, real-time trajectory planning embedded on NVIDIA Jetson at 50Hz.',
      tags: ['LiDAR', 'ROS2', 'C++', 'Autonomy', 'NVIDIA Jetson'],
      image: 'media/schanzer_logo.png',
      accent: new THREE.Color(1.0, 0.18, 0.08) },
    { id: 'akkodis',
      title: 'Akkodis Service Robot',
      category: 'Robotics', year: '2024',
      desc: 'TurtleBot3 + RealSense + YOLOv8. Full sense-plan-act loop: navigate, detect, grasp. Demonstrated on live factory floor.',
      tags: ['ROS2', 'YOLOv8', 'RealSense', 'MoveIt2', 'Python'],
      image: 'media/akkodis_logo.jpg',
      accent: new THREE.Color(0.0, 0.88, 0.50) },
    { id: 'pixhawk',
      title: 'Pixhawk UAV Platform',
      category: 'Drone Engineering', year: '2025',
      desc: 'Custom multirotor for thesis validation. PX4 + MAVSDK. RL policies transferred from Isaac Sim run on-board after domain randomisation.',
      tags: ['PX4', 'MAVSDK', 'UAV', 'Isaac Sim', 'C++'],
      image: 'media/pixhawk_drone.jpg',
      accent: new THREE.Color(0.95, 0.72, 0.0) },
    { id: 'campus-help',
      title: 'Campus Help',
      category: 'Full-Stack', year: '2024',
      desc: 'Peer-tutoring marketplace for THI students. Supabase auth, real-time messaging, algorithmic matching. Built in a weekend, adopted by 300+ students.',
      tags: ['Next.js', 'Supabase', 'TypeScript', 'PostgreSQL'],
      image: 'Logos/THI logo.png',
      accent: new THREE.Color(0.55, 0.25, 1.0) },
    { id: 'vr-dekra',
      title: 'VR Accident Reconstruction',
      category: 'Simulation', year: '2023',
      desc: 'LiDAR scan + dashcam fused into navigable forensic VR scenes for DEKRA investigators. Sub-centimetre spatial accuracy.',
      tags: ['IPG CarMaker', 'CARLA', 'VR', 'Python', 'LiDAR'],
      image: 'DEKRA/vr-dekra-1.jpg',
      accent: new THREE.Color(1.0, 0.42, 0.0) },
    { id: 'airbus-fyi',
      title: 'Airbus Fly Your Ideas',
      category: 'Aerospace Innovation', year: '2026',
      desc: 'Global competition by Airbus & UNESCO. Team Vortex â€” novel sustainable propulsion + distributed cabin architecture proposal.',
      tags: ['Aerospace', 'CFD', 'Innovation', 'Airbus'],
      image: 'Logos/airbus fly your ideas.jpg',
      accent: new THREE.Color(0.0, 0.72, 1.0) }
  ];

  var N = PROJECTS.length;

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     DOM REFS
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var wrap    = document.getElementById('projects-showcase');
  var canvas  = document.getElementById('proj-canvas');
  if (!wrap || !canvas) return;

  var elTitle    = document.getElementById('proj-title');
  var elDesc     = document.getElementById('proj-desc');
  var elTags     = document.getElementById('proj-tags');
  var elView     = document.getElementById('proj-view');
  var elCurrent  = document.getElementById('proj-current');
  var elTotal    = document.getElementById('proj-total');
  var elDots     = document.getElementById('proj-dots');
  var elPrev     = document.getElementById('proj-prev');
  var elNext     = document.getElementById('proj-next');
  var elFill     = document.getElementById('proj-progress-fill');
  var elCategory = document.getElementById('proj-category');
  var elYear     = document.getElementById('proj-year');
  var elHint     = document.getElementById('proj-scroll-hint');

  if (elTotal) elTotal.textContent = String(N).padStart(2, '0');

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     RENDERER
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var W = wrap.clientWidth  || 800;
  var H = wrap.clientHeight || 500;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true, alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x010208, 1);
  renderer.autoClear = false;

  var sceneA  = new THREE.Scene();
  sceneA.fog  = new THREE.FogExp2(0x010208, 0.022);

  var camera  = new THREE.PerspectiveCamera(62, W / H, 0.1, 600);
  camera.position.set(0, 0, 8);

  var sceneB  = new THREE.Scene();
  var cameraB = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  var rt = new THREE.WebGLRenderTarget(W, H, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  });

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     CARD VERTEX SHADER
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var CARD_VERT = [
    'uniform float uTime;',
    'uniform float uActive;',
    'uniform float uSpin;',
    'varying vec2  vUv;',
    'varying float vWave;',
    'void main() {',
    '  vUv = uv;',
    '  vec3 p = position;',
    '  float wave = sin(p.x * 2.2 + uTime * 1.05) * cos(p.y * 2.6 + uTime * 0.8) * 0.055',
    '             + sin(p.x * 4.8 - uTime * 0.55 + p.y * 1.3) * 0.022;',
    '  wave *= (0.35 + uActive * 0.65);',
    '  vWave = wave;',
    '  float angle = uSpin * 3.14159 * 1.4 * (p.x / 4.5);',
    '  float cosA  = cos(angle); float sinA = sin(angle);',
    '  vec2 tw = vec2(p.x * cosA - p.y * sinA, p.x * sinA + p.y * cosA);',
    '  p.x = mix(p.x, tw.x, uSpin * 0.6);',
    '  p.y = mix(p.y, tw.y, uSpin * 0.6);',
    '  p.z += wave;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
    '}'
  ].join('\n');

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     CARD FRAGMENT SHADER
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var CARD_FRAG = [
    'precision highp float;',
    'uniform sampler2D uTex;',
    'uniform float     uTime;',
    'uniform float     uActive;',
    'uniform float     uAspImg;',
    'uniform float     uAspCard;',
    'uniform vec3      uAccent;',
    'uniform float     uSpin;',
    'varying vec2      vUv;',
    'varying float     vWave;',
    '',
    'vec2 coverUV(vec2 uv, float ca, float ia) {',
    '  vec2 s = (ca > ia) ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);',
    '  return clamp((uv - 0.5) * s + 0.5, 0.0, 1.0);',
    '}',
    '',
    'float gridLine(vec2 uv, float freq) {',
    '  vec2 g = abs(fract(uv * freq) - 0.5);',
    '  return 1.0 - smoothstep(0.0, 0.03, min(g.x, g.y));',
    '}',
    '',
    'void main() {',
    '  vec2 uv  = coverUV(vUv, uAspCard, uAspImg);',
    '  float ab = abs(vWave) * 3.5 + uSpin * 0.04;',
    '  vec2  off = vec2(ab * 0.013, 0.0);',
    '  vec4 col;',
    '  col.r = texture2D(uTex, coverUV(vUv + off, uAspCard, uAspImg)).r;',
    '  col.g = texture2D(uTex, uv).g;',
    '  col.b = texture2D(uTex, coverUV(vUv - off, uAspCard, uAspImg)).b;',
    '  col.a = 1.0;',
    '',
    '  float bright = 0.18 + uActive * 0.82;',
    '  float sat    = 0.22 + uActive * 0.78;',
    '  float lum    = dot(col.rgb, vec3(0.299, 0.587, 0.114));',
    '  col.rgb = mix(vec3(lum), col.rgb, sat) * bright;',
    '',
    '  float scan = step(0.5, fract(vUv.y * 280.0 + uTime * 20.0)) * 0.038;',
    '  col.rgb -= scan;',
    '',
    '  float g  = gridLine(vUv, 8.0) * (0.04 + uActive * 0.06);',
    '  col.rgb += uAccent * g;',
    '',
    '  vec2  rim    = abs(vUv - 0.5) * 2.0;',
    '  float rimStr = pow(max(rim.x, rim.y), 4.5);',
    '  col.rgb     += uAccent * rimStr * (0.28 + uActive * 0.72) * 1.1;',
    '',
    '  float corner  = pow(rim.x * rim.y, 2.2);',
    '  col.rgb      += uAccent * corner * 0.35 * uActive;',
    '',
    '  float vig = 1.0 - smoothstep(0.3, 1.05, length(vUv - 0.5));',
    '  col.rgb  *= 0.52 + vig * 0.48;',
    '',
    '  col.rgb += uSpin * 0.4 * uAccent;',
    '  gl_FragColor = col;',
    '}'
  ].join('\n');

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     COMPOSITE PASS SHADER
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var COMP_VERT = 'varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position, 1.0); }';

  var COMP_FRAG = [
    'precision highp float;',
    'uniform sampler2D uScene;',
    'uniform float     uTime;',
    'uniform float     uFlash;',
    'uniform vec2      uRes;',
    'uniform vec3      uAccentFog;',
    'varying vec2      vUv;',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
    '}',
    '',
    'void main() {',
    '  vec2 uv  = vUv;',
    '  vec2 dc  = uv - 0.5;',
    '  float r2 = dot(dc, dc);',
    '  uv       = uv + dc * r2 * 0.055;',
    '',
    '  float split = 0.0022 + uFlash * 0.018;',
    '  vec4 col;',
    '  col.r = texture2D(uScene, uv + vec2( split,  0.0)).r;',
    '  col.g = texture2D(uScene, uv + vec2( 0.0,   split * 0.3)).g;',
    '  col.b = texture2D(uScene, uv - vec2( split,  0.0)).b;',
    '  col.a = 1.0;',
    '',
    '  float scanA = 0.035 + uFlash * 0.055;',
    '  col.rgb -= step(0.5, fract(uv.y * uRes.y * 0.5)) * scanA;',
    '',
    '  float grain = (hash(uv + fract(uTime * 0.083)) - 0.5) * 0.042;',
    '  col.rgb += grain;',
    '',
    '  float dark = 1.0 - dot(col.rgb, vec3(0.333));',
    '  col.rgb   += uAccentFog * dark * 0.09;',
    '',
    '  float v  = 1.0 - smoothstep(0.32, 1.05, length((uv - 0.5) * 1.45));',
    '  col.rgb *= 0.12 + v * 0.88;',
    '',
    '  col.rgb += uFlash * 0.62;',
    '  gl_FragColor = col;',
    '}'
  ].join('\n');

  var compMat = new THREE.ShaderMaterial({
    uniforms: {
      uScene:     { value: rt.texture },
      uTime:      { value: 0 },
      uFlash:     { value: 0 },
      uRes:       { value: new THREE.Vector2(W, H) },
      uAccentFog: { value: new THREE.Vector3(0.16, 0.59, 1.0) }
    },
    vertexShader: COMP_VERT, fragmentShader: COMP_FRAG,
    depthTest: false, depthWrite: false
  });
  sceneB.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat));

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     GRID FLOOR SHADER
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var GRID_VERT = [
    'varying vec3 vWorld;',
    'void main() {',
    '  vWorld      = position;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  var GRID_FRAG = [
    'precision highp float;',
    'uniform float uTime;',
    'uniform vec3  uAccent;',
    'varying vec3  vWorld;',
    '',
    'void main() {',
    '  vec2 p  = vWorld.xz;',
    '  vec2 g1 = abs(fract(p * 0.5) - 0.5);',
    '  vec2 g2 = abs(fract(p * 0.1) - 0.5);',
    '  float line1 = 1.0 - smoothstep(0.0, 0.02, min(g1.x, g1.y));',
    '  float line2 = 1.0 - smoothstep(0.0, 0.02, min(g2.x, g2.y));',
    '  float g = max(line1 * 0.55, line2 * 0.3);',
    '  float dist = length(p);',
    '  float fade = 1.0 - smoothstep(18.0, 72.0, dist);',
    '  float scan = smoothstep(0.92, 1.0, sin(p.y * 0.18 - uTime * 1.2)) * 0.35;',
    '  vec3 col = uAccent * (g + scan) * fade;',
    '  gl_FragColor = vec4(col, (g + scan) * fade * 0.85);',
    '}'
  ].join('\n');

  var gridMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uAccent: { value: PROJECTS[0].accent.clone() }
    },
    vertexShader: GRID_VERT, fragmentShader: GRID_FRAG,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide
  });
  var gridMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(200, N * 18.0 + 40, 2, 2),
    gridMat
  );
  gridMesh.rotation.x = -Math.PI / 2;
  gridMesh.position.set(0, -4.5, -(N * 18.0) / 2 + 8);
  sceneA.add(gridMesh);

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     CARDS
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var CARD_W    = 9.6;
  var CARD_H    = 5.8;
  var RAIL_STEP = 18.0;
  var CAM_BASE  =  8.0;

  var cardMeshes = [];
  var spinVals   = new Float32Array(N);
  var texLoader  = new THREE.TextureLoader();
  var textures   = new Array(N).fill(null);
  var texAspects = new Array(N).fill(16 / 9);

  function makeCard(i) {
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex:     { value: null },
        uTime:    { value: 0 },
        uActive:  { value: i === 0 ? 1.0 : 0.0 },
        uSpin:    { value: 0.0 },
        uAspImg:  { value: 16 / 9 },
        uAspCard: { value: CARD_W / CARD_H },
        uAccent:  { value: PROJECTS[i].accent.clone() }
      },
      vertexShader: CARD_VERT, fragmentShader: CARD_FRAG,
      side: THREE.FrontSide
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H, 40, 24), mat);
    mesh.position.set(0, 0, -i * RAIL_STEP);
    sceneA.add(mesh);
    cardMeshes.push(mesh);
  }
  for (var ci = 0; ci < N; ci++) makeCard(ci);

  function loadTexAt(i) {
    if (textures[i] !== null) return;
    textures[i] = '__loading__';
    (function (idx) {
      texLoader.load(PROJECTS[idx].image, function (tex) {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        textures[idx]   = tex;
        texAspects[idx] = tex.image.naturalWidth / tex.image.naturalHeight || 16 / 9;
        cardMeshes[idx].material.uniforms.uTex.value    = tex;
        cardMeshes[idx].material.uniforms.uAspImg.value = texAspects[idx];
      }, undefined, function () { textures[idx] = null; });
    }(i));
  }

  loadTexAt(0); loadTexAt(1);
  setTimeout(function () { for (var j = 2; j < N; j++) loadTexAt(j); }, 500);

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     AMBIENT GLOW QUADS
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var glowMeshes = [];
  for (var gi = 0; gi < N; gi++) {
    var ac = PROJECTS[gi].accent;
    var gm = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W * 2.8, CARD_H * 2.8),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(ac.r * 0.12, ac.g * 0.12, ac.b * 0.12),
        transparent: true, opacity: 0.22,
        depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      })
    );
    gm.position.set(0, 0, -gi * RAIL_STEP - 0.8);
    sceneA.add(gm);
    glowMeshes.push(gm);
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     PARTICLE FIELD
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var PART_N = 3600;
  var pPos   = new Float32Array(PART_N * 3);
  var pPhase = new Float32Array(PART_N);
  var pSpeed = new Float32Array(PART_N);

  for (var pi = 0; pi < PART_N; pi++) {
    pPos[pi * 3]     = (Math.random() - 0.5) * 22;
    pPos[pi * 3 + 1] = (Math.random() - 0.5) * 14;
    pPos[pi * 3 + 2] = -Math.random() * N * RAIL_STEP;
    pPhase[pi] = Math.random() * Math.PI * 2;
    pSpeed[pi] = 0.003 + Math.random() * 0.009;
  }

  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  var PART_VERT = [
    'void main() {',
    '  vec4 mvPos    = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize  = 2.5 / -mvPos.z * 180.0;',
    '  gl_Position   = projectionMatrix * mvPos;',
    '}'
  ].join('\n');

  var PART_FRAG = [
    'precision mediump float;',
    'uniform vec3 uAccent;',
    'void main() {',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - smoothstep(0.0, 0.5, d);',
    '  gl_FragColor = vec4(uAccent * 1.4, a * 0.65);',
    '}'
  ].join('\n');

  var pMat = new THREE.ShaderMaterial({
    uniforms: { uAccent: { value: PROJECTS[0].accent.clone() } },
    vertexShader: PART_VERT, fragmentShader: PART_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  sceneA.add(new THREE.Points(pGeo, pMat));

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     STATE
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  var idx        = 0;
  var camZTarget = CAM_BASE;
  var camZCur    = CAM_BASE;
  var camYOffset = 0;
  var camYTarget = 0;
  var tRX = 0, tRY = 0;
  var tiltRX = 0, tiltRY = 0;
  var flash      = 0;
  var inTransit  = false;
  var wheelAcc   = 0;
  var wheelLock  = false;
  var dragStartX = null;

  function camZOf(i) { return CAM_BASE - i * RAIL_STEP; }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     NAVIGATION
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function goTo(next) {
    next = ((next % N) + N) % N;
    if (inTransit || next === idx) return;

    var prev  = idx;
    idx       = next;
    inTransit = true;
    flash     = 1.0;
    spinVals[prev] = 1.0;

    camZTarget = camZOf(next);
    camYTarget = -1.8;
    setTimeout(function () { camYTarget = 0; }, 420);

    if (textures[next] === null) loadTexAt(next);
    var nn = (next + 1) % N;
    if (textures[nn] === null)  loadTexAt(nn);

    setInfo(next, true);
    setProgress(next);
    updateDots();

    setTimeout(function () {
      pMat.uniforms.uAccent.value    = PROJECTS[next].accent.clone();
      gridMat.uniforms.uAccent.value = PROJECTS[next].accent.clone();
    }, 300);

    setTimeout(function () { inTransit = false; }, 900);
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     INFO PANEL
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function setInfo(i, animate) {
    var p = PROJECTS[i];

    function write() {
      if (elCurrent)  elCurrent.textContent  = String(i + 1).padStart(2, '0');
      if (elCategory) elCategory.textContent = p.category;
      if (elYear)     elYear.textContent     = p.year;
      if (elTitle)    elTitle.textContent    = p.title;
      if (elDesc)     elDesc.textContent     = p.desc;
      if (elTags) {
        elTags.innerHTML = p.tags.map(function (t) {
          return '<span>' + t + '</span>';
        }).join('');
      }

      var c   = p.accent;
      var rgb = 'rgb(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ')';
      if (elCurrent)  elCurrent.style.color  = rgb;
      if (elCategory) elCategory.style.color = rgb;
      if (elFill)     elFill.style.background = rgb;

      var modal = document.getElementById('modal-' + p.id);
      if (elView) {
        elView.style.display = modal ? '' : 'none';
        elView.onclick = function () { openModal(p.id); };
      }
    }

    if (animate) {
      var targets = [elCategory, elYear, elTitle, elDesc, elTags];
      targets.forEach(function (el) {
        if (!el) return;
        el.style.transition = 'none';
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(18px)';
      });
      setTimeout(function () {
        write();
        targets.forEach(function (el, j) {
          if (!el) return;
          setTimeout(function () {
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            el.style.opacity    = '1';
            el.style.transform  = 'translateY(0)';
          }, j * 50);
        });
      }, 230);
    } else {
      write();
    }
  }

  function openModal(id) {
    var modal = document.getElementById('modal-' + id);
    if (!modal) return;
    document.body.classList.add('modal-open');
    modal.classList.add('show');
  }

  function setProgress(i) {
    if (!elFill) return;
    elFill.style.width = ((i / (N - 1)) * 100) + '%';
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     DOTS
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (elDots) {
    PROJECTS.forEach(function (p, i) {
      var dot = document.createElement('button');
      dot.className = 'proj-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', p.title);
      dot.addEventListener('click', function () { goTo(i); });
      var tip = document.createElement('span');
      tip.className = 'dot-tip';
      tip.textContent = p.title;
      dot.appendChild(tip);
      elDots.appendChild(dot);
    });
  }

  function updateDots() {
    if (!elDots) return;
    elDots.querySelectorAll('.proj-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     EVENTS
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (elPrev) elPrev.addEventListener('click', function () { goTo(idx - 1); });
  if (elNext) elNext.addEventListener('click', function () { goTo(idx + 1); });

  document.addEventListener('keydown', function (e) {
    if (document.body.classList.contains('modal-open')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') goTo(idx + 1);
    if (e.key === 'ArrowLeft')  goTo(idx - 1);
  });

  /* Wheel â€” only fires when showcase is in viewport */
  var inView = false;
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
    }, { threshold: 0.5 }).observe(wrap);
  }

  wrap.addEventListener('wheel', function (e) {
    if (!inView) return;
    e.preventDefault();
    wheelAcc += e.deltaY;
    if (!wheelLock && Math.abs(wheelAcc) > 80) {
      goTo(idx + (wheelAcc > 0 ? 1 : -1));
      wheelAcc  = 0;
      wheelLock = true;
      setTimeout(function () { wheelLock = false; }, 700);
    }
  }, { passive: false });

  /* Touch swipe */
  var touchX = null, touchY = null;
  canvas.addEventListener('touchstart', function (e) {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = touchY = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      goTo(idx + (dx < 0 ? 1 : -1));
    } else if (Math.abs(dy) > 55) {
      goTo(idx + (dy < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* Mouse drag + click */
  var dragDist = 0;
  canvas.addEventListener('mousedown', function (e) {
    dragStartX = e.clientX;
    dragDist   = 0;
  });
  canvas.addEventListener('mousemove', function (e) {
    if (dragStartX !== null) dragDist = Math.abs(e.clientX - dragStartX);
  });
  canvas.addEventListener('mouseup', function (e) {
    if (dragStartX === null) return;
    var dx = e.clientX - dragStartX;
    dragStartX = null;
    if (Math.abs(dx) > 50) {
      goTo(idx + (dx < 0 ? 1 : -1));
    }
  });
  canvas.addEventListener('mouseleave', function () { dragStartX = null; });

  /* Click opens modal (only if not dragging) */
  canvas.addEventListener('click', function () {
    if (dragDist > 8) return;
    openModal(PROJECTS[idx].id);
  });

  /* Mouse tilt */
  wrap.addEventListener('mousemove', function (e) {
    var r = wrap.getBoundingClientRect();
    tRY =  ((e.clientX - r.left) / r.width  - 0.5) * 0.20;
    tRX = -((e.clientY - r.top)  / r.height - 0.5) * 0.11;
  });
  wrap.addEventListener('mouseleave', function () { tRX = 0; tRY = 0; });

  /* Resize */
  var rTO;
  window.addEventListener('resize', function () {
    clearTimeout(rTO);
    rTO = setTimeout(function () {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      renderer.setSize(W, H);
      rt.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      compMat.uniforms.uRes.value.set(W, H);
    }, 120);
  });

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     INIT
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  setInfo(0, false);
  setProgress(0);

  var LERP_CAM    = 0.042;
  var LERP_TILT   = 0.06;
  var LERP_ACTIVE = 0.038;
  var LERP_Y      = 0.07;
  var FLASH_DECAY = 0.87;

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     RENDER LOOP
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  function tick(ts) {
    requestAnimationFrame(tick);
    var t = ts * 0.001;

    /* Camera Z */
    camZCur    += (camZTarget - camZCur)    * LERP_CAM;
    camYOffset += (camYTarget - camYOffset) * LERP_Y;
    camera.position.set(0, camYOffset, camZCur);

    /* Tilt */
    tiltRX += (tRX - tiltRX) * LERP_TILT;
    tiltRY += (tRY - tiltRY) * LERP_TILT;
    camera.rotation.set(tiltRX, tiltRY, 0);

    /* Flash */
    flash *= FLASH_DECAY;
    compMat.uniforms.uFlash.value = flash;
    compMat.uniforms.uTime.value  = t;

    /* Accent fog lerp */
    var ca  = PROJECTS[idx].accent;
    var cfg = compMat.uniforms.uAccentFog.value;
    cfg.x  += (ca.r - cfg.x) * 0.025;
    cfg.y  += (ca.g - cfg.y) * 0.025;
    cfg.z  += (ca.b - cfg.z) * 0.025;

    gridMat.uniforms.uTime.value = t;

    /* Per-card */
    for (var i = 0; i < N; i++) {
      var mu = cardMeshes[i].material.uniforms;
      mu.uTime.value += (t - mu.uTime.value) * 0.15; /* gentle time lerp */
      mu.uTime.value  = t;
      var ta = (i === idx) ? 1.0 : 0.0;
      mu.uActive.value += (ta - mu.uActive.value) * LERP_ACTIVE;
      if (spinVals[i] > 0.001) {
        spinVals[i]  *= 0.918;
        mu.uSpin.value = spinVals[i];
      } else {
        spinVals[i] = mu.uSpin.value = 0;
      }
      glowMeshes[i].material.opacity = 0.07 + mu.uActive.value * 0.30;
    }

    /* Particle drift */
    var pp = pGeo.attributes.position.array;
    for (var pi2 = 0; pi2 < PART_N; pi2++) {
      var b  = pi2 * 3;
      pp[b]     += Math.sin(t * 0.38 + pPhase[pi2]) * pSpeed[pi2] * 0.45;
      pp[b + 1] += Math.cos(t * 0.29 + pPhase[pi2]) * pSpeed[pi2] * 0.35;
    }
    pGeo.attributes.position.needsUpdate = true;

    /* Two-pass render */
    renderer.setRenderTarget(rt);
    renderer.clear();
    renderer.render(sceneA, camera);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(sceneB, cameraB);
  }

  requestAnimationFrame(tick);

}());
