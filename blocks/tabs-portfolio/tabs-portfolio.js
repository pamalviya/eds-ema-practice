import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

let instanceId = 0;

const hasPicture = (el) => el.tagName === 'PICTURE' || !!el.querySelector('picture');

/**
 * Split a panel cell into slides: every element holding a picture starts a new slide,
 * and the elements that follow it (heading, text, CTA) belong to that slide.
 */
function groupSlides(cell) {
  const slides = [];
  let current;
  [...cell.children].forEach((el) => {
    if (hasPicture(el) || !current) {
      current = { media: [], text: [] };
      slides.push(current);
    }
    if (hasPicture(el)) current.media.push(el);
    else current.text.push(el);
  });
  // a leading text-only group followed by nothing else is still a valid single slide
  return slides.filter((s) => s.media.length || s.text.some((el) => el.textContent.trim()));
}

/** Only same-origin (authored) images can go through the EDS media pipeline. */
function optimizeImages(container, eagerFirst) {
  container.querySelectorAll('picture > img').forEach((img, i) => {
    // the first slide of the first panel is near the fold (the LCP on mobile): don't lazy-load it
    const eager = eagerFirst && i === 0;
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin) {
      if (eager) {
        img.loading = 'eager';
        img.setAttribute('fetchpriority', 'high');
      }
      return;
    }
    const picture = createOptimizedPicture(img.src, img.alt, eager, [{ width: '750' }]);
    // on phones the hero art is short, so this image is the LCP element
    if (eager) picture.querySelector('img').setAttribute('fetchpriority', 'high');
    img.closest('picture').replaceWith(picture);
  });
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

function buildSlider(cell, panelId, eagerFirst = false) {
  const groups = groupSlides(cell);
  const slider = document.createElement('div');
  slider.className = 'tabs-portfolio-slider';
  if (!groups.length) {
    slider.append(...cell.childNodes);
    return slider;
  }
  const track = document.createElement('ul');
  track.className = 'tabs-portfolio-slides';

  groups.forEach((group, i) => {
    const slide = document.createElement('li');
    slide.className = 'tabs-portfolio-slide';
    slide.id = `${panelId}-slide-${i}`;
    if (group.media.length) {
      const media = document.createElement('div');
      media.className = 'tabs-portfolio-slide-image';
      media.append(...group.media);
      slide.append(media);
    }
    const text = document.createElement('div');
    text.className = 'tabs-portfolio-slide-content';
    text.append(...group.text);
    text.querySelectorAll('a').forEach((a) => a.classList.add('tabs-portfolio-cta'));
    slide.append(text);
    track.append(slide);
  });

  optimizeImages(track, eagerFirst);
  slider.append(track);
  if (groups.length < 2) return slider;

  const slides = [...track.children];
  const dots = document.createElement('ol');
  dots.className = 'tabs-portfolio-indicators';
  const prev = createButton('tabs-portfolio-prev', 'Previous slide');
  const next = createButton('tabs-portfolio-next', 'Next slide');

  // reflect the active slide in arrows, dots, aria and focusability (no scrolling)
  const setState = (index) => {
    slider.dataset.activeSlide = index;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== index);
      s.querySelectorAll('a').forEach((a) => (i === index ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
    });
    [...dots.querySelectorAll('button')].forEach((b, i) => (i === index ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
  };

  const show = (requested) => {
    const index = Math.max(0, Math.min(slides.length - 1, requested));
    track.scrollTo({ top: 0, left: slides[index].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    setState(index);
  };

  slides.forEach((s, i) => {
    const li = document.createElement('li');
    const b = createButton('tabs-portfolio-indicator', `Show slide ${i + 1} of ${slides.length}`);
    b.setAttribute('aria-controls', s.id);
    b.addEventListener('click', () => show(i));
    li.append(b);
    dots.append(li);
  });
  prev.addEventListener('click', () => show(parseInt(slider.dataset.activeSlide, 10) - 1));
  next.addEventListener('click', () => show(parseInt(slider.dataset.activeSlide, 10) + 1));

  // keep state in sync when the user swipes the track
  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (!track.clientWidth) return;
      const step = slides[1].offsetLeft - slides[0].offsetLeft;
      const index = Math.round(track.scrollLeft / step);
      if (index !== parseInt(slider.dataset.activeSlide, 10)) setState(index);
    }, 100);
  }, { passive: true });

  slider.classList.add('tabs-portfolio-slider-multi');
  slider.prepend(prev);
  slider.append(next, dots);
  setState(0);
  return slider;
}

export default function decorate(block) {
  instanceId += 1;
  const nav = document.createElement('div');
  nav.className = 'tabs-portfolio-nav';
  const tablist = document.createElement('div');
  tablist.className = 'tabs-portfolio-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.firstElementChild);
  const panels = [];
  rows.forEach((row, i) => {
    const [labelCell, contentCell] = row.children;
    const id = `${toClassName(labelCell.textContent) || 'tab'}-${instanceId}-${i}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-portfolio-tab';
    button.id = `tabs-portfolio-tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `tabs-portfolio-panel-${id}`);
    button.setAttribute('aria-selected', i === 0);
    button.setAttribute('tabindex', i === 0 ? '0' : '-1');
    button.textContent = labelCell.textContent.trim();
    tablist.append(button);

    const panel = document.createElement('div');
    panel.className = 'tabs-portfolio-panel';
    panel.id = `tabs-portfolio-panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.setAttribute('aria-hidden', i !== 0);
    if (contentCell) panel.append(buildSlider(contentCell, panel.id, i === 0));
    panels.push(panel);
  });

  const buttons = [...tablist.children];
  let selected = 0;
  // mobile-only arrows that step through the (horizontally scrolling) tab bar
  const prevTab = createButton('tabs-portfolio-nav-prev', 'Previous tab');
  const nextTab = createButton('tabs-portfolio-nav-next', 'Next tab');

  const select = (index) => {
    selected = index;
    buttons.forEach((b, i) => {
      b.setAttribute('aria-selected', i === index);
      b.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    panels.forEach((p, i) => p.setAttribute('aria-hidden', i !== index));
    prevTab.disabled = index === 0;
    nextTab.disabled = index === buttons.length - 1;
    const tab = buttons[index];
    if (tablist.scrollWidth > tablist.clientWidth) {
      tablist.scrollTo({ left: tab.offsetLeft - tablist.offsetLeft, behavior: 'smooth' });
    }
  };

  buttons.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => {
      let target;
      if (e.key === 'ArrowRight') target = (i + 1) % buttons.length;
      if (e.key === 'ArrowLeft') target = (i - 1 + buttons.length) % buttons.length;
      if (target === undefined) return;
      e.preventDefault();
      select(target);
      buttons[target].focus();
    });
  });
  prevTab.addEventListener('click', () => select(Math.max(0, selected - 1)));
  nextTab.addEventListener('click', () => select(Math.min(buttons.length - 1, selected + 1)));
  prevTab.disabled = true;
  nextTab.disabled = buttons.length < 2;

  nav.append(prevTab, tablist, nextTab);
  block.replaceChildren(nav, ...panels);
}
