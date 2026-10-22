/* eslint-disable */
/* global WebImporter */
/**
 * Parser: carousel-hero-banner
 * Source: div.banner-container (slick slider)
 * Model: one row per real slide -> [banner image (alt kept) | CTA link or label]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Real slides only (slick clones are duplicates of real slides)
  let slides = [...element.querySelectorAll('.slick-slide:not(.slick-cloned) .banner-slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.banner-slide')];

  slides.forEach((slide) => {
    const img = slide.querySelector('img.banner-image, img');
    if (!img) return;

    const image = document.createElement('img');
    image.src = img.getAttribute('src') || img.src;
    image.alt = img.getAttribute('alt') || '';

    // The importer's preprocessing merges adjacent links with the same href, so the
    // image link and a.banner-btn can arrive as one <a href><img>label</a>.
    const cta = slide.querySelector('a.banner-btn')
      || [...slide.querySelectorAll('a[href]')].find((a) => a.textContent.trim());
    let ctaCell = '';
    if (cta) {
      const label = (cta.textContent || cta.getAttribute('title') || '').trim();
      const href = (cta.getAttribute('href') || '').trim();
      if (label) {
        if (href) {
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = href;
          a.textContent = label;
          p.append(a);
          ctaCell = p;
        } else {
          // empty href (e.g. "Download Study"): keep the label as plain text
          const p = document.createElement('p');
          p.textContent = label;
          ctaCell = p;
        }
      }
    }

    cells.push([image, ctaCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero-banner', cells });
  element.replaceWith(block);
}
