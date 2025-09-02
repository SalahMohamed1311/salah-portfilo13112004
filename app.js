// Basic interactions and animated blobs drawing using SVG inserted via JS
document.getElementById('year')?.textContent = new Date().getFullYear();

// smooth reveal on scroll
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=> { if(e.isIntersecting) e.target.classList.add('in-view'); });
},{threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

// scroll helper
function scrollToSection(id){ const el = document.getElementById(id); if(el) window.scrollTo({top: el.offsetTop - 80, behavior: 'smooth'}); }
window.scrollToSection = scrollToSection;

// project overlays
function openProjectOverlay(card){
  const title = card.dataset.title || 'Project';
  const desc = card.dataset.desc || '';
  const img = card.querySelector('img')?.src || '';
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;background:rgba(2,6,23,0.9);z-index:9999;padding:18px;';
  overlay.innerHTML = `<div style="background:linear-gradient(180deg,#071226,#04101a);padding:18px;border-radius:12px;max-width:1000px;width:96%;">
    <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800">${escapeHtml(title)}</div><div style="color:#9fb2c8">${escapeHtml(desc)}</div></div><div><button id="closeOverlay" class="btn ghost">Close</button></div></div>
    <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap"><div style="flex:1;min-width:280px"><img src="${img}" style="width:100%;border-radius:10px" /></div><div style="flex:1;min-width:220px;color:#9fb2c8"><p>Case study content goes here.</p></div></div></div>`;
  document.body.appendChild(overlay);
  document.getElementById('closeOverlay').addEventListener('click', ()=> overlay.remove());
}
document.querySelectorAll('.proj').forEach(p=> p.addEventListener('click', ()=> openProjectOverlay(p)));

// load more
document.getElementById('loadMore')?.addEventListener('click', ()=>{
  const grid = document.querySelector('.grid');
  const existing = Array.from(document.querySelectorAll('.proj'));
  for(let i=0;i<6;i++){
    const clone = existing[i % existing.length].cloneNode(true);
    grid.appendChild(clone);
    clone.addEventListener('click', ()=> openProjectOverlay(clone));
  }
});

// contact simulation
document.getElementById('contactForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const btn = document.querySelector('.form-actions .btn');
  const status = document.getElementById('formStatus');
  if(!btn) return;
  btn.disabled = true; btn.textContent = 'Sending...';
  await new Promise(r=> setTimeout(r, 900));
  btn.textContent = 'Sent ✓'; status.textContent = 'Thanks — we will reply within 2 business days.';
  setTimeout(()=> { btn.disabled=false; btn.textContent = 'Send message'; }, 1500);
});

// simple escape
function escapeHtml(s){ return (s+'').replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// Animated morphing blobs: inject a few SVG blobs and morph their path via simple transforms
(function createBlobs(){
  const container = document.getElementById('blobCanvas');
  if(!container) return;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width','100%'); svg.setAttribute('height','100%'); svg.setAttribute('viewBox','0 0 1920 1080'); svg.style.display='block';
  // create three blobs with different gradients
  const defs = document.createElementNS(ns,'defs');
  defs.innerHTML = `<linearGradient id="g1"><stop offset="0" stop-color="#FF6F61"/><stop offset="1" stop-color="#00CFFF"/></linearGradient>
                    <linearGradient id="g2"><stop offset="0" stop-color="#8A2BE2"/><stop offset="1" stop-color="#3EB489"/></linearGradient>`;
  svg.appendChild(defs);

  function makeBlob(id, d, fill, x,y,opacity){
    const g = document.createElementNS(ns,'g');
    g.setAttribute('id', id);
    g.setAttribute('transform', `translate(${x},${y})`);
    const path = document.createElementNS(ns,'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    path.setAttribute('opacity', opacity);
    path.setAttribute('filter','url(#blur)');
    g.appendChild(path);
    svg.appendChild(g);
    return path;
  }

  // add blur filter
  const filt = document.createElementNS(ns,'filter'); filt.setAttribute('id','blur'); filt.setAttribute('x','-50%'); filt.setAttribute('y','-50%'); filt.setAttribute('width','200%'); filt.setAttribute('height','200%');
  filt.innerHTML = '<feGaussianBlur stdDeviation="50"/>';
  defs.appendChild(filt);

  // initial simple blob path (oval-ish)
  const basePath = 'M0,120 C80,20 200,60 320,120 C440,180 520,220 640,180 C760,140 820,60 720,40 C640,20 520,40 420,60 C320,80 160,220 0,120 Z';
  const b1 = makeBlob('b1', basePath, 'url(#g1)', 200,120,0.9);
  const b2 = makeBlob('b2', basePath, 'url(#g2)', 900,240,0.75);
  const b3 = makeBlob('b3', basePath, 'url(#g1)', 1300,80,0.65);

  container.appendChild(svg);

  // animate by scaling and translating, and slight path jitter via transform
  let t0 = performance.now();
  function animate(t){
    const dt = (t - t0) / 1000;
    // gentle bob
    svg.querySelector('#b1').setAttribute('transform', `translate(${200 + Math.sin(dt*0.6)*18},${120 + Math.cos(dt*0.8)*10}) scale(${1 + Math.sin(dt*0.3)*0.04})`);
    svg.querySelector('#b2').setAttribute('transform', `translate(${900 + Math.cos(dt*0.5)*28},${240 + Math.sin(dt*0.7)*14}) scale(${1 + Math.cos(dt*0.25)*0.05})`);
    svg.querySelector('#b3').setAttribute('transform', `translate(${1300 + Math.sin(dt*0.9)*22},${80 + Math.cos(dt*0.6)*12}) scale(${1 + Math.sin(dt*0.35)*0.045})`);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
