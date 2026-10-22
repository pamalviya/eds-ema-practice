/* eslint-disable */
/* global WebImporter */
/**
 * Parser: tabs-portfolio
 * Source: #explore-portfolio div.entTabCarousel
 * Model: one row per tab -> [tab label | panel content]
 *   panel content = for each slide: image (desktop only), h3, paragraph, CTA link
 * Tab labels (.nav-item a.nav-link) are paired with .tab-pane panels by document order.
 */
export default function parse(element, { document }) {
  const cells = [];

  const labels = [...element.querySelectorAll('.entTabSection .nav-item a.nav-link')]
    .filter((a) => !a.closest('.slick-cloned'));
  const panes = [...element.querySelectorAll('.entContentSlider .tab-content > .tab-pane')];

  const buildSlide = (slide) => {
    const out = [];

    // Image first (desktop image only; skip the mobile duplicate)
    const img = slide.querySelector('.entTabcaSlideLeft img.sliderDeskImg')
      || slide.querySelector('.entTabcaSlideLeft img:not(.slidermobImg)');
    if (img) {
      const image = document.createElement('img');
      image.src = img.getAttribute('src') || img.src;
      image.alt = img.getAttribute('alt') || '';
      out.push(image);
    }

    const right = slide.querySelector('.entTabcaSlideRght') || slide;

    const heading = right.querySelector('h3, .entRghtContentHead');
    if (heading && heading.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      out.push(h3);
    }

    const text = right.querySelector('p.entRghtText, p');
    if (text && text.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = text.textContent.trim();
      out.push(p);
    }

    // CTA: <a href><button.entSliderCTA>label<img arrow></button></a>
    const btn = right.querySelector('button.entSliderCTA');
    const link = right.querySelector('a[href]') || (btn && btn.closest('a[href]'));
    const label = ((btn && btn.textContent) || (link && link.textContent) || '').trim();
    if (label) {
      const p = document.createElement('p');
      const href = link ? (link.getAttribute('href') || '').trim() : '';
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      out.push(p);
    }

    return out;
  };

  const count = Math.max(labels.length, panes.length);
  for (let i = 0; i < count; i += 1) {
    const labelEl = labels[i];
    const pane = panes[i];
    const label = labelEl ? (labelEl.textContent || labelEl.getAttribute('title') || '').trim() : '';

    const content = [];
    if (pane) {
      let slides = [...pane.querySelectorAll('.slick-slide:not(.slick-cloned) .entTabcaSlide')];
      if (!slides.length) slides = [...pane.querySelectorAll('.entTabcaSlide')];
      slides.forEach((slide) => content.push(...buildSlide(slide)));
    }

    if (!label && !content.length) continue;
    cells.push([label, content.length ? content : '']);
  }

  // The section heading (h2.entTabcaTitle) lives inside the block container:
  // keep it as default content above the block.
  const title = element.querySelector('h2.entTabcaTitle');

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-portfolio', cells });
  if (title) element.before(title);
  element.replaceWith(block);
}
