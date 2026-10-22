import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'carousel-logo-marquee-list';

  [...block.children].forEach((row) => {
    // every picture in the row is a logo; authors may put several logos in one row
    row.querySelectorAll('picture').forEach((pic) => {
      const li = document.createElement('li');
      li.className = 'carousel-logo-marquee-item';
      const link = pic.closest('a');
      li.append(link || pic);
      list.append(li);
    });
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]));
  });

  const track = document.createElement('div');
  track.className = 'carousel-logo-marquee-track';
  track.append(list);

  // duplicate the list so the CSS animation (translateX -50%) loops seamlessly
  if (list.children.length > 1) {
    const clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    clone.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
    track.append(clone);
    block.classList.add('carousel-logo-marquee-animated');
    // scale duration with the number of logos so speed stays constant
    // (source: 14 logos loop in 30s, roughly 85px/s)
    const duration = Math.round(((list.children.length * 30) / 14) * 100) / 100;
    track.style.setProperty('--carousel-logo-marquee-duration', `${duration}s`);
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Partner logos');
  block.replaceChildren(track);

  block.addEventListener('focusin', () => block.classList.add('carousel-logo-marquee-paused'));
  block.addEventListener('focusout', () => block.classList.remove('carousel-logo-marquee-paused'));

  // visible pause/play control for the continuous scroll (WCAG 2.2.2)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!block.classList.contains('carousel-logo-marquee-animated') || reduced) return;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'carousel-logo-marquee-toggle';
  const render = (paused) => {
    toggle.dataset.paused = paused;
    toggle.setAttribute('aria-label', paused ? 'Play logo animation' : 'Pause logo animation');
  };
  toggle.addEventListener('click', () => {
    render(block.classList.toggle('carousel-logo-marquee-stopped'));
  });
  render(false);
  block.append(toggle);
}
