// Minimal, framework-free slider: one-at-a-time, dots, arrows, drag, autoplay.
(() => {
  const carousel = document.querySelector('.carousel');
  const track = carousel.querySelector('.track');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');
  const dots = Array.from(carousel.querySelectorAll('.dot'));

  let index = 0;
  let autoplay = carousel.dataset.autoplay === 'true';
  let interval = Number(carousel.dataset.interval || 5000);
  let timer = null;

  // --- Core render ---
  function goTo(i, {animate=true} = {}) {
    index = (i + slides.length) % slides.length;
    track.style.transition = animate ? 'transform .5s cubic-bezier(.22,.61,.36,1)' : 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, n) => {
      d.classList.toggle('is-active', n === index);
      d.setAttribute('aria-selected', String(n === index));
    });
  }

  // --- Controls ---
  prevBtn.addEventListener('click', () => { pause(); goTo(index - 1); resume(); });
  nextBtn.addEventListener('click', () => { pause(); goTo(index + 1); resume(); });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => { pause(); goTo(Number(dot.dataset.index)); resume(); });
  });

  // --- Drag / Swipe ---
  let startX = 0, currentX = 0, dragging = false, hasMoved = false;

  function onDown(e){
    pause();
    dragging = true; hasMoved = false;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    currentX = startX;
    track.style.transition = 'none';
  }
  function onMove(e){
    if(!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    currentX = x;
    const dx = x - startX;
    // follow finger slightly (10% of width)
    track.style.transform = `translateX(calc(${-index * 100}% + ${dx/10}px))`;
    if (Math.abs(dx) > 5) hasMoved = true;
    e.preventDefault();
  }
  function onUp(){
    if(!dragging) return;
    const dx = currentX - startX;
    dragging = false;
    // snap decision threshold
    if (dx > 50) goTo(index - 1);
    else if (dx < -50) goTo(index + 1);
    else goTo(index); // revert
    resume();
  }

  const viewport = carousel.querySelector('.viewport');
  viewport.addEventListener('mousedown', onDown);
  viewport.addEventListener('touchstart', onDown, {passive:true});
  window.addEventListener('mousemove', onMove, {passive:false});
  window.addEventListener('touchmove', onMove, {passive:false});
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  // --- Autoplay with pause on hover/focus ---
  function startAutoplay(){
    if(timer || !autoplay) return;
    timer = setInterval(() => goTo(index + 1), interval);
  }
  function stopAutoplay(){ if(timer){ clearInterval(timer); timer = null; } }
  function pause(){ stopAutoplay(); }
  function resume(){ startAutoplay(); }

  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', resume);
  carousel.addEventListener('focusin', pause);
  carousel.addEventListener('focusout', resume);

  // Init
  goTo(0, {animate:false});
  startAutoplay();

  // Optional: keyboard arrows
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { pause(); goTo(index - 1); resume(); }
    if (e.key === 'ArrowRight') { pause(); goTo(index + 1); resume(); }
  });
})();