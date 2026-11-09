const hasGSAP = typeof gsap !== 'undefined';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover)').matches;

// Split giant text into characters
document.querySelectorAll('.split').forEach(el => {
  el.innerHTML = [...el.textContent].map(c => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
});
// Split reveal headline into words
document.querySelectorAll('.reveal-text').forEach(el => {
  el.innerHTML = el.innerHTML.split(/(<em>.*?<\/em>|\s+)/).filter(Boolean).map(w => /^\s+$/.test(w) ? w : `<span class="w">${w}</span>`).join('');
});

// Smooth scroll
let lenis;
if (typeof Lenis !== 'undefined' && !reduce) {
  lenis = new Lenis({ lerp: .09 });
  if (hasGSAP) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(); }
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(a.getAttribute('href'), { offset: -20 }); }));
}

// Counters
function countUp(el) { const end = +el.dataset.count, o = { v: 0 };
  if (hasGSAP) gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) }); else el.textContent = end; }

if (!hasGSAP) {
  document.getElementById('intro').remove();
  document.querySelectorAll('.ch').forEach(c => c.style.transform = 'none');
  document.querySelectorAll('[data-count]').forEach(countUp);
} else {
  gsap.registerPlugin(ScrollTrigger);
  // Intro counter → hero reveal
  const cnt = { v: 0 }, cEl = document.getElementById('count');
  const tl = gsap.timeline();
  tl.to(cnt, { v: 100, duration: reduce ? .1 : 1.6, ease: 'power2.inOut', onUpdate: () => cEl.textContent = Math.round(cnt.v) })
    .to('#intro', { yPercent: -100, duration: 1, ease: 'expo.inOut' })
    .to('.hero .ch', { y: 0, duration: 1.2, ease: 'expo.out', stagger: .035 }, '-=.5')
    .from('.hero-grid > *', { y: 60, opacity: 0, duration: 1, ease: 'expo.out', stagger: .12 }, '-=1')
    .from('.hero-top', { opacity: 0, duration: .8 }, '-=.8')
    .add(() => document.querySelectorAll('.hero [data-count]').forEach(countUp), '-=.6');

  // Parallax giant words
  gsap.to('.giant:not(.outline)', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.giant.outline', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.portrait', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Marquee driven by scroll velocity
  const track = document.querySelector('.band-track');
  const loop = gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ onUpdate: s => { gsap.to(loop, { timeScale: 1 + Math.min(Math.abs(s.getVelocity()) / 300, 5) * Math.sign(s.getVelocity() || 1), duration: .2, overwrite: true }); gsap.to(loop, { timeScale: 1, duration: 1, delay: .2 }); } });

  // Section headings + rows
  gsap.utils.toArray('.sec-head .huge, .work, .row, .acc details, .b-card').forEach(el =>
    gsap.from(el, { y: 70, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.to('.reveal-text .w', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.reveal-text', start: 'top 80%', end: 'bottom 45%', scrub: true } });
  ScrollTrigger.create({ trigger: '.bento', start: 'top 80%', once: true, onEnter: () => document.querySelectorAll('.bento [data-count]').forEach(countUp) });
  gsap.from('.cta-giant span', { yPercent: 100, opacity: 0, stagger: .15, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
}

// Cursor + hover preview
if (fine) {
  const cur = document.getElementById('cursor');
  addEventListener('mousemove', e => {
    if (hasGSAP) gsap.to(cur, { x: e.clientX, y: e.clientY, duration: .15 });
    else cur.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  });
}

// Munich clock
const clk = document.getElementById('clock');
const tick = () => clk.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' CET';
tick(); setInterval(tick, 1000);
