/* eslint-disable */
/* global WebImporter */
/**
 * Parser: carousel-awards
 * Source: #awards div.awards-body (slick slider of .slide-custom cards)
 * Model: one row per unique award -> [logo image | <strong>title</strong> + description]
 */
export default function parse(element, { document }) {
  const cells = [];

  let items = [...element.querySelectorAll('.slick-slide:not(.slick-cloned) .slide-custom')];
  if (!items.length) items = [...element.querySelectorAll('.slide-custom')];

  const seen = new Set();
  items.forEach((item) => {
    const img = item.querySelector('img');
    const titleEl = item.querySelector('.award-title');
    const descEl = item.querySelector('.award-desc');
    const title = titleEl ? titleEl.textContent.trim() : '';
    const desc = descEl ? descEl.textContent.trim() : '';
    const src = img ? (img.getAttribute('src') || img.src || '') : '';

    const key = `${title}|${desc}|${src}`;
    if ((!title && !desc && !src) || seen.has(key)) return;
    seen.add(key);

    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = img.getAttribute('alt') || title;
      imageCell = image;
    }

    const content = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title;
      p.append(strong);
      content.push(p);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }

    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-awards', cells });
  element.replaceWith(block);
}
