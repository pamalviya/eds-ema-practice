// columns sit side by side from 900px; below that the link groups are accordions
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * Relative image paths are resolved against the fragment URL, not the page URL.
 * @returns {Promise<DocumentFragment|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const tpl = document.createElement('template');
  tpl.innerHTML = await resp.text();
  const base = new URL(resp.url, window.location.origin);
  tpl.content.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.loading = 'lazy';
  });
  return tpl.content;
}

const el = (tag, className, ...children) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter(Boolean));
  return node;
};

/** brand column: logo, name, description, social icons */
function buildBrand(section) {
  const brand = el('div', 'footer-brand');
  const [logo, name, description] = [...section.children].filter((c) => c.tagName === 'P');
  if (logo) logo.className = 'footer-logo';
  if (name) name.className = 'footer-name';
  if (description) description.className = 'footer-description';
  brand.append(...[logo, name, description].filter(Boolean));
  const social = section.querySelector('ul');
  if (social) {
    social.className = 'footer-social';
    social.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      if (img) {
        a.setAttribute('aria-label', img.alt);
        img.alt = '';
      }
    });
    brand.append(social);
  }
  return brand;
}

/** decorative accordion caret (flipped via CSS when the group is open) */
const caret = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'footer-group-caret');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M7.5 10h9L12 15z');
  svg.append(path);
  return svg;
};

const setOpen = (column, open) => {
  column.classList.toggle('is-open', open);
  column.querySelector('.footer-group-toggle').setAttribute('aria-expanded', open ? 'true' : 'false');
};

/** one column per link group; the heading is an accordion toggle on mobile (one open at a time) */
function buildGroups(section) {
  const columns = [];
  const list = section.querySelector('ul');
  if (!list) return columns;
  [...list.children].forEach((li, i) => {
    const heading = li.querySelector(':scope > p');
    const links = li.querySelector(':scope > ul');
    if (!links) return;
    const id = `footer-group-${i}`;
    links.id = id;
    links.className = 'footer-links';
    const toggle = el('button', 'footer-group-toggle', heading ? heading.textContent.trim() : '', caret());
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', id);
    toggle.setAttribute('aria-expanded', 'false');
    const column = el('div', 'footer-group', el('h2', 'footer-group-heading', toggle), links);
    toggle.addEventListener('click', () => {
      if (isDesktop.matches) return;
      const open = !column.classList.contains('is-open');
      columns.forEach((other) => setOpen(other, false));
      setOpen(column, open);
    });
    columns.push(column);
  });
  return columns;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const [brandSection, linksSection, legalSection] = [...fragment.children];
  const top = el('div', 'footer-top', el('div', 'footer-top-inner', brandSection && buildBrand(brandSection), ...(linksSection ? buildGroups(linksSection) : [])));
  const legal = el('div', 'footer-legal');
  if (legalSection) legal.append(el('div', 'footer-legal-inner', ...legalSection.childNodes));

  // headings are only toggles on mobile: reset the accordion when crossing the breakpoint
  isDesktop.addEventListener('change', () => {
    top.querySelectorAll('.footer-group').forEach((column) => setOpen(column, false));
  });

  block.append(top, legal);
}
