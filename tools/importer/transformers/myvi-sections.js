/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for myvi.in business pages.
 * beforeTransform: inserts <hr> section breaks (and markers for styled sections)
 * while the original section elements still exist.
 * afterTransform: inserts Section Metadata blocks for styled sections.
 */
const MARKER = 'data-excat-section-id';

function findSection(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (!el) continue;
      // first section only gets a (temporary) break when styled
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute('data-excat-first', 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const el = findSection(element, section);
      const meta = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (el && el.parentNode) {
        el.after(meta);
      } else if (marker) {
        // section element was replaced by a parser: place metadata at the end of
        // the section, i.e. before the next section break (or end of parent)
        let next = marker.nextElementSibling;
        while (next && next.tagName !== 'HR') next = next.nextElementSibling;
        if (next) next.parentNode.insertBefore(meta, next);
        else marker.parentNode.appendChild(meta);
      } else {
        continue;
      }
    }

    // clean up markers; drop the temporary first-section break
    element.querySelectorAll(`hr[${MARKER}], hr[data-excat-first]`).forEach((hr) => {
      if (hr.hasAttribute('data-excat-first')) {
        hr.remove();
      } else {
        hr.removeAttribute(MARKER);
      }
    });
  }
}
