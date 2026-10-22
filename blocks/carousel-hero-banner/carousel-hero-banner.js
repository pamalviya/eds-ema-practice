import { createOptimizedPicture } from '../../scripts/aem.js';

const AUTOPLAY_DELAY = 5000;
let instanceId = 0;

// banner art is authored at roughly 1024x338; intrinsic size lets the browser reserve space
const BANNER_WIDTH = 1024;
const BANNER_HEIGHT = 338;

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img, i) => {
    // the first slide is the LCP candidate: load it eagerly at high priority;
    // later slides start hidden, so they stay lazy at low priority
    const first = i === 0;
    const picture = createOptimizedPicture(img.src, img.alt, first, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
    const optimized = picture.querySelector('img');
    optimized.width = BANNER_WIDTH;
    optimized.height = BANNER_HEIGHT;
    optimized.setAttribute('fetchpriority', first ? 'high' : 'low');
    img.closest('picture').replaceWith(picture);
  });
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.carousel-hero-banner-slide')];
  const dots = [...block.querySelectorAll('.carousel-hero-banner-indicator button')];
  block.dataset.activeSlide = index;
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a:not([aria-hidden="true"]), button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  dots.forEach((dot, i) => {
    if (i === index) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}

function showSlide(block, requested) {
  const slides = block.querySelectorAll('.carousel-hero-banner-slide');
  if (!slides.length) return;
  const index = (requested + slides.length) % slides.length;
  const track = block.querySelector('.carousel-hero-banner-slides');
  track.scrollTo({ top: 0, left: slides[index].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
  setActive(block, index);
}

function bindAutoplay(block, nav) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  let timer;
  let userPaused = false;
  const stop = () => { clearInterval(timer); timer = undefined; };
  const start = () => {
    stop();
    if (userPaused) return;
    timer = setInterval(() => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    }, AUTOPLAY_DELAY);
  };

  // visible pause/play control for auto-advancing content (WCAG 2.2.2)
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'carousel-hero-banner-toggle';
  const render = () => {
    toggle.dataset.paused = userPaused;
    toggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  };
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    render();
    // focus stays on the toggle, so the hover/focus pause keeps it still until focus leaves
    if (userPaused) stop();
  });
  render();
  nav.prepend(toggle);

  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}

function buildSlide(row, index, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-banner-slide';
  slide.id = `carousel-hero-banner-${id}-slide-${index}`;
  slide.dataset.slideIndex = index;
  const cells = [...row.children];
  cells.forEach((cell) => {
    const hasOnlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
    cell.className = hasOnlyPicture ? 'carousel-hero-banner-slide-image' : 'carousel-hero-banner-slide-content';
    if (!hasOnlyPicture && cell.textContent.trim() === '' && !cell.querySelector('picture')) return;
    slide.append(cell);
  });
  const content = slide.querySelector('.carousel-hero-banner-slide-content');
  if (content) {
    const links = content.querySelectorAll('a');
    if (links.length) {
      // links in content cells become CTA pills
      links.forEach((a) => a.classList.add('carousel-hero-banner-cta'));
    } else {
      // label-only CTA (no link authored): render it as a pill too
      const label = document.createElement('span');
      label.className = 'carousel-hero-banner-cta';
      label.textContent = content.textContent.trim();
      content.replaceChildren(label);
    }
  }

  // as on the source, the banner art links to the CTA target
  const cta = slide.querySelector('a.carousel-hero-banner-cta');
  const picture = slide.querySelector('.carousel-hero-banner-slide-image picture');
  if (cta && picture && !picture.closest('a')) {
    const link = document.createElement('a');
    link.href = cta.href;
    link.tabIndex = -1;
    link.setAttribute('aria-hidden', 'true');
    picture.replaceWith(link);
    link.append(picture);
  }
  return slide;
}

export default function decorate(block) {
  instanceId += 1;
  const rows = [...block.children];
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.className = 'carousel-hero-banner-slides-container';
  const track = document.createElement('ul');
  track.className = 'carousel-hero-banner-slides';
  rows.forEach((row, i) => track.append(buildSlide(row, i, instanceId)));
  container.append(track);
  optimizeImages(track);

  block.replaceChildren(container);
  if (rows.length < 2) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Carousel slide controls');
  const dots = document.createElement('ol');
  dots.className = 'carousel-hero-banner-indicators';
  rows.forEach((_, i) => {
    const li = document.createElement('li');
    li.className = 'carousel-hero-banner-indicator';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Show slide ${i + 1} of ${rows.length}`);
    btn.setAttribute('aria-controls', `carousel-hero-banner-${instanceId}-slide-${i}`);
    btn.addEventListener('click', () => showSlide(block, i));
    li.append(btn);
    dots.append(li);
  });
  nav.append(dots);
  block.append(nav);

  // keep indicators in sync with manual swipe/scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(block, parseInt(entry.target.dataset.slideIndex, 10));
    });
  }, { root: track, threshold: 0.6 });
  track.querySelectorAll('.carousel-hero-banner-slide').forEach((s) => observer.observe(s));

  setActive(block, 0);
  bindAutoplay(block, nav);
}
