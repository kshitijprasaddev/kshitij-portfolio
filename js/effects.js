/**
 * effects.js — Non-conflicting visual enhancements
 * Completely new file. Does NOT edit opacity, does NOT use GSAP.
 * Safe to add alongside script.js / interactions.js / webgl-scene.js.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNeuralCanvas();
    initCardTilt();
    initMagneticButtons();
    initScrambleTitles();
  });

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
