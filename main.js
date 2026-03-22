/* ================================================================
   MAIN.JS — Neural Network Animation, Scroll Reveal, Interactions
================================================================ */

/* ── Neural Network Canvas Animation ── */
(function () {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes = [], mouse = { x: -9999, y: -9999 };
  const NODE_COUNT   = 80;
  const MAX_DIST     = 180;
  const TEAL         = [6, 182, 212];
  const PURPLE       = [168, 85, 247];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse tracking for interactivity
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  class Node {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x   = Math.random() * W;
      this.y   = init ? Math.random() * H : -20;
      this.vx  = (Math.random() - 0.5) * 0.4;
      this.vy  = (Math.random() - 0.5) * 0.4;
      this.r   = Math.random() * 2.5 + 1;
      this.hue = Math.random() > 0.5 ? 'teal' : 'purple';
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.pulse += 0.018;
      // Gentle attraction towards mouse
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 200) {
        this.vx += dx / d * 0.04;
        this.vy += dy / d * 0.04;
      }
      // Speed damping
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x  += this.vx;
      this.y  += this.vy;
      // Wrap around edges
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }
    draw() {
      const pulse   = 0.5 + 0.5 * Math.sin(this.pulse);
      const [r,g,b] = this.hue === 'teal' ? TEAL : PURPLE;
      const alpha   = 0.4 + 0.4 * pulse;
      const radius  = this.r * (0.8 + 0.4 * pulse);

      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius * 3, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius * 3);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.12 * pulse})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  // Initialize nodes
  for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_DIST) continue;

        const alpha = (1 - dist / MAX_DIST) * 0.25;
        // Blend color between the two nodes
        const [ra,ga,ba] = a.hue === 'teal' ? TEAL : PURPLE;
        const [rb,gb,bb] = b.hue === 'teal' ? TEAL : PURPLE;

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `rgba(${ra},${ga},${ba},${alpha})`);
        grad.addColorStop(1, `rgba(${rb},${gb},${bb},${alpha})`);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => { n.update(); n.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();


/* ── Navbar Scroll Effect ── */
(function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
})();


/* ── Mobile Nav Toggle ── */
(function () {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    // Animate hamburger to X
    const spans = toggle.querySelectorAll('span');
    if (links.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translateY(7px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
  // Close nav on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });
})();


/* ── Smooth Scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ── Scroll Reveal ── */
(function () {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  els.forEach(el => observer.observe(el));
})();


/* ── Contact Form Handler ── */
(function () {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    // Simulate send (replace with real endpoint)
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
    }, 1400);
  });
})();


/* ── Feather Icons ── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof feather !== 'undefined') feather.replace();
});
window.addEventListener('load', () => {
  if (typeof feather !== 'undefined') feather.replace();
});
