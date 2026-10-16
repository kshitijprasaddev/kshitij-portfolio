/* Task geometry only. This is not a replay of measured flight telemetry. */
import * as THREE from './vendor/three.module.min.js';

(() => {
  'use strict';

  const view = document.getElementById('trajectory-view');
  const canvas = document.getElementById('trajectory-canvas');
  const stage = view?.querySelector('.trajectory-stage');
  const slider = document.getElementById('trajectory-progress');
  const output = document.getElementById('trajectory-phase');
  const orbit = document.getElementById('trajectory-orbit');
  const reset = document.getElementById('trajectory-reset');
  const phaseButtons = [...(view?.querySelectorAll('[data-phase]') || [])];
  if (!view || !canvas || !stage || !slider || !output) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
  } catch {
    return; // The accessible SVG remains visible if WebGL is unavailable.
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 3.4, -3.4, 0.1, 50);
  const lookAt = new THREE.Vector3(-0.2, 1.05, 0);
  const cameraViews = [
    new THREE.Vector3(7.6, 5.8, 8.6),
    new THREE.Vector3(8.8, 4.4, 3.9),
    new THREE.Vector3(-5.4, 7.8, 8.7)
  ];
  let cameraIndex = 0;

  scene.add(new THREE.AmbientLight(0xd8d9d0, 2.0));
  const key = new THREE.DirectionalLight(0xffead7, 3.0);
  key.position.set(-3, 8, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9baaa4, 1.3);
  fill.position.set(4, 3, -5);
  scene.add(fill);

  const graphite = new THREE.MeshStandardMaterial({ color: 0x272d2b, roughness: 0.96, metalness: 0.03 });
  const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x525a54, roughness: 0.84, metalness: 0.09 });
  const copper = new THREE.MeshStandardMaterial({ color: 0xb67655, roughness: 0.65, metalness: 0.12 });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xe3dfd1, roughness: 0.74, metalness: 0.05 });
  const quietLine = new THREE.LineBasicMaterial({ color: 0x737b72, transparent: true, opacity: 0.42 });
  const targetLine = new THREE.LineBasicMaterial({ color: 0xc7c8b9, transparent: true, opacity: 0.72 });

  const ground = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.07, 5.3), graphite);
  ground.position.y = -0.10;
  scene.add(ground);

  const perimeter = new THREE.LineSegments(new THREE.EdgesGeometry(ground.geometry), quietLine);
  perimeter.position.copy(ground.position);
  scene.add(perimeter);

  const target = new THREE.Group();
  const platform = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.10, 1.1), platformMaterial);
  platform.position.y = 0.01;
  target.add(platform);
  const landingArea = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.49, 0.063, -0.32),
    new THREE.Vector3(0.49, 0.063, -0.32),
    new THREE.Vector3(0.49, 0.063, 0.32),
    new THREE.Vector3(-0.49, 0.063, 0.32)
  ]), targetLine);
  target.add(landingArea);
  scene.add(target);

  // A quiet ground guide explains platform translation without adding a grid.
  const groundGuide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1.05, -0.058, 0.12),
    new THREE.Vector3(1.15, -0.058, 0.12)
  ]), quietLine);
  scene.add(groundGuide);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.7, 3.05, -1.05),
    new THREE.Vector3(-2.15, 2.9, -0.78),
    new THREE.Vector3(-1.35, 2.25, -0.28),
    new THREE.Vector3(-0.22, 1.25, 0.10),
    new THREE.Vector3(0.48, 0.66, 0.12),
    new THREE.Vector3(0.65, 0.16, 0.12)
  ], false, 'centripetal');
  const segments = 128;
  const radialSegments = 6;
  const fullPathMaterial = new THREE.MeshBasicMaterial({
    color: 0xb67655, transparent: true, opacity: 0.35, depthWrite: false
  });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(path, segments, 0.013, radialSegments, false), fullPathMaterial));
  const completedGeometry = new THREE.TubeGeometry(path, segments, 0.018, radialSegments, false);
  const completedPath = new THREE.Mesh(completedGeometry, copper);
  scene.add(completedPath);

  // A point marker represents the vehicle, rather than a decorative drone model.
  const vehicle = new THREE.Group();
  vehicle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 24), ivory));
  const markerRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.012, 5, 32), copper);
  markerRing.rotation.x = Math.PI / 2;
  vehicle.add(markerRing);
  scene.add(vehicle);

  const dropGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const drop = new THREE.Line(dropGeometry, new THREE.LineDashedMaterial({
    color: 0xadb3a6, transparent: true, opacity: 0.28, dashSize: 0.055, gapSize: 0.065
  }));
  scene.add(drop);

  const vehicleLabel = view.querySelector('.vehicle-label');
  const targetLabel = view.querySelector('.target-label');
  const projected = new THREE.Vector3();
  let progress = 0;
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;
  let dirty = true;
  let lost = false;
  let failed = false;

  function positionLabel(label, point, offsetY) {
    if (!label) return;
    projected.copy(point).project(camera);
    const inside = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) < 0.96 && Math.abs(projected.y) < 0.96;
    label.style.visibility = inside ? 'visible' : 'hidden';
    label.style.left = `${(projected.x * 0.5 + 0.5) * width}px`;
    label.style.top = `${(-projected.y * 0.5 + 0.5) * height + offsetY}px`;
    label.style.transform = 'translate(-50%, -50%)';
  }

  function fallback() {
    failed = true;
    view.classList.remove('trajectory-ready');
    if (vehicleLabel) vehicleLabel.style.visibility = 'hidden';
    if (targetLabel) targetLabel.style.visibility = 'hidden';
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function render() {
    frame = 0;
    if (!dirty || !visible || document.hidden || lost || failed || !width || !height) return;
    try {
      camera.position.copy(cameraViews[cameraIndex]);
      camera.lookAt(lookAt);
      camera.updateMatrixWorld();
      renderer.render(scene, camera);
      positionLabel(vehicleLabel, vehicle.position, -24);
      positionLabel(targetLabel, target.position, 32);
      view.classList.add('trajectory-ready');
      dirty = false;
    } catch {
      fallback();
    }
  }

  function requestRender() {
    dirty = true;
    if (!frame && visible && !document.hidden && !lost && !failed) frame = requestAnimationFrame(render);
  }

  function setProgress(value) {
    progress = Math.min(1, Math.max(0, value));
    path.getPointAt(progress, vehicle.position);
    target.position.set(-0.55 + progress * 1.2, 0, 0.12);
    completedGeometry.setDrawRange(0, Math.floor(progress * segments) * radialSegments * 6);
    const points = dropGeometry.attributes.position;
    points.setXYZ(0, vehicle.position.x, vehicle.position.y - 0.04, vehicle.position.z);
    points.setXYZ(1, vehicle.position.x, -0.055, vehicle.position.z);
    points.needsUpdate = true;
    drop.computeLineDistances();

    const nearest = phaseButtons.reduce((best, button) => (
      Math.abs(Number(button.dataset.phase) - progress) < Math.abs(Number(best?.dataset.phase ?? 0) - progress) ? button : best
    ), phaseButtons[0]);
    const phase = nearest?.textContent.trim().replace(/^\d+\s+/, '') || 'Approach';
    phaseButtons.forEach(button => button.setAttribute('aria-pressed', String(button === nearest)));
    slider.value = String(Math.round(progress * 100));
    slider.setAttribute('aria-valuetext', `${phase}, ${Math.round(progress * 100)} percent`);
    output.value = phase;
    output.textContent = phase;
    requestRender();
  }

  slider.addEventListener('input', () => setProgress(Number(slider.value) / 100));
  phaseButtons.forEach(button => button.addEventListener('click', () => setProgress(Number(button.dataset.phase))));
  orbit?.addEventListener('click', () => {
    cameraIndex = (cameraIndex + 1) % cameraViews.length;
    orbit.setAttribute('aria-label', `Rotate trajectory view, view ${cameraIndex + 1} of ${cameraViews.length}`);
    requestRender();
  });
  reset?.addEventListener('click', () => {
    cameraIndex = 0;
    orbit?.setAttribute('aria-label', 'Rotate trajectory view, view 1 of 3');
    setProgress(0);
  });

  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    if (!width || !height || failed || lost) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    const aspect = width / height;
    // Keep the complete plane in frame on narrow screens and camera presets.
    const halfHeight = Math.max(3.45, 5.4 / aspect);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    requestRender();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (dirty) requestRender();
  }, { rootMargin: '40px' });
  intersectionObserver.observe(view);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (dirty) requestRender();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    view.classList.remove('trajectory-ready');
    if (vehicleLabel) vehicleLabel.style.visibility = 'hidden';
    if (targetLabel) targetLabel.style.visibility = 'hidden';
    cancelAnimationFrame(frame);
    frame = 0;
    dirty = true;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    resize();
  });

  // There is no animation loop, including for visitors requesting reduced motion.
  // Every render follows a control, a resize or a visibility/context transition.
  setProgress(Number(slider.value) / 100);
  resize();
})();
