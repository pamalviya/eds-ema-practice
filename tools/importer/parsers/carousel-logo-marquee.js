/* eslint-disable */
/* global WebImporter */
/**
 * Parser: carousel-logo-marquee
 * Source: #valuable-partners div.partnersliderwrap (two duplicated .partnersliderGroup lists)
 * Model: one row per unique partner logo -> [logo image (alt = partner name)]
 * The second group is a seamless-loop duplicate (empty alts) and is deduped by src.
 */
export default function parse(element, { document }) {
  const cells = [];

  let imgs = [...element.querySelectorAll('.partnersliderGroup .item img')];
  if (!imgs.length) imgs = [...element.querySelectorAll('img')];

  const bySrc = new Map();
  imgs.forEach((img) => {
    const src = (img.getAttribute('src') || img.src || '').trim();
    if (!src) return;
    const alt = (img.getAttribute('alt') || '').trim();
    const existing = bySrc.get(src);
    if (!existing) {
      const link = img.closest('a[href]');
      bySrc.set(src, { src, alt, href: link ? link.getAttribute('href') : '' });
    } else if (!existing.alt && alt) {
      existing.alt = alt;
    }
  });

  bySrc.forEach(({ src, alt, href }) => {
    const image = document.createElement('img');
    // The importer's default convertIcons rule turns any <img src="*.svg"> into a
    // :name: icon token. Partner logos are content images, so add a harmless query
    // string to keep them as images.
    image.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
    image.alt = alt;
    let cell = image;
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.append(image);
      cell = a;
    }
    cells.push([cell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-logo-marquee', cells });
  element.replaceWith(block);
}
