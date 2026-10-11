(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Edit your links here. Anything left empty is hidden automatically. ---- */
  const LINKS = {
    linkedin:     '',  // e.g. 'https://www.linkedin.com/in/your-id'
    leetcode:     '',  // e.g. 'https://leetcode.com/u/your-id'
    nifty100:     'https://github.com/Santhiyaa13/nifty100-etl',
    segmentation: '',  // repo URL
    malware:      'https://github.com/Santhiyaa13/-Decoding-Live-Malware-Actions-Using-An-Ensemble-Learning-Model',
    social:       ''   // repo URL
  };

  $$('[data-link]').forEach(a => {
    const url = LINKS[a.dataset.link];
    if (url) a.href = url;
    else (a.closest('li') || a).remove();
  });
  $$('.links').forEach(l => { if (!l.children.length) l.remove(); });

  /* ---- Theme ---- */
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#theme').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---- Nav ---- */
  const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  const links = $$('#menu a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---- Typing effect ---- */
  const words = ['Data Analyst', 'Business Analyst', 'Python & SQL Developer', 'AI & ML enthusiast', 'Dashboard builder'];
  const el = $('#typed');
  if (reduce) el.textContent = words[0];
  else {
    let w = 0, c = 0, del = false;
    (function tick() {
      const word = words[w];
      el.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1;
      setTimeout(tick, del ? 40 : 85);
    })();
  }

  /* ---- Reveal + counters ---- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(n => io.observe(n));

  /* ---- Skill tabs ---- */
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.toggle('active', x === t));
    $$('.panel').forEach(p => p.classList.toggle('show', p.id === 'p-' + t.dataset.tab));
  }));

  /* ---- Project filter + card glow ---- */
  $$('.fbtn').forEach(b => b.addEventListener('click', () => {
    $$('.fbtn').forEach(x => x.classList.toggle('active', x === b));
    $$('.card').forEach(c => c.classList.toggle('gone', b.dataset.f !== 'all' && !c.dataset.cat.split(' ').includes(b.dataset.f)));
  }));
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---- Gallery: show only if screenshots exist ---- */
  const gal = $('#gallery');
  const figs = $$('#galleryGrid figure');
  let loaded = 0, done = 0;
  figs.forEach(f => {
    const img = $('img', f);
    const fin = ok => { done++; if (ok) { loaded++; gal.hidden = false; } else f.remove(); };
    img.addEventListener('load', () => fin(true));
    img.addEventListener('error', () => fin(false));
    if (img.complete) fin(img.naturalWidth > 0);
    f.addEventListener('click', () => {
      const lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = '<img alt="">';
      $('img', lb).src = img.src;
      lb.addEventListener('click', () => lb.remove());
      document.body.append(lb);
    });
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---- Background: drifting data nodes ---- */
  const cv = $('#bg'), cx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const size = () => {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    pts = Array.from({ length: Math.min(70, Math.floor(W * H / 24000)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
    }));
  };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const draw = () => {
    cx.clearRect(0, 0, W, H);
    const cs = getComputedStyle(root), col = cs.getPropertyValue('--accent').trim() || '#7cf0c9';
    cx.fillStyle = col; cx.strokeStyle = col;
    pts.forEach((p, i) => {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      cx.globalAlpha = .8; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 6.283); cx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { cx.globalAlpha = (1 - d / 130) * .25; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(q.x, q.y); cx.stroke(); }
      }
      const m = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (m < 160) { cx.globalAlpha = (1 - m / 160) * .5; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(mouse.x, mouse.y); cx.stroke(); }
    });
    if (!reduce) requestAnimationFrame(draw);
  };
  draw();
})();
