import { createOptimizedPicture } from '../../scripts/aem.js';

function buildCard(row) {
  const card = document.createElement('li');
  card.className = 'carousel-awards-card';
  [...row.children].forEach((cell) => {
    const onlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
    if (!onlyPicture && cell.textContent.trim() === '') return;
    cell.className = onlyPicture ? 'carousel-awards-card-image' : 'carousel-awards-card-body';
    card.append(cell);
  });
  // first paragraph of the body is the award title (authored bold, not a heading)
  const title = card.querySelector('.carousel-awards-card-body > :first-child');
  if (title) title.classList.add('carousel-awards-card-title');
  return card;
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-awards-track';
  [...block.children].forEach((row) => track.append(buildCard(row)));
  track.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  const cards = [...track.children];

  const viewport = document.createElement('div');
  viewport.className = 'carousel-awards-viewport';
  viewport.append(track);

  const prev = createButton('carousel-awards-prev', 'Previous awards');
  const next = createButton('carousel-awards-next', 'Next awards');

  // one dot per card (shown on small screens only, via CSS)
  const dots = document.createElement('ul');
  dots.className = 'carousel-awards-dots';
  cards.forEach((card, i) => {
    const li = document.createElement('li');
    const dot = createButton('carousel-awards-dot', `Show award ${i + 1}`);
    dot.dataset.index = i;
    li.append(dot);
    dots.append(li);
  });

  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const step = () => {
    if (!cards.length) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };
  const scrollToCard = (card) => {
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, Math.min(left, maxScroll())), behavior: 'smooth' });
  };

  // arrows wrap around at the ends, like the source's infinite slider
  prev.addEventListener('click', () => {
    if (track.scrollLeft <= 1) track.scrollTo({ left: maxScroll(), behavior: 'smooth' });
    else track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    if (track.scrollLeft >= maxScroll() - 1) track.scrollTo({ left: 0, behavior: 'smooth' });
    else track.scrollBy({ left: step(), behavior: 'smooth' });
  });
  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.carousel-awards-dot');
    if (dot) scrollToCard(cards[Number(dot.dataset.index)]);
  });

  const updateDots = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let active = 0;
    let best = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (distance < best) {
        best = distance;
        active = i;
      }
    });
    [...dots.querySelectorAll('.carousel-awards-dot')].forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  track.addEventListener('scroll', updateDots, { passive: true });

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  block.replaceChildren(prev, viewport, next, dots);

  const ro = new ResizeObserver(() => {
    block.classList.toggle('carousel-awards-static', maxScroll() <= 1);
    updateDots();
  });
  ro.observe(track);
}
