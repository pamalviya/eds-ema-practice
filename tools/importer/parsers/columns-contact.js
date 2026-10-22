/* eslint-disable */
/* global WebImporter */
/**
 * Parser: columns-contact
 * Source: div.enterprise-dedicated-support-container div.dedicated-info
 * Model: single row, one cell per contact method (3):
 *   icon image, label paragraph, bold value paragraph (phone as text, email as mailto link)
 */
export default function parse(element, { document }) {
  const cells = [];

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let items = [...element.querySelectorAll(':scope > .customer-service, :scope > .sales-enquiries, :scope > .our-email')];
  if (!items.length) items = [...element.children].filter((c) => c.querySelector('.title'));

  const row = [];
  items.forEach((item) => {
    const content = [];

    const img = item.querySelector('.services-icon img, img');
    if (img) {
      const p = document.createElement('p');
      const image = document.createElement('img');
      const src = img.getAttribute('src') || img.src || '';
      // Keep SVG icons as real images: the importer's convertIcons rule would otherwise
      // turn them into :name: tokens pointing at /icons/*.svg files that do not exist.
      image.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
      image.alt = img.getAttribute('alt') || '';
      p.append(image);
      content.push(p);
    }

    const titleEl = item.querySelector('.title');
    const label = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      content.push(p);
    }

    const mailLink = item.querySelector('a[href^="mailto:"]');
    const valueEl = item.querySelector('.mail-address, .tele, .phonenumber');
    const value = (valueEl ? valueEl.textContent : (mailLink ? mailLink.textContent : '')).replace(/\s+/g, ' ').trim();
    if (value) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (mailLink || EMAIL.test(value)) {
        const a = document.createElement('a');
        a.href = mailLink ? mailLink.getAttribute('href') : `mailto:${value}`;
        a.textContent = value;
        strong.append(a);
      } else {
        strong.textContent = value;
      }
      p.append(strong);
      content.push(p);
    }

    if (content.length) row.push(content);
  });

  if (row.length) cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
