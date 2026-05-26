/**
 * WebGL Hero Scene — Three.js
 * Wireframe terrain with scan-line, glowing particles, connection lines, floating wireframes
 */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 60 : 150;
  const TERRAIN_SEG = isMobile ? 30 : 55;
  const TERRAIN_SIZE = 140;
  const CONNECT_DIST_SQ = 100;

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  /* ── Scene / Camera ── */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.012);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 12, 28);

  /* ── State ── */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollY = 0;
  const clock = new THREE.Clock();
  let frame = 0;

  /* ═══════════ TERRAIN ═══════════ */
  const terrainGeom = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEG, TERRAIN_SEG);
  const tPos = terrainGeom.attributes.position;
  const baseH = new Float32Array(tPos.count);

  for (let i = 0; i < tPos.count; i++) {
    const x = tPos.getX(i), y = tPos.getY(i);
    const h = Math.sin(x * 0.12) * Math.cos(y * 0.12) * 2.5
            + Math.sin(x * 0.04 + y * 0.06) * 4
            + Math.cos(x * 0.08 - y * 0.03) * 1.5;
    baseH[i] = h;
    tPos.setZ(i, h);
  }
  terrainGeom.computeVertexNormals();

  const terrainMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x84cc16) },
      uTime:  { value: 0 }
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      varying vec3 vPos;
      void main() {
        float scanY = mod(uTime * 14.0, 160.0) - 80.0;
        float scan  = smoothstep(4.0, 0.0, abs(vPos.y - scanY)) * 0.35;
        float dist  = length(vPos.xy);
        float fade  = smoothstep(75.0, 15.0, dist);
        gl_FragColor = vec4(uColor, (0.10 + scan) * fade);
      }
    `,
    wireframe: true,
    transparent: true,
    side: THREE.DoubleSide
  });

  const terrain = new THREE.Mesh(terrainGeom, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(0, -12, -25);
  scene.add(terrain);

  /* ═══════════ PARTICLES ═══════════ */
  const pGeom = new THREE.BufferGeometry();
  const pArr = new Float32Array(PARTICLE_COUNT * 3);
  const pSizes = new Float32Array(PARTICLE_COUNT);
  const pSpeeds = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pArr[i * 3]     = (Math.random() - 0.5) * 70;
    pArr[i * 3 + 1] = Math.random() * 28 - 4;
    pArr[i * 3 + 2] = (Math.random() - 0.5) * 70 - 15;
    pSizes[i] = Math.random() * 2.5 + 1;
    pSpeeds.push({
      x: (Math.random() - 0.5) * 0.012,
      y: (Math.random() - 0.5) * 0.006,
      z: (Math.random() - 0.5) * 0.012
    });
  }

  pGeom.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  pGeom.setAttribute('size',     new THREE.BufferAttribute(pSizes, 1));

  const pMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x84cc16) },
      uPR:    { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float size;
      uniform float uPR;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vA = smoothstep(100.0, 5.0, length(mv.xyz));
        gl_PointSize = clamp(size * uPR * (120.0 / -mv.z), 1.0, 20.0);
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float g = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
        gl_FragColor = vec4(uColor, g * vA * 0.7);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(pGeom, pMat);
  scene.add(particles);

  /* ═══════════ CONNECTION LINES (desktop only) ═══════════ */
  let cLines = null;
  if (!isMobile) {
    cLines = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({
        color: 0x84cc16, transparent: true, opacity: 0.04,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(cLines);
  }

  /* ═══════════ FLOATING WIREFRAMES (desktop only) ═══════════ */
  const shapes = [];
  if (!isMobile) {
    [
      { g: new THREE.IcosahedronGeometry(1.5, 0),  p: [-18,  6, -12], s:  0.003 },
      { g: new THREE.OctahedronGeometry(1, 0),     p: [ 22,  9, -22], s: -0.004 },
      { g: new THREE.TetrahedronGeometry(0.8, 0),  p: [ -9, 16, -32], s:  0.005 },
      { g: new THREE.IcosahedronGeometry(0.6, 0),  p: [ 14,  3,  -6], s: -0.003 }
    ].forEach(function (d) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x84cc16, wireframe: true, transparent: true, opacity: 0.08
      });
      const mesh = new THREE.Mesh(d.g, mat);
      mesh.position.set(d.p[0], d.p[1], d.p[2]);
      mesh.userData.rs = d.s;
      scene.add(mesh);
      shapes.push(mesh);
    });
  }

  /* ═══════════ EVENTS ═══════════ */
  document.addEventListener('mousemove', function (e) {
    mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length) {
      mouse.tx = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
      mouse.ty = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  }, { passive: true });
  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    pMat.uniforms.uPR.value = renderer.getPixelRatio();
  });

  /* ═══════════ RENDER LOOP ═══════════ */
  function updateConnections() {
    if (!cLines) return;
    const pos = particles.geometry.attributes.position.array;
    const lines = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const jx = j * 3, jy = jx + 1, jz = jx + 2;
        const dx = pos[ix] - pos[jx], dy = pos[iy] - pos[jy], dz = pos[iz] - pos[jz];
        if (dx * dx + dy * dy + dz * dz < CONNECT_DIST_SQ) {
          lines.push(pos[ix], pos[iy], pos[iz], pos[jx], pos[jy], pos[jz]);
        }
      }
    }
    cLines.geometry.dispose();
    const g = new THREE.BufferGeometry();
    if (lines.length) g.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    cLines.geometry = g;
  }

  (function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getElapsedTime();
    frame++;

    // Scroll fade
    const fade = Math.max(1 - scrollY / window.innerHeight, 0);
    canvas.style.opacity = fade;
    if (fade < 0.02) return;

    // Smooth mouse
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;

    // Camera
    camera.position.x = mouse.x * 5;
    camera.position.y = 12 + mouse.y * -3;
    camera.lookAt(0, 0, -25);

    // Terrain wave
    for (let i = 0; i < tPos.count; i++) {
      const x = tPos.getX(i), y = tPos.getY(i);
      tPos.setZ(i, baseH[i] + Math.sin(x * 0.2 + dt * 0.8) * 0.5 + Math.cos(y * 0.2 + dt * 0.6) * 0.4);
    }
    tPos.needsUpdate = true;
    terrainMat.uniforms.uTime.value = dt;

    // Particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      pArr[ix]     += pSpeeds[i].x;
      pArr[ix + 1] += pSpeeds[i].y + Math.sin(dt * 2 + i * 0.3) * 0.002;
      pArr[ix + 2] += pSpeeds[i].z;
      if (Math.abs(pArr[ix]) > 35)                       pSpeeds[i].x *= -1;
      if (pArr[ix + 1] > 24 || pArr[ix + 1] < -4)       pSpeeds[i].y *= -1;
      if (pArr[ix + 2] > 15 || pArr[ix + 2] < -50)      pSpeeds[i].z *= -1;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Shapes
    for (let s = 0; s < shapes.length; s++) {
      shapes[s].rotation.x += shapes[s].userData.rs;
      shapes[s].rotation.y += shapes[s].userData.rs * 0.7;
    }

    // Connection lines (every 5th frame)
    if (frame % 5 === 0) updateConnections();

    renderer.render(scene, camera);
  })();
})();
