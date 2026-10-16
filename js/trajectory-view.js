/* Illustrative flight study. Readouts describe this scene, not measured flight telemetry. */
import * as THREE from './vendor/three.module.min.js';

(() => {
  'use strict';
  const view = document.getElementById('trajectory-view');
  const canvas = document.getElementById('trajectory-canvas');
  const stage = view?.querySelector('.trajectory-stage');
  const slider = document.getElementById('trajectory-progress');
  const phaseOutput = document.getElementById('trajectory-phase');
  const playButton = document.getElementById('trajectory-play');
  const cameraButton = document.getElementById('trajectory-orbit');
  const resetButton = document.getElementById('trajectory-reset');
  const timeOutput = document.getElementById('sim-time');
  const altitudeOutput = document.getElementById('sim-altitude');
  const offsetOutput = document.getElementById('sim-offset');
  const cameraOutput = document.getElementById('sim-camera-name');
  const phaseButtons = [...(view?.querySelectorAll('[data-phase]') || [])];
  if (!view || !canvas || !stage || !slider || !phaseOutput) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DURATION = 26, DECK_HEIGHT = 0.57, SKID_HEIGHT = 0.405;
  const cameraNames = ['Wide', 'Follow', 'Top'];
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: 'default' });
  } catch { return; }
  renderer.setClearColor(0x151c1e, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151c1e);
  scene.fog = new THREE.Fog(0x151c1e, 16, 43);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 75);
  const desiredCamera = new THREE.Vector3(), desiredFocus = new THREE.Vector3(), desiredUp = new THREE.Vector3(), cameraFocus = new THREE.Vector3();
  const CAMERA_TRANSITION_DURATION = 0.82;
  let cameraIndex = 0, snapCamera = true, cameraTransition = null;
  scene.add(new THREE.HemisphereLight(0xc0d4dc, 0x3e4437, 2.1));
  const key = new THREE.DirectionalLight(0xffcea4, 3.4);
  key.position.set(-5.5, 9, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 8, bottom: -8, near: 1, far: 25 });
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0002;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8ba8b9, 1.7);
  fill.position.set(5, 5, -7); scene.add(fill);
  const materials = {
    carbon: new THREE.MeshStandardMaterial({ color: 0x1d292d, metalness: 0.34, roughness: 0.57 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x78868a, metalness: 0.72, roughness: 0.43 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x303c3f, metalness: 0.63, roughness: 0.49 }),
    black: new THREE.MeshStandardMaterial({ color: 0x0e171b, metalness: 0.22, roughness: 0.65 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb97e57, metalness: 0.56, roughness: 0.38 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x172022, roughness: 0.97 }),
    platform: new THREE.MeshStandardMaterial({ color: 0x64716c, metalness: 0.3, roughness: 0.68 }),
    deck: new THREE.MeshStandardMaterial({ color: 0x9b9f8d, metalness: 0.08, roughness: 0.84 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x303c3a, metalness: 0.1, roughness: 0.96 })
  };
  function mesh(geometry, material, parent = scene, position) {
    const object = new THREE.Mesh(geometry, material);
    if (position) object.position.set(...position);
    object.castShadow = true; object.receiveShadow = true; parent.add(object);
    return object;
  }
  function box(w, h, d, material, parent, position) { return mesh(new THREE.BoxGeometry(w, h, d), material, parent, position); }
  function rod(a, b, radius, material, parent, sides = 10) {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b), delta = to.clone().sub(from);
    const object = mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), sides), material, parent);
    object.position.copy(from).add(to).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return object;
  }
  function roundedBox(w, h, d, radius, material, parent, position) {
    const x = -w / 2, y = -h / 2, s = new THREE.Shape();
    s.moveTo(x + radius, y); s.lineTo(x + w - radius, y);
    s.quadraticCurveTo(x + w, y, x + w, y + radius); s.lineTo(x + w, y + h - radius);
    s.quadraticCurveTo(x + w, y + h, x + w - radius, y + h); s.lineTo(x + radius, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - radius); s.lineTo(x, y + radius);
    s.quadraticCurveTo(x, y, x + radius, y);
    const geometry = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 3 });
    geometry.translate(0, 0, -d / 2);
    return mesh(geometry, material, parent, position);
  }

  // Physical floor, restrained lane markings and a sparse hangar edge.
  const floor = mesh(new THREE.PlaneGeometry(100, 100), materials.floor);
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x879184, transparent: true, opacity: 0.19, depthWrite: false });
  function floorMark(w, d, x, z, material = lineMaterial) {
    const mark = mesh(new THREE.PlaneGeometry(w, d), material, scene, [x, 0.004, z]);
    mark.rotation.x = -Math.PI / 2; mark.castShadow = false; mark.receiveShadow = false;
  }
  floorMark(19, 0.025, 0, -1.45); floorMark(19, 0.025, 0, 1.45);
  for (let i = -4; i <= 4; i++) {
    floorMark(0.55, 0.03, i * 2, 0);
    floorMark(0.025, 0.20, i * 2, -1.45); floorMark(0.025, 0.20, i * 2, 1.45);
  }
  const backgroundMaterial = new THREE.MeshStandardMaterial({ color: 0x243031, metalness: 0.25, roughness: 0.85 });
  box(24, 0.35, 0.8, backgroundMaterial, scene, [0, 0.175, -10.5]);
  [-10, -5, 0, 5, 10].forEach(x => {
    box(0.18, 6, 0.26, backgroundMaterial, scene, [x, 3, -11]);
    box(0.48, 0.08, 0.42, materials.darkMetal, scene, [x, 0.05, -10.9]);
  });
  const zoneMaterial = new THREE.MeshBasicMaterial({ color: 0xb68d62, transparent: true, opacity: 0.16 });
  floorMark(0.8, 0.025, -4.3, 3.0, zoneMaterial); floorMark(0.025, 0.8, -4.7, 2.6, zoneMaterial);
  floorMark(0.8, 0.025, 4.3, -3.0, zoneMaterial); floorMark(0.025, 0.8, 4.7, -2.6, zoneMaterial);

  // Translating landing cart with metal frame, wheels and a local fiducial texture.
  const cart = new THREE.Group(); scene.add(cart);
  box(2.5, 0.12, 1.76, materials.platform, cart, [0, 0.44, 0]);
  box(2.38, 0.07, 1.64, materials.deck, cart, [0, DECK_HEIGHT - 0.035, 0]);
  box(1.85, 0.13, 0.80, materials.darkMetal, cart, [0, 0.28, 0]);
  [-1, 1].forEach(x => [-1, 1].forEach(z => {
    rod([x * 0.87, 0.21, z * 0.59], [x * 0.87, 0.44, z * 0.59], 0.035, materials.metal, cart);
    const wheel = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.12, 20), materials.rubber, cart, [x * 0.87, 0.19, z * 0.72]); wheel.rotation.x = Math.PI / 2;
    const hub = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.125, 12), materials.metal, cart, [x * 0.87, 0.19, z * 0.72]); hub.rotation.x = Math.PI / 2;
  }));
  const markerCanvas = document.createElement('canvas'); markerCanvas.width = markerCanvas.height = 256;
  const ctx = markerCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e5e5d9'; ctx.fillRect(0, 0, 256, 256); ctx.fillStyle = '#10191b'; ctx.fillRect(30, 30, 196, 196);
    const cells = [[1,0,1,0,0],[1,1,0,1,1],[0,1,1,0,1],[1,0,0,1,0],[0,0,1,1,1]];
    ctx.fillStyle = '#e5e5d9'; cells.forEach((row, y) => row.forEach((cell, x) => { if (cell) ctx.fillRect(58 + x * 28, 58 + y * 28, 28, 28); }));
    const texture = new THREE.CanvasTexture(markerCanvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const marker = mesh(new THREE.PlaneGeometry(1.01, 1.01), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.96, metalness: 0 }), cart, [0, DECK_HEIGHT + 0.002, 0]);
    marker.rotation.x = -Math.PI / 2; marker.castShadow = false;
  }
  [-1, 1].forEach(sign => box(0.10, 0.015, 0.22, materials.copper, cart, [sign * 1.08, DECK_HEIGHT + 0.005, 0]));

  // Bevelled carbon fuselage, X arms, motor housings, paired props, gimbal and skids.
  const vehicle = new THREE.Group(); scene.add(vehicle);
  roundedBox(0.63, 0.18, 0.43, 0.055, materials.carbon, vehicle, [0, 0, 0]);
  roundedBox(0.48, 0.10, 0.29, 0.025, materials.black, vehicle, [0, 0.145, -0.015]);
  box(0.35, 0.012, 0.20, materials.darkMetal, vehicle, [0, 0.205, -0.015]);
  for (let i = -2; i <= 2; i++) box(0.014, 0.009, 0.13, materials.black, vehicle, [i * 0.053, 0.217, -0.015]);
  box(0.12, 0.013, 0.10, materials.copper, vehicle, [0, 0.105, 0.19]);
  [-1, 1].forEach(x => [-1, 1].forEach(z => mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), materials.metal, vehicle, [x * 0.25, 0.105, z * 0.14])));
  const propellers = [];
  const propBlurMaterial = new THREE.MeshBasicMaterial({ color: 0x889592, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false });
  const propBladeShape = new THREE.Shape();
  propBladeShape.moveTo(0.045, -0.022); propBladeShape.quadraticCurveTo(0.18, -0.067, 0.39, -0.025);
  propBladeShape.quadraticCurveTo(0.44, -0.012, 0.42, 0.006); propBladeShape.lineTo(0.13, 0.038); propBladeShape.lineTo(0.045, 0.022); propBladeShape.closePath();
  const bladeGeometry = new THREE.ExtrudeGeometry(propBladeShape, { depth: 0.008, bevelEnabled: false, curveSegments: 4 }); bladeGeometry.rotateX(-Math.PI / 2);
  const blurGeometry = new THREE.CircleGeometry(0.425, 48);
  [-1, 1].forEach(x => [-1, 1].forEach(z => {
    const end = [x * 0.73, 0, z * 0.66];
    rod([x * 0.20, -0.015, z * 0.13], end, 0.041, materials.carbon, vehicle, 12);
    rod([x * 0.17, -0.065, z * 0.12], [end[0], -0.07, end[2]], 0.016, materials.darkMetal, vehicle);
    mesh(new THREE.CylinderGeometry(0.108, 0.105, 0.15, 24), materials.black, vehicle, end);
    mesh(new THREE.CylinderGeometry(0.112, 0.112, 0.035, 24), materials.darkMetal, vehicle, [end[0], 0.075, end[2]]);
    mesh(new THREE.CylinderGeometry(0.057, 0.057, 0.025, 16), materials.metal, vehicle, [end[0], 0.106, end[2]]);
    const prop = new THREE.Group(); prop.position.set(end[0], 0.13, end[2]); vehicle.add(prop);
    mesh(bladeGeometry, materials.carbon, prop);
    const second = mesh(bladeGeometry, materials.carbon, prop); second.rotation.y = Math.PI;
    mesh(new THREE.CylinderGeometry(0.032, 0.042, 0.045, 12), materials.darkMetal, prop, [0, 0.02, 0]);
    const blur = mesh(blurGeometry, propBlurMaterial, vehicle, [end[0], 0.138, end[2]]);
    blur.rotation.x = -Math.PI / 2; blur.castShadow = false; blur.receiveShadow = false;
    propellers.push({ object: prop, direction: x * z });
  }));
  [-1, 1].forEach(z => {
    [-1, 1].forEach(x => rod([x * 0.20, -0.075, z * 0.14], [x * 0.27, -0.37, z * 0.28], 0.019, materials.darkMetal, vehicle));
    rod([-0.42, -0.385, z * 0.28], [0.42, -0.385, z * 0.28], 0.02, materials.black, vehicle, 12);
    rod([-0.42, -0.385, z * 0.28], [-0.49, -0.34, z * 0.28], 0.02, materials.black, vehicle, 12);
    rod([0.42, -0.385, z * 0.28], [0.49, -0.34, z * 0.28], 0.02, materials.black, vehicle, 12);
  });
  rod([0, -0.09, 0.20], [0, -0.19, 0.27], 0.035, materials.metal, vehicle);
  const gimbal = new THREE.Group(); gimbal.position.set(0, -0.205, 0.28); vehicle.add(gimbal);
  roundedBox(0.16, 0.11, 0.13, 0.016, materials.darkMetal, gimbal);
  const lens = mesh(new THREE.CylinderGeometry(0.047, 0.052, 0.041, 20), materials.black, gimbal, [0, 0, 0.08]); lens.rotation.x = Math.PI / 2;
  mesh(new THREE.CircleGeometry(0.036, 20), new THREE.MeshStandardMaterial({ color: 0x1d3745, metalness: 0.65, roughness: 0.16 }), gimbal, [0, 0, 0.102]);
  rod([-0.20, 0.17, -0.14], [-0.20, 0.35, -0.17], 0.008, materials.darkMetal, vehicle, 6);
  mesh(new THREE.SphereGeometry(0.022, 8, 6), materials.black, vehicle, [-0.20, 0.35, -0.17]);

  const relativePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.9, 2.75, 1.5), new THREE.Vector3(-3.1, 2.9, 1.05),
    new THREE.Vector3(-1.45, 2.0, 0.48), new THREE.Vector3(-0.25, 1.22, 0.09),
    new THREE.Vector3(-0.025, 0.55, 0.01), new THREE.Vector3(0, 0, 0)
  ], false, 'centripetal');
  const relativePoint = new THREE.Vector3();
  function cartAt(progress, destination) { return destination.set(-0.55 + progress * 1.32, 0, -0.12 + Math.sin(progress * Math.PI) * 0.12); }
  function flightAt(progress, destination) {
    cartAt(progress, destination); relativePath.getPoint(progress, relativePoint); destination.add(relativePoint);
    destination.y = Math.max(0, relativePoint.y) + DECK_HEIGHT + SKID_HEIGHT;
    return destination;
  }
  const routePoints = [];
  for (let i = 0; i <= 150; i++) routePoints.push(flightAt(i / 150, new THREE.Vector3()));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints), new THREE.LineBasicMaterial({ color: 0xba855e, transparent: true, opacity: 0.36, depthWrite: false })));
  const flownGeometry = new THREE.BufferGeometry().setFromPoints(routePoints);
  scene.add(new THREE.Line(flownGeometry, new THREE.LineBasicMaterial({ color: 0xd4a47d, transparent: true, opacity: 0.85 })));
  const dropGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const drop = new THREE.Line(dropGeometry, new THREE.LineDashedMaterial({ color: 0xb9bda6, transparent: true, opacity: 0.17, dashSize: 0.075, gapSize: 0.09, depthWrite: false })); scene.add(drop);
  const vehicleLabel = view.querySelector('.vehicle-label'), targetLabel = view.querySelector('.target-label');
  const projected = new THREE.Vector3(), labelPosition = new THREE.Vector3();
  let elapsed = 0, playing = !reducedMotion.matches, visible = false, hidden = document.hidden, modalOpen = Boolean(document.querySelector('.modal.show'));
  let width = 0, height = 0, raf = 0, lastTick = 0, lastRender = 0, lost = false, failed = false, dirty = true;
  function writeOutput(element, value) {
    if (!element || element.textContent === value) return;
    element.value = value; element.textContent = value;
  }
  function syncControls() {
    const progress = elapsed / DURATION, phaseIndex = progress < 0.50 ? 0 : progress < 0.80 ? 1 : 2;
    const phase = progress < 0.50 ? 'Approach' : progress < 0.80 ? 'Align' : progress < 0.995 ? 'Descend' : 'Touchdown';
    slider.value = String(Math.round(progress * 100)); slider.setAttribute('aria-valuetext', `${phase}, ${Math.round(progress * 100)} percent`);
    phaseButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === phaseIndex)));
    writeOutput(phaseOutput, phase);
    if (playButton) {
      const ended = elapsed >= DURATION;
      playButton.textContent = playing ? 'Pause' : ended ? 'Replay' : 'Play'; playButton.setAttribute('aria-pressed', String(playing));
      playButton.setAttribute('aria-label', playing ? 'Pause flight study' : ended ? 'Replay flight study' : 'Play flight study');
    }
    writeOutput(cameraOutput, cameraNames[cameraIndex]);
    cameraButton?.setAttribute('aria-label', `Change camera, current view ${cameraNames[cameraIndex]}`);
  }
  function positionLabel(label, point, yOffset) {
    if (!label) return;
    projected.copy(point).project(camera);
    label.style.visibility = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) < 0.9 && Math.abs(projected.y) < 0.9 && width > 580 ? 'visible' : 'hidden';
    label.style.left = `${(projected.x * 0.5 + 0.5) * width}px`; label.style.top = `${(-projected.y * 0.5 + 0.5) * height + yOffset}px`;
    label.style.transform = 'translate(-50%, -50%)';
  }
  function updateScene(delta) {
    const progress = elapsed / DURATION;
    cartAt(progress, cart.position); flightAt(progress, vehicle.position);
    const settling = 1 - THREE.MathUtils.smoothstep(progress, 0.78, 1);
    vehicle.rotation.set(Math.sin(progress * Math.PI) * 0.035 * settling, 0.28 + Math.sin(progress * 3) * 0.06 * settling, -0.075 * Math.sin(progress * Math.PI) * settling);
    gimbal.rotation.x = -Math.sin(progress * Math.PI) * 0.10;
    const rotorPower = 1 - THREE.MathUtils.smoothstep(progress, 0.97, 1);
    // Integrate the spin-down curve so rotors decelerate without reversing.
    const spinDown = THREE.MathUtils.clamp((progress - 0.97) / 0.03, 0, 1);
    const spinTime = DURATION * (Math.min(progress, 0.97) + 0.03 * (spinDown - spinDown ** 3 + spinDown ** 4 / 2));
    propellers.forEach(({ object, direction }, index) => { object.rotation.y = direction * spinTime * 97 + index * 0.72; });
    propBlurMaterial.opacity = playing ? 0.10 * rotorPower : 0.025;
    flownGeometry.setDrawRange(0, Math.floor(progress * 150) + 1);
    const positions = dropGeometry.attributes.position;
    positions.setXYZ(0, vehicle.position.x, vehicle.position.y - SKID_HEIGHT, vehicle.position.z);
    positions.setXYZ(1, vehicle.position.x, DECK_HEIGHT, vehicle.position.z); positions.needsUpdate = true; drop.computeLineDistances();
    const mobile = camera.aspect < 1.15;
    if (cameraIndex === 0) {
      desiredFocus.copy(vehicle.position).multiplyScalar(0.42).addScaledVector(cart.position, 0.58); desiredFocus.y = 1.35;
      const framing = mobile ? THREE.MathUtils.lerp(1.2, 0.78, THREE.MathUtils.smoothstep(progress, 0.15, 0.85)) : 1;
      desiredCamera.copy(desiredFocus).add(new THREE.Vector3(6.4 + Math.sin(progress * 1.5) * 0.26, 4.6, 8.4).multiplyScalar(framing));
      desiredUp.set(0, 1, 0);
    } else if (cameraIndex === 1) {
      desiredFocus.copy(vehicle.position); desiredFocus.y = Math.max(0.95, vehicle.position.y - 0.8);
      desiredCamera.copy(vehicle.position).add(new THREE.Vector3(4.2, 2.7, 5.3).multiplyScalar(mobile ? 1.25 : 1)); desiredUp.set(0, 1, 0);
    } else {
      desiredFocus.copy(vehicle.position).multiplyScalar(0.36).addScaledVector(cart.position, 0.64); desiredFocus.y = 0;
      desiredCamera.copy(desiredFocus).add(new THREE.Vector3(0.18, mobile ? 16.2 : 13.5, 0.35)); desiredUp.set(0, 0, -1);
    }
    if (snapCamera || reducedMotion.matches) {
      cameraTransition = null;
      camera.position.copy(desiredCamera); cameraFocus.copy(desiredFocus); camera.up.copy(desiredUp); snapCamera = false;
    } else if (cameraTransition) {
      // A finite transition also runs while the flight is paused. Visible-frame
      // delta keeps its time frozen when the study is offscreen or obscured.
      cameraTransition.elapsed = Math.min(CAMERA_TRANSITION_DURATION, cameraTransition.elapsed + delta);
      const t = cameraTransition.elapsed / CAMERA_TRANSITION_DURATION;
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      camera.position.lerpVectors(cameraTransition.position, desiredCamera, eased);
      cameraFocus.lerpVectors(cameraTransition.focus, desiredFocus, eased);
      camera.up.lerpVectors(cameraTransition.up, desiredUp, eased).normalize();
      if (t === 1) cameraTransition = null;
    } else if (!playing) {
      camera.position.copy(desiredCamera); cameraFocus.copy(desiredFocus); camera.up.copy(desiredUp);
    } else {
      const smoothing = 1 - Math.exp(-delta * 2.2); camera.position.lerp(desiredCamera, smoothing); cameraFocus.lerp(desiredFocus, smoothing);
      camera.up.copy(desiredUp);
    }
    camera.lookAt(cameraFocus); camera.updateMatrixWorld();
    positionLabel(vehicleLabel, vehicle.position, -45);
    labelPosition.copy(cart.position).add(new THREE.Vector3(0, DECK_HEIGHT, 0)); positionLabel(targetLabel, labelPosition, 56);
    writeOutput(timeOutput, `${elapsed.toFixed(1)} s`);
    writeOutput(altitudeOutput, `${Math.max(0, vehicle.position.y - SKID_HEIGHT - DECK_HEIGHT).toFixed(2)} m`);
    writeOutput(offsetOutput, `${Math.hypot(vehicle.position.x - cart.position.x, vehicle.position.z - cart.position.z).toFixed(2)} m`);
    syncControls();
  }
  function showFallback(permanent = false) {
    if (permanent) failed = true;
    view.classList.remove('trajectory-ready');
    if (vehicleLabel) vehicleLabel.style.visibility = 'hidden'; if (targetLabel) targetLabel.style.visibility = 'hidden';
    cancelAnimationFrame(raf); raf = 0; lastTick = 0;
  }
  function canRender() { return visible && !hidden && !modalOpen && !lost && !failed && width > 0 && height > 0; }
  function schedule() { if (!raf && canRender() && (playing || cameraTransition || dirty)) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    if (!canRender()) { lastTick = 0; return; }
    const delta = lastTick ? Math.min((now - lastTick) / 1000, 0.08) : 0;
    if ((playing || cameraTransition) && !dirty && now - lastRender < 1000 / 30) { schedule(); return; }
    lastTick = now; lastRender = now;
    if (playing) { elapsed = Math.min(DURATION, elapsed + delta); if (elapsed >= DURATION) playing = false; }
    try {
      updateScene(delta); renderer.render(scene, camera); view.classList.add('trajectory-ready'); dirty = false;
    } catch { showFallback(true); return; }
    schedule();
  }
  function invalidate() { dirty = true; schedule(); }
  function setProgress(value) {
    elapsed = THREE.MathUtils.clamp(value, 0, 1) * DURATION; playing = false; lastTick = 0; syncControls(); invalidate();
  }
  slider.addEventListener('input', () => setProgress(Number(slider.value) / 100));
  phaseButtons.forEach(button => button.addEventListener('click', () => setProgress(Number(button.dataset.phase))));
  playButton?.addEventListener('click', () => {
    if (elapsed >= DURATION) elapsed = 0;
    playing = !playing; lastTick = 0; syncControls(); invalidate();
  });
  resetButton?.addEventListener('click', () => {
    elapsed = 0; playing = false; cameraIndex = 0; lastTick = 0; snapCamera = true; syncControls(); invalidate();
  });
  cameraButton?.addEventListener('click', () => {
    cameraIndex = (cameraIndex + 1) % cameraNames.length;
    cameraTransition = !reducedMotion.matches && !snapCamera ? {
      elapsed: 0,
      position: camera.position.clone(),
      focus: cameraFocus.clone(),
      up: camera.up.clone()
    } : null;
    snapCamera = !cameraTransition;
    lastTick = 0; syncControls(); invalidate();
  });
  function resize() {
    const bounds = stage.getBoundingClientRect(); width = Math.round(bounds.width); height = Math.round(bounds.height);
    if (!width || !height || lost || failed) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.fov = camera.aspect < 1.15 ? 42 : 38; camera.updateProjectionMatrix(); snapCamera = true; invalidate();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  const intersectionObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) { cancelAnimationFrame(raf); raf = 0; lastTick = 0; }
    else { dirty = true; lastTick = 0; schedule(); }
  }, { threshold: 0.03 }); intersectionObserver.observe(stage);
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden;
    if (hidden) { cancelAnimationFrame(raf); raf = 0; lastTick = 0; }
    else { lastTick = 0; invalidate(); }
  });
  document.addEventListener('portfolio:modal-change', event => {
    modalOpen = Boolean(event.detail.open);
    if (modalOpen) { cancelAnimationFrame(raf); raf = 0; lastTick = 0; }
    else { lastTick = 0; invalidate(); }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) playing = false;
    lastTick = 0; syncControls(); invalidate();
  });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; dirty = true; showFallback(); });
  canvas.addEventListener('webglcontextrestored', () => { lost = false; lastTick = 0; resize(); });
  window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); raf = 0; lastTick = 0; });
  window.addEventListener('pageshow', () => { lastTick = 0; invalidate(); });
  // No pointer capture or wheel handlers: native touch scrolling remains intact.
  syncControls(); resize();
})();
