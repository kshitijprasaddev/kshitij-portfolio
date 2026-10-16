/* Illustrative autonomy lab. No real vehicle data, metrics, or network calls. */
import * as THREE from './vendor/three.module.min.js';

(() => {
  'use strict';
  const lab = document.getElementById('autonomy-lab');
  const canvas = document.getElementById('autonomy-canvas');
  if (!lab || !canvas || typeof THREE === 'undefined') return;
  const toggle = document.getElementById('scene-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch {
    canvas.hidden = true;
    return; // The inline SVG and all portfolio content stay visible.
  }
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0e12, 0.045);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(7.2, 6, 8.5);
  camera.lookAt(0, 0, 0);
  const world = new THREE.Group();
  world.rotation.y = -0.2;
  scene.add(world);
  scene.add(new THREE.AmbientLight(0xb8dfee, 2));
  const light = new THREE.DirectionalLight(0xeffaff, 3);
  light.position.set(3, 6, 2);
  scene.add(light);
  const rim = new THREE.PointLight(0x75d9ee, 20, 12);
  rim.position.set(-2, 2, -2);
  scene.add(rim);

  const grid = new THREE.GridHelper(16, 32, 0x36576b, 0x1b303e);
  grid.position.y = -1.4;
  grid.material.transparent = true;
  grid.material.opacity = 0.48;
  world.add(grid);

  // Seeded point field: the composition stays stable across reloads.
  let seed = 42;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const positions = [];
  const colors = [];
  const count = innerWidth < 620 ? 1800 : 3800;
  for (let i = 0; i < count; i++) {
    const x = (random() - 0.5) * 15;
    const z = (random() - 0.5) * 14;
    const radius = Math.hypot(x, z);
    let y = -1.35;
    if (radius > 3) y += Math.max(0, Math.sin(x * 0.8) * Math.cos(z * 0.6)) * (radius - 2) * 0.35;
    positions.push(x, y, z);
    const brightness = 0.25 + random() * 0.55;
    colors.push(0.22 * brightness, 0.7 * brightness, 0.88 * brightness);
  }
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const field = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
  world.add(field);

  const cyan = new THREE.LineBasicMaterial({ color: 0x75d9ee, transparent: true, opacity: 0.8 });
  const muted = new THREE.LineBasicMaterial({ color: 0x3b647c, transparent: true, opacity: 0.5 });
  const orange = new THREE.LineBasicMaterial({ color: 0xf0b278, transparent: true, opacity: 0.9 });
  function line(points, material = cyan) {
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
  }
  function circle(radius, height, material = cyan) {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const angle = i / 100 * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
    }
    return line(points, material);
  }
  world.add(circle(1.1, -1.35, orange), circle(1.55, -1.35, muted), circle(2.05, -1.35, muted));
  world.add(line([new THREE.Vector3(-0.45,-1.34,0), new THREE.Vector3(0.45,-1.34,0)],orange));
  world.add(line([new THREE.Vector3(0,-1.34,-0.45), new THREE.Vector3(0,-1.34,0.45)],orange));
  const sweep = new THREE.Mesh(new THREE.RingGeometry(2.08, 2.11, 90, 1, 0, Math.PI * 0.55), new THREE.MeshBasicMaterial({ color: 0x75d9ee, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }));
  sweep.rotation.x = -Math.PI / 2;
  sweep.position.y = -1.33;
  world.add(sweep);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4.7, 0.2, -2.3), new THREE.Vector3(-3.1, 1.3, -2.2),
    new THREE.Vector3(-1.6, 2.1, -1.8), new THREE.Vector3(1.2, 2.3, -1.3),
    new THREE.Vector3(2.7, 1.5, 0.2), new THREE.Vector3(1.9, 0.45, 1.8),
    new THREE.Vector3(0.4, -0.3, 1.3), new THREE.Vector3(0, -0.8, 0)
  ]);
  const trajectory = line(path.getPoints(180), new THREE.LineDashedMaterial({ color: 0x75d9ee, dashSize: 0.065, gapSize: 0.08, transparent: true, opacity: 0.65 }));
  trajectory.computeLineDistances();
  world.add(trajectory);

  const drone = new THREE.Group();
  const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x1d2f3f, metalness: 0.75, roughness: 0.35 });
  const shell = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.6), hullMaterial);
  drone.add(shell);
  const shellEdges = new THREE.LineSegments(new THREE.EdgesGeometry(shell.geometry), cyan);
  drone.add(shellEdges);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.3), new THREE.MeshBasicMaterial({ color: 0x75d9ee }));
  top.position.y = 0.17;
  drone.add(top);
  const rotors = [];
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x527184, metalness: 0.8, roughness: 0.35 });
  const rotorMaterial = new THREE.MeshBasicMaterial({ color: 0x75d9ee, transparent: true, opacity: 0.7 });
  [-1, 1].forEach(x => [-1, 1].forEach(z => {
    const end = new THREE.Vector3(x * 0.95, 0, z * 0.95);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, end.length(), 6), armMaterial);
    arm.position.copy(end).multiplyScalar(0.5);
    arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().normalize());
    drone.add(arm);
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 12), hullMaterial);
    motor.position.copy(end);
    drone.add(motor);
    const rotor = new THREE.Group();
    rotor.position.copy(end);
    rotor.position.y = 0.15;
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.012, 0.07), rotorMaterial);
    rotor.add(blade);
    drone.add(rotor);
    rotors.push(rotor);
    const halo = circle(0.54, 0.16, muted);
    halo.position.copy(end);
    drone.add(halo);
    const leg = line([new THREE.Vector3(x * 0.3,-0.1,z * 0.2), new THREE.Vector3(x * 0.5,-0.5,z * 0.4)], cyan);
    drone.add(leg);
  }));
  drone.position.set(0, 1.25, 0);
  drone.rotation.y = 0.2;
  world.add(drone);
  const dropGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-1.3,0),new THREE.Vector3(0,1,0)]);
  const drop = new THREE.Line(dropGeometry, new THREE.LineDashedMaterial({ color: 0xf0b278, dashSize: 0.06, gapSize: 0.1, transparent: true, opacity: 0.5 }));
  drop.computeLineDistances();
  world.add(drop);

  const pointer = { x: 0, y: 0 };
  lab.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = lab.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.16;
  });
  lab.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
  let paused = reducedMotion.matches;
  let visible = true;
  let lost = false;
  let raf = 0;
  let time = 0;
  let lastFrame = 0;
  function render(now) {
    raf = 0;
    if (!visible || document.hidden || lost || paused) return;
    if (now - lastFrame > 32) {
      time += Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      drone.position.set(Math.sin(time * 0.45) * 0.32, 1.1 + Math.sin(time * 0.8) * 0.22, Math.cos(time * 0.45) * 0.18);
      drone.rotation.z = Math.sin(time * 0.8) * 0.035;
      rotors.forEach((rotor, i) => { rotor.rotation.y = time * (i % 2 ? 16 : -16); });
      sweep.rotation.z = time * 0.4;
      world.rotation.y += (-0.2 + pointer.x - world.rotation.y) * 0.045;
      world.rotation.x += (pointer.y - world.rotation.x) * 0.045;
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(render);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play 3D animation' : 'Pause 3D animation');
    toggle.innerHTML = paused ? 'Play <span aria-hidden="true">▷</span>' : 'Pause <span aria-hidden="true">Ⅱ</span>';
    if (!paused && visible && !document.hidden && !lost) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(render);
    }
  }
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { rootMargin: '40px' });
  intersection.observe(lab);
  function resize() {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
    renderer.setSize(lab.clientWidth, lab.clientHeight, false);
    camera.aspect = lab.clientWidth / lab.clientHeight;
    camera.updateProjectionMatrix();
    if (!lost) renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(lab);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost = true; lab.classList.remove('scene-ready'); toggle.hidden = true; sync();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false; lab.classList.add('scene-ready'); toggle.hidden = false; resize(); sync();
  });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); });
  window.addEventListener('pageshow', sync);
  resize();
  lab.classList.add('scene-ready');
  toggle.hidden = false;
  sync();
})();
