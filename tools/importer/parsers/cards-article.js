/* eslint-disable */
/* global WebImporter */
/**
 * Parser: cards-article (case studies + blogs)
 * Source: div.blogs-container div.blogs-body (slick slider of .slide-custom cards)
 * Model: one row per card -> [image | linked title paragraph, description, optional date]
 */
export default function parse(element, { document }) {
  const cells = [];

  let items = [...element.querySelectorAll('.slick-slide:not(.slick-cloned) .slide-custom')];
  if (!items.length) items = [...element.querySelectorAll('.slide-custom')];

  const seen = new Set();
  items.forEach((item) => {
    const img = item.querySelector('img.blog-img');
    const titleEl = item.querySelector('.blog-title');
    const descEl = item.querySelector('.blog-desc');
    const dateEl = item.querySelector('.blog-date-span');

    const title = titleEl ? titleEl.textContent.trim() : '';
    const desc = descEl ? descEl.textContent.trim() : '';
    const date = dateEl ? dateEl.textContent.trim() : '';

    // Article URL: link wrapping title, else any link in the card or its slide wrapper
    const linkEl = (titleEl && titleEl.closest('a[href]'))
      || item.querySelector('a[href]')
      || (item.parentElement && item.parentElement.querySelector(':scope > a[href]'));
    const href = linkEl ? (linkEl.getAttribute('href') || '').trim() : '';

    if (!title && !img) return;
    const key = `${href}|${title}`;
    if (seen.has(key)) return;
    seen.add(key);

    let imageCell = '';
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src') || img.src;
      image.alt = img.getAttribute('alt') || title;
      imageCell = image;
    }

    const content = [];
    if (title) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        p.append(a);
      } else {
        p.textContent = title;
      }
      content.push(p);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }
    if (date) {
      const p = document.createElement('p');
      p.textContent = date;
      content.push(p);
    }

    cells.push([imageCell, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
