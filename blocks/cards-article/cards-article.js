import { createOptimizedPicture } from '../../scripts/aem.js';

// a short paragraph whose whole text parses as a date ("October 21, 2026")
function isDate(el) {
  const text = el.textContent.trim();
  return text.length > 0 && text.length < 40 && !el.querySelector('a') && !Number.isNaN(Date.parse(text));
}

function decorateBody(body) {
  const blocks = [...body.children];
  const titleEl = blocks.find((el) => /^H[1-6]$/.test(el.tagName))
    || blocks.find((el) => el.querySelector('a'))
    || blocks[0];
  let dateEl = null;
  blocks.forEach((el) => {
    if (el === titleEl) el.classList.add('cards-article-title');
    else if (!dateEl && isDate(el)) {
      dateEl = el;
      el.classList.add('cards-article-date');
    } else el.classList.add('cards-article-description');
  });
  return { link: titleEl?.querySelector('a') || body.querySelector('a'), dateEl };
}

// footer row: optional date (left) + decorative arrow (right)
function buildFooter(body, dateEl, hasLink) {
  if (!dateEl && !hasLink) return;
  const footer = document.createElement('div');
  footer.className = 'cards-article-footer';
  if (dateEl) footer.append(dateEl);
  if (hasLink) {
    const arrow = document.createElement('span');
    arrow.className = 'cards-article-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    footer.append(arrow);
  }
  body.append(footer);
}

// mobile: the list scrolls horizontally one card at a time, dots show/control the position
function buildDots(block, list) {
  const cards = [...list.children];
  if (cards.length < 2) return;
  const dots = document.createElement('div');
  dots.className = 'cards-article-dots';
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cards-article-dot';
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Show card ${i + 1} of ${cards.length}`);
    if (i === 0) dot.setAttribute('aria-current', 'true');
    dots.append(dot);
  });

  const setActive = (index) => {
    [...dots.children].forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.cards-article-dot');
    if (!dot) return;
    const card = cards[Number(dot.dataset.index)];
    list.scrollTo({ left: card.offsetLeft - list.firstElementChild.offsetLeft, behavior: 'smooth' });
    setActive(Number(dot.dataset.index));
  });

  let ticking = false;
  list.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const start = list.firstElementChild.offsetLeft;
      let index = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - start - list.scrollLeft);
        if (dist < best) {
          best = dist;
          index = i;
        }
      });
      setActive(index);
    });
  }, { passive: true });

  block.append(dots);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-article-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-article-card';
    [...row.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && cell.textContent.trim() === '';
      if (!onlyPicture && cell.textContent.trim() === '') return;
      cell.className = onlyPicture ? 'cards-article-card-image' : 'cards-article-card-body';
      li.append(cell);
    });
    const body = li.querySelector('.cards-article-card-body');
    if (body) {
      const { link, dateEl } = decorateBody(body);
      if (link) {
        // the whole card is clickable via the stretched title link
        li.classList.add('cards-article-linked');
        link.classList.add('cards-article-link');
      }
      buildFooter(body, dateEl, !!link);
    } else {
      const link = li.querySelector('a');
      if (link) {
        li.classList.add('cards-article-linked');
        link.classList.add('cards-article-link');
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
  buildDots(block, ul);
}
