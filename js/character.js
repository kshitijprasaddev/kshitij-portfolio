/* ============================================================
   Hyper-Realistic 3D Robot Companion
   Controls: A/D or ←/→ = Walk  |  Space = Jump  |  Shift = Run  |  C = Toggle
   Robot walks alongside as you scroll — a game-like companion
   ============================================================ */
(function () {
  'use strict';

  if (window.innerWidth < 768 || !window.THREE) return;
  var canvas = document.getElementById('characterCanvas');
  if (!canvas) return;

  /* ─── Renderer (high quality) ──────────────────────────── */
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, alpha: true, antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
  camera.position.set(0, 1.2, 4.2);
  camera.lookAt(0, 0.7, 0);

  /* ─── Environment Map (HDR-like procedural) ────────────── */
  var pmremGen = new THREE.PMREMGenerator(renderer);
  pmremGen.compileEquirectangularShader();
  var envScene = new THREE.Scene();
  // Multi-light environment for rich reflections
  var envBg = new THREE.Color(0x050510);
  envScene.background = envBg;
  var envL1 = new THREE.PointLight(0x84cc16, 4, 30); envL1.position.set(5, 8, 5); envScene.add(envL1);
  var envL2 = new THREE.PointLight(0x3b82f6, 3, 30); envL2.position.set(-6, 4, -4); envScene.add(envL2);
  var envL3 = new THREE.PointLight(0xffffff, 2.5, 30); envL3.position.set(0, 10, 0); envScene.add(envL3);
  var envL4 = new THREE.PointLight(0xff6b35, 1.5, 20); envL4.position.set(3, 2, -5); envScene.add(envL4);
  var envL5 = new THREE.PointLight(0x84cc16, 2, 25); envL5.position.set(-4, 6, 3); envScene.add(envL5);
  // Add some geometry for more interesting reflections
  var envSphere = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), new THREE.MeshBasicMaterial({ color: 0x111122, side: THREE.BackSide }));
  envScene.add(envSphere);
  var envMap = pmremGen.fromScene(envScene, 0, 0.1, 100).texture;
  pmremGen.dispose();

  /* ─── Lights (cinematic 3-point) ───────────────────────── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  var keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(3, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0x3b82f6, 0.3);
  fillLight.position.set(-3, 4, 2);
  scene.add(fillLight);

  var rimLight = new THREE.PointLight(0x84cc16, 0.8, 10);
  rimLight.position.set(-2, 2, -2);
  scene.add(rimLight);

  var topLight = new THREE.PointLight(0xffffff, 0.4, 8);
  topLight.position.set(0, 4, 0);
  scene.add(topLight);

  /* ─── Ground Plane ─────────────────────────────────────── */
  var groundGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 0.015),
    new THREE.MeshBasicMaterial({ color: 0x84cc16, transparent: true, opacity: 0.5 })
  );
  groundGlow.rotation.x = -Math.PI / 2;
  groundGlow.position.y = 0.001;
  scene.add(groundGlow);

  var grid = new THREE.GridHelper(80, 160, 0x84cc16, 0x1a1a2e);
  (Array.isArray(grid.material) ? grid.material : [grid.material]).forEach(function (m) {
    m.transparent = true; m.opacity = 0.08;
  });
  scene.add(grid);

  var shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.ShadowMaterial({ opacity: 0.25 })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  /* ─── Materials (hyper-realistic PBR) ──────────────────── */
  // Main body — dark gunmetal with fine roughness
  var bodyMat = new THREE.MeshStandardMaterial({
    color: 0x15152a, roughness: 0.12, metalness: 0.95,
    envMap: envMap, envMapIntensity: 1.2
  });
  // Hull panels — slightly lighter
  var hullMat = new THREE.MeshStandardMaterial({
    color: 0x1c2040, roughness: 0.18, metalness: 0.88,
    envMap: envMap, envMapIntensity: 1.0
  });
  // Chrome joints — mirror-like
  var chromeMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd, roughness: 0.02, metalness: 1.0,
    envMap: envMap, envMapIntensity: 2.0
  });
  // Carbon fiber — dark with subtle texture
  var carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a15, roughness: 0.3, metalness: 0.7,
    envMap: envMap, envMapIntensity: 0.6
  });
  // Primary glow (green accents)
  var glowMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16, emissive: 0x84cc16, emissiveIntensity: 0.8,
    roughness: 0.15, metalness: 0.6, envMap: envMap, envMapIntensity: 0.5
  });
  // Bright emissive (eyes, tips)
  var brightMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16, emissive: 0x84cc16, emissiveIntensity: 1.5,
    roughness: 0.1, metalness: 0.4
  });
  // Blue accent
  var blueMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.4,
    roughness: 0.2, metalness: 0.6, envMap: envMap, envMapIntensity: 0.5
  });
  // Visor glass — translucent dark
  var visorMat = new THREE.MeshStandardMaterial({
    color: 0x111122, roughness: 0.0, metalness: 0.3,
    envMap: envMap, envMapIntensity: 1.8,
    transparent: true, opacity: 0.85
  });

  /* ─── Robot Builder (detailed articulated mech) ────────── */
  function buildRobot() {
    var g = new THREE.Group();

    // === HEAD ASSEMBLY ===
    var headGroup = new THREE.Group();
    headGroup.position.y = 1.56;

    // Main skull — chamfered box shape
    var skull = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.34), bodyMat);
    skull.castShadow = true;
    headGroup.add(skull);

    // Visor plate (curved screen)
    var visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.10, 0.02),
      visorMat
    );
    visor.position.set(0, 0.02, 0.175);
    headGroup.add(visor);

    // Eye lenses (twin circles behind visor)
    var eyeGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
    var lEye = new THREE.Mesh(eyeGeo, brightMat);
    lEye.rotation.x = Math.PI / 2;
    lEye.position.set(-0.08, 0.03, 0.175);
    headGroup.add(lEye);
    var rEye = new THREE.Mesh(eyeGeo, brightMat);
    rEye.rotation.x = Math.PI / 2;
    rEye.position.set(0.08, 0.03, 0.175);
    headGroup.add(rEye);

    // Jaw detail plates
    var jawPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.015), carbonMat);
    jawPlate.position.set(0, -0.12, 0.175);
    headGroup.add(jawPlate);

    // Side head vents
    var ventGeo = new THREE.BoxGeometry(0.015, 0.06, 0.12);
    var lVent = new THREE.Mesh(ventGeo, glowMat);
    lVent.position.set(-0.195, 0, 0);
    headGroup.add(lVent);
    var rVent = new THREE.Mesh(ventGeo, glowMat);
    rVent.position.set(0.195, 0, 0);
    headGroup.add(rVent);

    // Antenna array
    var antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), chromeMat);
    antBase.position.set(0, 0.18, 0);
    headGroup.add(antBase);
    var antShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), chromeMat);
    antShaft.position.set(0, 0.31, 0);
    headGroup.add(antShaft);
    var antTip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), brightMat);
    antTip.position.set(0, 0.42, 0);
    headGroup.add(antTip);

    // Secondary antennas
    var ant2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.10, 6), chromeMat);
    ant2.position.set(-0.12, 0.22, 0);
    ant2.rotation.z = 0.3;
    headGroup.add(ant2);
    var ant3 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.10, 6), chromeMat);
    ant3.position.set(0.12, 0.22, 0);
    ant3.rotation.z = -0.3;
    headGroup.add(ant3);

    g.add(headGroup);

    // === NECK ===
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 12), chromeMat);
    neck.position.y = 1.38;
    g.add(neck);
    // Neck ring detail
    var neckRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.008, 8, 24),
      glowMat
    );
    neckRing.position.y = 1.36;
    neckRing.rotation.x = Math.PI / 2;
    g.add(neckRing);

    // === TORSO ===
    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.28), hullMat);
    torso.position.y = 1.08;
    torso.castShadow = true;
    g.add(torso);

    // Chest reactor (arc reactor style)
    var reactorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.01, 12, 32),
      chromeMat
    );
    reactorRing.position.set(0, 1.15, 0.145);
    reactorRing.rotation.x = Math.PI / 2;
    g.add(reactorRing);
    var reactorCore = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), brightMat);
    reactorCore.position.set(0, 1.15, 0.145);
    g.add(reactorCore);
    // Inner glow ring
    var reactorInner = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.006, 8, 24),
      glowMat
    );
    reactorInner.position.set(0, 1.15, 0.15);
    reactorInner.rotation.x = Math.PI / 2;
    g.add(reactorInner);

    // Torso panel lines
    var panelLine1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.008, 0.005), glowMat);
    panelLine1.position.set(0, 1.28, 0.145);
    g.add(panelLine1);
    var panelLine2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.008, 0.005), glowMat);
    panelLine2.position.set(0, 0.88, 0.145);
    g.add(panelLine2);

    // Back detail (thruster vents)
    var backPanel = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.015), carbonMat);
    backPanel.position.set(0, 1.12, -0.145);
    g.add(backPanel);
    var backVent1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), blueMat);
    backVent1.rotation.x = Math.PI / 2;
    backVent1.position.set(-0.08, 1.12, -0.155);
    g.add(backVent1);
    var backVent2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), blueMat);
    backVent2.rotation.x = Math.PI / 2;
    backVent2.position.set(0.08, 1.12, -0.155);
    g.add(backVent2);

    // Belt / waist
    var belt = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.06, 0.30), glowMat);
    belt.position.y = 0.80;
    g.add(belt);

    // Shoulder armor
    var shoulderGeo = new THREE.BoxGeometry(0.12, 0.06, 0.16);
    var lShoulder = new THREE.Mesh(shoulderGeo, bodyMat);
    lShoulder.position.set(-0.32, 1.31, 0);
    lShoulder.castShadow = true;
    g.add(lShoulder);
    var rShoulder = new THREE.Mesh(shoulderGeo, bodyMat);
    rShoulder.position.set(0.32, 1.31, 0);
    rShoulder.castShadow = true;
    g.add(rShoulder);
    // Shoulder joints (chrome spheres)
    var jointGeo = new THREE.SphereGeometry(0.055, 16, 16);
    g.add(new THREE.Mesh(jointGeo, chromeMat).translateX(-0.30).translateY(1.28));
    g.add(new THREE.Mesh(jointGeo, chromeMat).translateX(0.30).translateY(1.28));

    // === ARMS (articulated: upper arm, elbow joint, forearm, hand) ===
    function makeArm(side) {
      var arm = new THREE.Group();
      var sx = side === 'L' ? -0.31 : 0.31;
      arm.position.set(sx, 1.26, 0);

      // Upper arm
      var upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.26, 0.10), bodyMat);
      upperArm.position.y = -0.16;
      upperArm.castShadow = true;
      arm.add(upperArm);
      // Upper arm detail strip
      var stripU = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.20, 0.005), glowMat);
      stripU.position.set(side === 'L' ? -0.053 : 0.053, -0.16, 0.05);
      arm.add(stripU);

      // Elbow joint
      var elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), chromeMat);
      elbow.position.y = -0.32;
      arm.add(elbow);

      // Forearm
      var forearm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.09), hullMat);
      forearm.position.y = -0.48;
      arm.add(forearm);

      // Wrist joint
      var wrist = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), chromeMat);
      wrist.position.y = -0.62;
      arm.add(wrist);

      // Hand
      var hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.05), carbonMat);
      hand.position.y = -0.68;
      arm.add(hand);
      // Finger glow tips
      var fingerGeo = new THREE.BoxGeometry(0.015, 0.04, 0.012);
      for (var f = -1; f <= 1; f++) {
        var finger = new THREE.Mesh(fingerGeo, glowMat);
        finger.position.set(f * 0.025, -0.74, 0);
        arm.add(finger);
      }

      return arm;
    }

    var lArm = makeArm('L');
    var rArm = makeArm('R');
    g.add(lArm, rArm);

    // === LEGS (articulated: upper leg, knee, lower leg, foot) ===
    function makeLeg(side) {
      var leg = new THREE.Group();
      var lx = side === 'L' ? -0.12 : 0.12;
      leg.position.set(lx, 0.73, 0);

      // Hip joint
      var hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), chromeMat);
      hipJoint.position.y = -0.02;
      leg.add(hipJoint);

      // Upper leg (thigh)
      var thigh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.12), bodyMat);
      thigh.position.y = -0.20;
      thigh.castShadow = true;
      leg.add(thigh);
      // Thigh detail strip
      var stripT = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.26, 0.012), glowMat);
      stripT.position.set(side === 'L' ? -0.065 : 0.065, -0.20, 0.06);
      leg.add(stripT);

      // Knee joint
      var knee = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), chromeMat);
      knee.position.y = -0.39;
      leg.add(knee);
      // Knee cap armor
      var kneeCap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.04), carbonMat);
      kneeCap.position.set(0, -0.39, 0.07);
      leg.add(kneeCap);

      // Lower leg (shin)
      var shin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.30, 0.11), hullMat);
      shin.position.y = -0.57;
      leg.add(shin);

      // Ankle
      var ankle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), chromeMat);
      ankle.position.y = -0.73;
      leg.add(ankle);

      // Foot — armored boot
      var boot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.22), bodyMat);
      boot.position.set(0, -0.76, 0.03);
      boot.castShadow = true;
      leg.add(boot);
      // Foot sole glow
      var sole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.18), glowMat);
      sole.position.set(0, -0.79, 0.03);
      leg.add(sole);

      return leg;
    }

    var lLeg = makeLeg('L');
    var rLeg = makeLeg('R');
    g.add(lLeg, rLeg);

    // Store references for animation
    g.userData = {
      headGroup: headGroup, antTip: antTip, visor: visor,
      lEye: lEye, rEye: rEye, reactorCore: reactorCore, reactorInner: reactorInner,
      lArm: lArm, rArm: rArm, lLeg: lLeg, rLeg: rLeg,
      lVent: lVent, rVent: rVent, neckRing: neckRing
    };
    return g;
  }

  var robot = buildRobot();
  scene.add(robot);

  /* ─── Particle Trail System ────────────────────────────── */
  var TRAIL_COUNT = 60;
  var trailPositions = new Float32Array(TRAIL_COUNT * 3);
  var trailSizes = new Float32Array(TRAIL_COUNT);
  for (var ti = 0; ti < TRAIL_COUNT; ti++) {
    trailPositions[ti * 3] = 0;
    trailPositions[ti * 3 + 1] = -10;
    trailPositions[ti * 3 + 2] = 0;
    trailSizes[ti] = Math.random() * 3 + 1;
  }
  var trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeo.setAttribute('size', new THREE.BufferAttribute(trailSizes, 1));
  var trailMat = new THREE.PointsMaterial({
    color: 0x84cc16, size: 0.04, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  var trailPoints = new THREE.Points(trailGeo, trailMat);
  scene.add(trailPoints);
  var trailIdx = 0;

  /* ─── State ────────────────────────────────────────────── */
  var pressed = {};
  var jumping = false, velY = 0, posY = 0;
  var facing = 1;
  var walkT = 0, charOn = true;
  var squash = 1, squashGoal = 1;
  var scrollVel = 0, lastScrollY = window.scrollY;
  var breathPhase = 0;

  function isTyping() {
    var a = document.activeElement;
    return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
  }

  /* ─── Input ────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (isTyping()) return;
    var k = e.key;
    pressed[k.toLowerCase()] = true;
    if (k === 'ArrowLeft') pressed.a = true;
    if (k === 'ArrowRight') pressed.d = true;

    if (k === ' ' && !jumping) {
      e.preventDefault();
      jumping = true;
      velY = 0.14;
    }
    if (k.toLowerCase() === 'c') {
      charOn = !charOn;
      canvas.style.opacity = charOn ? '1' : '0';
      var h = document.getElementById('charHints');
      if (h) h.style.opacity = charOn ? '' : '0';
    }
  });

  document.addEventListener('keyup', function (e) {
    var k = e.key;
    pressed[k.toLowerCase()] = false;
    if (k === 'ArrowLeft') pressed.a = false;
    if (k === 'ArrowRight') pressed.d = false;
  });

  /* ─── Render Loop ──────────────────────────────────────── */
  var clk = new THREE.Clock();

  (function loop() {
    requestAnimationFrame(loop);
    var dt = Math.min(clk.getDelta(), 0.05);
    var t = clk.getElapsedTime();

    var keyMov = pressed.a || pressed.d;
    var run = pressed.shift && keyMov;
    var scrollSpd = run ? 18 : 8;

    // A/D drive vertical page scroll — robot walks in response
    if (keyMov && !isTyping()) {
      window.scrollBy(0, pressed.d ? scrollSpd : -scrollSpd);
    }

    // Track scroll velocity
    var curScroll = window.scrollY;
    scrollVel = curScroll - lastScrollY;
    lastScrollY = curScroll;

    // Movement state
    var moving = keyMov || Math.abs(scrollVel) > 1;
    var isRun = run || Math.abs(scrollVel) > 12;

    // Face direction
    if (keyMov) {
      facing = pressed.d ? 1 : -1;
    } else if (Math.abs(scrollVel) > 1) {
      facing = scrollVel > 0 ? 1 : -1;
    }
    // Smooth rotation
    var targetRotY = facing === 1 ? 0 : Math.PI;
    robot.rotation.y += (targetRotY - robot.rotation.y) * 0.12;

    // Jump physics
    if (jumping) {
      posY += velY;
      velY -= 0.008;
      if (posY <= 0) {
        posY = 0; jumping = false; velY = 0;
        squashGoal = 0.75;
        // Landing particle burst
        for (var pi = 0; pi < 8; pi++) {
          var idx = (trailIdx++) % TRAIL_COUNT;
          trailPositions[idx * 3] = (Math.random() - 0.5) * 0.4;
          trailPositions[idx * 3 + 1] = Math.random() * 0.15;
          trailPositions[idx * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }
      }
    }
    squash += (squashGoal - squash) * 0.15;
    if (Math.abs(squash - squashGoal) < 0.01) squashGoal = 1;

    robot.position.y = posY;
    robot.scale.set(2 - squash, squash, 1);

    // === Animate Limbs ===
    var u = robot.userData;

    if (moving && !jumping) {
      var walkSpeed = keyMov ? (isRun ? 22 : 13) : Math.min(20, Math.abs(scrollVel) * 1.6);
      walkT += dt * walkSpeed;
      var sw = Math.sin(walkT);
      var armSwing = sw * 0.7;
      var legSwing = sw * 0.6;

      u.lArm.rotation.x = armSwing;
      u.rArm.rotation.x = -armSwing;
      u.lLeg.rotation.x = -legSwing;
      u.rLeg.rotation.x = legSwing;

      // Head bob
      u.headGroup.position.y = 1.56 + Math.abs(Math.sin(walkT * 2)) * 0.015;
      // Subtle lean when running
      robot.rotation.z = isRun ? (facing === 1 ? -0.05 : 0.05) : 0;

      // Foot trail particles when moving
      if (Math.abs(sw) > 0.8) {
        var tidx = (trailIdx++) % TRAIL_COUNT;
        trailPositions[tidx * 3] = (Math.random() - 0.5) * 0.15;
        trailPositions[tidx * 3 + 1] = Math.random() * 0.05;
        trailPositions[tidx * 3 + 2] = (Math.random() - 0.5) * 0.15;
      }
    } else if (jumping) {
      u.lArm.rotation.x = -0.8;
      u.rArm.rotation.x = -0.8;
      u.lLeg.rotation.x = 0.5;
      u.rLeg.rotation.x = 0.5;
    } else {
      // Idle breathing
      walkT = 0;
      breathPhase += dt;
      var breathAmt = Math.sin(breathPhase * 2) * 0.008;
      u.headGroup.position.y = 1.56 + breathAmt;
      u.lArm.rotation.x *= 0.9;
      u.rArm.rotation.x *= 0.9;
      u.lLeg.rotation.x *= 0.9;
      u.rLeg.rotation.x *= 0.9;
      robot.rotation.z *= 0.9;
    }

    // === Ambient Glow Animations ===
    var pulse = Math.sin(t * 2);
    var pulse2 = Math.sin(t * 3);

    // Antenna tip bobs + glows
    u.antTip.position.y = 0.42 + Math.sin(t * 2.5) * 0.02;
    u.antTip.material.emissiveIntensity = 1.2 + pulse * 0.3;

    // Eye brightness pulse
    u.lEye.material.emissiveIntensity = 1.2 + pulse2 * 0.3;
    u.rEye.material.emissiveIntensity = 1.2 + pulse2 * 0.3;

    // Visor subtle shimmer
    u.visor.material.opacity = 0.82 + Math.sin(t * 1.5) * 0.05;

    // Reactor core pulse
    u.reactorCore.material.emissiveIntensity = 1.2 + pulse * 0.4;
    u.reactorInner.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.2;

    // Side vent glow
    u.lVent.material.emissiveIntensity = 0.5 + Math.sin(t * 2 + 0.5) * 0.2;
    u.rVent.material.emissiveIntensity = 0.5 + Math.sin(t * 2 + 1.5) * 0.2;

    // Neck ring rotation
    u.neckRing.rotation.z = t * 0.5;

    // Rim light follows robot breathing
    rimLight.intensity = 0.6 + pulse * 0.2;

    // Trail particle fade (drift up and fade)
    var tPos = trailGeo.attributes.position.array;
    for (var j = 0; j < TRAIL_COUNT; j++) {
      tPos[j * 3 + 1] += dt * 0.3;
      if (tPos[j * 3 + 1] > 1) tPos[j * 3 + 1] = -10;
    }
    trailGeo.attributes.position.needsUpdate = true;
    trailMat.opacity = moving ? 0.4 : 0.1;

    renderer.render(scene, camera);
  })();

  /* ─── Resize ───────────────────────────────────────────── */
  function onResize() {
    if (window.innerWidth < 768) { canvas.style.display = 'none'; return; }
    canvas.style.display = '';
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  window.addEventListener('resize', onResize);

  /* ─── Auto-show Hints ──────────────────────────────────── */
  window.addEventListener('load', function () {
    setTimeout(function () {
      var h = document.getElementById('charHints');
      if (h) {
        h.classList.add('visible');
        setTimeout(function () { h.classList.remove('visible'); }, 8000);
      }
    }, 3500);
  });
})();
