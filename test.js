// Minimal, framework-free slider: one-at-a-time, dots, arrows, drag, autoplay.
(() => {
  const carousel = document.querySelector(".carousel");
  const track = carousel.querySelector(".track");
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");
  const dots = Array.from(carousel.querySelectorAll(".dot"));

  let index = 0;
  let autoplay = carousel.dataset.autoplay === "true";
  let interval = Number(carousel.dataset.interval || 5000);
  let timer = null;

  // --- Core render ---
  function goTo(i, { animate = true } = {}) {
    index = (i + slides.length) % slides.length;
    track.style.transition = animate ? "transform .5s cubic-bezier(.22,.61,.36,1)" : "none";
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, n) => {
      d.classList.toggle("is-active", n === index);
      d.setAttribute("aria-selected", String(n === index));
    });
  }

  // --- Controls ---
  prevBtn.addEventListener("click", () => {
    pause();
    goTo(index - 1);
    resume();
  });
  nextBtn.addEventListener("click", () => {
    pause();
    goTo(index + 1);
    resume();
  });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      pause();
      goTo(Number(dot.dataset.index));
      resume();
    });
  });

  // --- Drag / Swipe ---
  let startX = 0,
    currentX = 0,
    dragging = false,
    hasMoved = false;

  function onDown(e) {
    pause();
    dragging = true;
    hasMoved = false;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX = startX;
    track.style.transition = "none";
  }
  function onMove(e) {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    currentX = x;
    const dx = x - startX;
    // follow finger slightly (10% of width)
    track.style.transform = `translateX(calc(${-index * 100}% + ${dx / 10}px))`;
    if (Math.abs(dx) > 5) hasMoved = true;
    e.preventDefault();
  }
  function onUp() {
    if (!dragging) return;
    const dx = currentX - startX;
    dragging = false;
    // snap decision threshold
    if (dx > 50) goTo(index - 1);
    else if (dx < -50) goTo(index + 1);
    else goTo(index); // revert
    resume();
  }

  const viewport = carousel.querySelector(".viewport");
  viewport.addEventListener("mousedown", onDown);
  viewport.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("mousemove", onMove, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);

  // --- Autoplay with pause on hover/focus ---
  function startAutoplay() {
    if (timer || !autoplay) return;
    timer = setInterval(() => goTo(index + 1), interval);
  }
  function stopAutoplay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  function pause() {
    stopAutoplay();
  }
  function resume() {
    startAutoplay();
  }

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", resume);
  carousel.addEventListener("focusin", pause);
  carousel.addEventListener("focusout", resume);

  // Init
  goTo(0, { animate: false });
  startAutoplay();

  // Optional: keyboard arrows
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      pause();
      goTo(index - 1);
      resume();
    }
    if (e.key === "ArrowRight") {
      pause();
      goTo(index + 1);
      resume();
    }
  });
})();

/*
  Menu Accordion: converts each .menu-category into an accessible
  accordion without changing your HTML.
*/
document.addEventListener("DOMContentLoaded", () => {
  const categories = document.querySelectorAll(".menu-category");
  const startOpenIndex = 0; // open the first category by default. Set to -1 to start all closed.

  categories.forEach((cat, idx) => {
    const h = cat.querySelector(".category-heading");
    if (!h) return;

    // 1) Build a button from the heading text
    const labelText = h.textContent.trim();
    const btn = document.createElement("button");
    btn.className = "acc-btn";
    btn.type = "button";
    btn.setAttribute("aria-expanded", idx === startOpenIndex ? "true" : "false");

    // Make a stable id from the label
    const panelId = "panel-" + labelText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    btn.setAttribute("aria-controls", panelId);
    btn.innerHTML = `<span>${labelText}</span>`;

    // Replace heading content with the button
    h.textContent = "";
    h.appendChild(btn);

    // 2) Collect the .menu-item siblings and wrap into a panel
    const items = Array.from(cat.querySelectorAll(":scope > .menu-item"));
    const panel = document.createElement("div");
    panel.className = "acc-panel";
    panel.id = panelId;

    // Move items into the panel
    items.forEach((item) => panel.appendChild(item));

    // Insert panel after heading
    cat.appendChild(panel);

    // Set initial state
    if (idx !== startOpenIndex) panel.hidden = true;

    // 3) Toggle on click
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });
});
