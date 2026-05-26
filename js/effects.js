/**
 * effects.js — Engineered visual language
 * Three live canvas layers, each carrying meaning about the work itself.
 * Safe alongside script.js / webgl-scene.js / interactions.js.
 * No opacity mutations, no GSAP conflicts.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initScrollStrand();
    initAboutField();
    initNeuralCanvas();
    initCardTilt();
    initMagneticButtons();
  });

  /* ════════════════════════════════════════════════════════════════
     1. SCROLL STRAND — Right-rail telemetry helix
     A double-helix rendered on the viewport's right edge.
     Scroll position rotates the helix phase; cross-bars glow
     brightest at the current scroll position — a live readout
     of where you are in the document, framed as telemetry.
  ════════════════════════════════════════════════════════════════ */
  function initScrollStrand() {
    var el = document.getElementById('scroll-strand');
    if (!el) return;

    var canvas = document.createElement('canvas');
    el.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var H, W = 56;
    var sFrac = 0, tFrac = 0;

    function resize() {
      H = canvas.height = window.innerHeight;
      canvas.width = W;
    }

    window.addEventListener('scroll', function () {
      var docH = document.body.scrollHeight - window.innerHeight;
      tFrac = docH > 0 ? window.scrollY / docH : 0;
    }, { passive: true });

    window.addEventListener('resize', resize);
    resize();

    var CX        = W / 2;
    var AMP       = 10;
    var FREQ      = 0.042;
    var CROSS_STEP = 28;

    function draw() {
      requestAnimationFrame(draw);
      sFrac += (tFrac - sFrac) * 0.06;
      ctx.clearRect(0, 0, W, H);

      var phase = sFrac * Math.PI * 12;

      /* Strand A */
      ctx.beginPath();
      for (var y = 0; y <= H; y += 2) {
        var x = CX + Math.sin(y * FREQ + phase) * AMP;
        y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(41,151,255,0.20)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      /* Strand B (π offset) */
      ctx.beginPath();
      for (var y2 = 0; y2 <= H; y2 += 2) {
        var x2 = CX + Math.sin(y2 * FREQ + phase + Math.PI) * AMP;
        y2 === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
      }
      ctx.strokeStyle = 'rgba(41,151,255,0.11)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      /* Cross-bars: brightness encodes proximity to scan cursor */
      for (var cy = 0; cy < H; cy += CROSS_STEP) {
        var xa   = CX + Math.sin(cy * FREQ + phase) * AMP;
        var xb   = CX + Math.sin(cy * FREQ + phase + Math.PI) * AMP;
        var prox = Math.max(0, 1 - Math.abs(cy / H - sFrac) * 5);
        var a    = 0.04 + prox * 0.48;
        ctx.beginPath();
        ctx.moveTo(xa, cy);
        ctx.lineTo(xb, cy);
        ctx.strokeStyle = 'rgba(41,151,255,' + a.toFixed(3) + ')';
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }

      /* Scan cursor */
      var sy  = sFrac * H;
      var grd = ctx.createRadialGradient(CX, sy, 0, CX, sy, 22);
      grd.addColorStop(0,    'rgba(130,200,255,0.80)');
      grd.addColorStop(0.45, 'rgba(41,151,255,0.22)');
      grd.addColorStop(1,    'rgba(41,151,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(CX, sy, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(CX, sy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.fill();
    }

    draw();
  }

  /* ════════════════════════════════════════════════════════════════
     2. ABOUT FIELD — Sparse sensor constellation
     24 nodes as a sensor fusion topology. Very slow Lissajous drift,
     mouse parallax. Edges strengthen as nodes approach — exactly
     how a k-NN sensor graph behaves. Pauses when off-screen.
  ════════════════════════════════════════════════════════════════ */
  function initAboutField() {
    var wrap = document.getElementById('about-canvas-wrap');
    if (!wrap) return;

    var canvas = document.createElement('canvas');
    wrap.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var W, H, nodes = [];
    var mNorm   = { x: 0.5, y: 0.5 };
    var running = false, raf = null, T = 0;
    var CONNECT_DIST = 165;

    function build() {
      W = canvas.width  = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
      nodes = [];
      for (var i = 0; i < 26; i++) {
        nodes.push({
          bx:    (0.06 + Math.random() * 0.88) * W,
          by:    (0.06 + Math.random() * 0.88) * H,
          r:     1.0 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    document.addEventListener('mousemove', function (e) {
      var rect = wrap.getBoundingClientRect();
      if (rect.height < 10) return;
      mNorm.x = (e.clientX - rect.left) / rect.width;
      mNorm.y = (e.clientY - rect.top)  / rect.height;
    });

    function draw() {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      T  += 0.002;
      ctx.clearRect(0, 0, W, H);

      var MX = (mNorm.x - 0.5) * 16;
      var MY = (mNorm.y - 0.5) * 11;

      var pos = nodes.map(function (n) {
        return {
          x: n.bx + Math.sin(T * 0.55 + n.phase) * 7 + MX,
          y: n.by + Math.cos(T * 0.42 + n.phase) * 5 + MY,
          r: n.r
        };
      });

      for (var i = 0; i < pos.length; i++) {
        for (var j = i + 1; j < pos.length; j++) {
          var dx = pos[i].x - pos[j].x;
          var dy = pos[i].y - pos[j].y;
          var d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            var a = (1 - d / CONNECT_DIST) * 0.09;
            ctx.beginPath();
            ctx.moveTo(pos[i].x, pos[i].y);
            ctx.lineTo(pos[j].x, pos[j].y);
            ctx.strokeStyle = 'rgba(41,151,255,' + a.toFixed(3) + ')';
            ctx.lineWidth   = 0.55;
            ctx.stroke();
          }
        }
      }

      for (var k = 0; k < pos.length; k++) {
        ctx.beginPath();
        ctx.arc(pos[k].x, pos[k].y, pos[k].r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(41,151,255,0.30)';
        ctx.fill();
      }
    }

    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        if (!running) { running = true; raf = requestAnimationFrame(draw); }
      } else {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      }
    }, { threshold: 0.05 });

    var resizeTO;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(build, 200);
    });

    io.observe(wrap);
    build();
  }

  /* ════════════════════════════════════════════════════════════════
     3. NEURAL NETWORK CANVAS — Skills section
     Live PPO policy net: 5→9→9→7→4, fully connected adjacent layers.
     Pulses travel left-to-right; target nodes fire with glow halo.
  ════════════════════════════════════════════════════════════════ */
  function initNeuralCanvas() {
    var wrap = document.getElementById('nn-canvas-wrap');
    if (!wrap) return;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var W, H, nodes, edges, pulses;
    var running = false, raf = null, lastPulse = 0;
    var PULSE_INTERVAL = 230;
    var LAYERS = [5, 9, 9, 7, 4];

    function build() {
      W = canvas.width  = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
      if (W < 2 || H < 2) return;
      nodes = []; edges = []; pulses = [];
      var xStep = W / (LAYERS.length + 1);
      LAYERS.forEach(function (count, li) {
        var x = xStep * (li + 1);
        var yStep = H / (count + 1);
        for (var i = 0; i < count; i++) {
          nodes.push({ x: x, y: yStep * (i + 1), layer: li, glow: 0 });
        }
      });
      nodes.forEach(function (a) {
        nodes.forEach(function (b) {
          if (b.layer === a.layer + 1) {
            edges.push({ a: a, b: b, w: 0.12 + Math.random() * 0.55 });
          }
        });
      });
    }

    function spawnPulse() {
      if (!edges.length) return;
      var e = edges[Math.floor(Math.random() * edges.length)];
      pulses.push({ edge: e, t: 0, speed: 0.011 + Math.random() * 0.016 });
    }

    function draw(ts) {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (ts - lastPulse > PULSE_INTERVAL) {
        spawnPulse(); spawnPulse();
        lastPulse = ts;
      }
      ctx.clearRect(0, 0, W, H);

      for (var ni = 0; ni < nodes.length; ni++) {
        nodes[ni].glow = Math.max(0, nodes[ni].glow - 0.013);
      }
      for (var ei = 0; ei < edges.length; ei++) {
        var e = edges[ei];
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = 'rgba(41,151,255,' + (e.w * 0.065).toFixed(3) + ')';
        ctx.lineWidth   = e.w * 0.6;
        ctx.stroke();
      }
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var p = pulses[pi];
        p.t += p.speed;
        if (p.t >= 1) {
          p.edge.b.glow = Math.min(1, p.edge.b.glow + 0.68);
          pulses.splice(pi, 1);
          continue;
        }
        var px = p.edge.a.x + (p.edge.b.x - p.edge.a.x) * p.t;
        var py = p.edge.a.y + (p.edge.b.y - p.edge.a.y) * p.t;
        var tA = (p.t < 0.5 ? p.t : 1 - p.t) * 0.5;
        ctx.beginPath();
        ctx.moveTo(p.edge.a.x, p.edge.a.y);
        ctx.lineTo(p.edge.b.x, p.edge.b.y);
        ctx.strokeStyle = 'rgba(41,151,255,' + tA.toFixed(3) + ')';
        ctx.lineWidth   = 1.0;
        ctx.stroke();
        var pg = ctx.createRadialGradient(px, py, 0, px, py, 10);
        pg.addColorStop(0,   'rgba(110,200,255,0.92)');
        pg.addColorStop(0.4, 'rgba(41,151,255,0.32)');
        pg.addColorStop(1,   'rgba(41,151,255,0)');
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      }
      for (var ni2 = 0; ni2 < nodes.length; ni2++) {
        var n     = nodes[ni2];
        var alpha = 0.18 + n.glow * 0.72;
        var r     = 2.5 + n.glow * 3.5;
        if (n.glow > 0.04) {
          var halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22);
          halo.addColorStop(0, 'rgba(41,151,255,' + (n.glow * 0.28).toFixed(3) + ')');
          halo.addColorStop(1, 'rgba(41,151,255,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(41,151,255,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    function start() {
      if (running) return;
      running = true;
      for (var k = 0; k < 8; k++) spawnPulse();
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    var io = new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.05 });

    var resizeTO;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(build, 200);
    });

    io.observe(wrap);
    build();
  }

  /* ════════════════════════════════════════════════════════════════
     4. CARD TILT — Perspective tilt on project cards
  ════════════════════════════════════════════════════════════════ */
  function initCardTilt() {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width  * 0.5)) / (r.width  * 0.5);
        var dy = (e.clientY - (r.top  + r.height * 0.5)) / (r.height * 0.5);
        card.style.transition = 'box-shadow 0.12s ease';
        card.style.transform  =
          'perspective(900px) rotateY(' + (dx * 7).toFixed(2) + 'deg) ' +
          'rotateX(' + (-dy * 7).toFixed(2) + 'deg) translateZ(10px)';
        card.style.boxShadow =
          '0 ' + (20 + dy * 6).toFixed(0) + 'px ' +
          (50 + Math.abs(dx) * 18).toFixed(0) + 'px rgba(0,0,0,0.52),' +
          '0 0 0 1px rgba(41,151,255,' + (0.04 + Math.abs(dx) * 0.07).toFixed(3) + ')';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
        card.style.transform  = '';
        card.style.boxShadow  = '';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     5. MAGNETIC BUTTONS — Gravitational pull on primary CTAs
  ════════════════════════════════════════════════════════════════ */
  function initMagneticButtons() {
    document.querySelectorAll('.btn-primary:not(.btn-full), .btn-secondary:not(.btn-full)').forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        btn.style.transition = 'transform 0.12s ease';
      });
      btn.addEventListener('mousemove', function (e) {
        var r  = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width  / 2);
        var dy = e.clientY - (r.top  + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.18).toFixed(2) + 'px,' + (dy * 0.18).toFixed(2) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        btn.style.transform  = '';
      });
    });
  }

})();


  /* ════════════════════════════════════════════════════════════════
     NEURAL NETWORK CANVAS
     Renders a live RL policy network (5→9→9→7→4) behind the
     Skills section. Pulses travel left-to-right through weighted
     edges, nodes glow on activation — exactly like PPO forward pass.
  ════════════════════════════════════════════════════════════════ */
  function initNeuralCanvas() {
    var wrap = document.getElementById('nn-canvas-wrap');
    if (!wrap) return;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var W, H, nodes, edges, pulses;
    var running = false;
    var raf = null;
    var lastPulse = 0;
    var PULSE_INTERVAL = 260;   // ms between pulse bursts

    // Layer sizes — mirrors a real PPO policy net
    var LAYERS = [5, 9, 9, 7, 4];

    function build() {
      W = canvas.width  = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;
      if (W < 2 || H < 2) return;

      nodes = [];
      edges = [];
      pulses = [];

      var xStep = W / (LAYERS.length + 1);

      LAYERS.forEach(function (count, li) {
        var x = xStep * (li + 1);
        var yStep = H / (count + 1);
        for (var i = 0; i < count; i++) {
          nodes.push({ x: x, y: yStep * (i + 1), layer: li, glow: 0 });
        }
      });

      // Full bipartite connections between adjacent layers
      nodes.forEach(function (a) {
        nodes.forEach(function (b) {
          if (b.layer === a.layer + 1) {
            edges.push({ a: a, b: b, w: 0.12 + Math.random() * 0.55 });
          }
        });
      });
    }

    function spawnPulse() {
      if (!edges.length) return;
      var e = edges[Math.floor(Math.random() * edges.length)];
      pulses.push({ edge: e, t: 0, speed: 0.011 + Math.random() * 0.016 });
    }

    function draw(ts) {
      if (!running) return;
      raf = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, W, H);

      // Spawn pulse burst on interval
      if (ts - lastPulse > PULSE_INTERVAL) {
        spawnPulse();
        spawnPulse();
        lastPulse = ts;
      }

      // Decay node glows
      for (var ni = 0; ni < nodes.length; ni++) {
        nodes[ni].glow = Math.max(0, nodes[ni].glow - 0.014);
      }

      // ── Weight lines ──────────────────────────────────────────────
      for (var ei = 0; ei < edges.length; ei++) {
        var e = edges[ei];
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.strokeStyle = 'rgba(41,151,255,' + (e.w * 0.065).toFixed(3) + ')';
        ctx.lineWidth = e.w * 0.65;
        ctx.stroke();
      }

      // ── Pulses ────────────────────────────────────────────────────
      for (var pi = pulses.length - 1; pi >= 0; pi--) {
        var p = pulses[pi];
        p.t += p.speed;

        if (p.t >= 1) {
          p.edge.b.glow = Math.min(1, p.edge.b.glow + 0.7);
          pulses.splice(pi, 1);
          continue;
        }

        var px = p.edge.a.x + (p.edge.b.x - p.edge.a.x) * p.t;
        var py = p.edge.a.y + (p.edge.b.y - p.edge.a.y) * p.t;

        // Glow trace along edge
        var traceAlpha = (p.t < 0.5 ? p.t : 1 - p.t) * 0.55;
        ctx.beginPath();
        ctx.moveTo(p.edge.a.x, p.edge.a.y);
        ctx.lineTo(p.edge.b.x, p.edge.b.y);
        ctx.strokeStyle = 'rgba(41,151,255,' + traceAlpha.toFixed(3) + ')';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Pulse dot glow
        var pg = ctx.createRadialGradient(px, py, 0, px, py, 11);
        pg.addColorStop(0, 'rgba(100,210,255,0.95)');
        pg.addColorStop(0.35, 'rgba(41,151,255,0.4)');
        pg.addColorStop(1,   'rgba(41,151,255,0)');
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      }

      // ── Nodes ─────────────────────────────────────────────────────
      for (var ni2 = 0; ni2 < nodes.length; ni2++) {
        var n = nodes[ni2];
        var alpha = 0.22 + n.glow * 0.72;
        var r = 3 + n.glow * 3.5;

        // Activation glow halo
        if (n.glow > 0.04) {
          var halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 24);
          halo.addColorStop(0, 'rgba(41,151,255,' + (n.glow * 0.32).toFixed(3) + ')');
          halo.addColorStop(1, 'rgba(41,151,255,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, 24, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();
        }

        // Node dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(41,151,255,' + alpha.toFixed(3) + ')';
        ctx.fill();
      }
    }

    function start() {
      if (running) return;
      running = true;
      // Pre-seed some pulses so it isn't empty on first frame
      for (var k = 0; k < 8; k++) spawnPulse();
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    }

    // Pause when off-screen (performance)
    var io = new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.05 });

    var resizeTO;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(function () { build(); }, 200);
    });

    io.observe(wrap);
    build();
  }

  /* ════════════════════════════════════════════════════════════════
     3D CARD TILT
     Project cards respond to cursor position with a perspective tilt.
     Feels hand-coded; expensive frameworks fake this clumsily.
  ════════════════════════════════════════════════════════════════ */
  function initCardTilt() {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width  * 0.5)) / (r.width  * 0.5);
        var dy = (e.clientY - (r.top  + r.height * 0.5)) / (r.height * 0.5);
        card.style.transition = 'box-shadow 0.15s ease';
        card.style.transform  =
          'perspective(880px) rotateY(' + (dx * 8).toFixed(2) + 'deg) ' +
          'rotateX(' + (-dy * 8).toFixed(2) + 'deg) ' +
          'translateZ(12px) scale(1.012)';
        card.style.boxShadow =
          '0 ' + (24 + dy * 8) + 'px ' + (56 + Math.abs(dx) * 20) + 'px rgba(0,0,0,0.55),' +
          '0 0 0 1px rgba(41,151,255,' + (0.05 + Math.abs(dx) * 0.08).toFixed(3) + ')';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease';
        card.style.transform  = '';
        card.style.boxShadow  = '';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     MAGNETIC BUTTONS
     Subtle gravitational pull as cursor approaches primary CTAs.
  ════════════════════════════════════════════════════════════════ */
  function initMagneticButtons() {
    // Exclude .btn-full (form submit) — magnetic pull on a form button is bad UX
    document.querySelectorAll('.btn-primary:not(.btn-full), .btn-secondary:not(.btn-full)').forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        btn.style.transition = 'transform 0.12s ease';
      });

      btn.addEventListener('mousemove', function (e) {
        var r  = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width  / 2);
        var dy = e.clientY - (r.top  + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.2).toFixed(2) + 'px,' + (dy * 0.2).toFixed(2) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.52s cubic-bezier(0.23,1,0.32,1)';
        btn.style.transform  = '';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     TEXT SCRAMBLE — section titles resolve from noise on scroll enter.
     One-shot per element; each character resolves left-to-right.
  ════════════════════════════════════════════════════════════════ */
  function initScrambleTitles() {
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—';

    function scramble(el) {
      if (el.dataset.scrambled) return;
      el.dataset.scrambled = '1';

      var original = el.textContent;
      var frame    = 0;
      var total    = Math.max(original.length * 3, 21);

      var id = setInterval(function () {
        el.textContent = original.split('').map(function (c, i) {
          if (c === ' ') return ' ';
          if (i < frame / 3) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        frame++;
        if (frame >= total) { el.textContent = original; clearInterval(id); }
      }, 26);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) scramble(entry.target);
      });
    }, { threshold: 0.55 });

    document.querySelectorAll('.section-title').forEach(function (el) { io.observe(el); });
  }

})();
