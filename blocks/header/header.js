// desktop layout from 900px; below that the header collapses behind a hamburger
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * Relative image paths are resolved against the fragment URL, not the page URL.
 * @returns {Promise<DocumentFragment|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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

const directChild = (parent, selector) => [...parent.children].find((c) => c.matches(selector));

function closeAll(nav, except) {
  nav.querySelectorAll('.is-open').forEach((open) => {
    if (open === except) return;
    open.classList.remove('is-open');
    const trigger = directChild(open, 'button');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

/** keeps an open panel inside the viewport by nudging it left */
function clampPanel(panel) {
  panel.style.removeProperty('left');
  if (!isDesktop.matches) return;
  const rect = panel.getBoundingClientRect();
  const overflow = rect.right - (document.documentElement.clientWidth - 8);
  if (overflow > 0) panel.style.left = `${-overflow}px`;
}

function openItem(nav, item) {
  closeAll(nav, item);
  item.classList.add('is-open');
  const trigger = directChild(item, 'button');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  const panel = item.querySelector('.nav-panel');
  if (panel) clampPanel(panel);
}

function closeItem(item) {
  item.classList.remove('is-open');
  const trigger = directChild(item, 'button');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

/** one card of a panel grid: icon tile, title link, description */
function buildCard(li) {
  const link = li.querySelector('a');
  const icon = li.querySelector('img');
  const desc = li.querySelector('p');
  const card = el('li', 'nav-card');
  if (icon) {
    icon.alt = '';
    card.append(el('span', 'nav-card-icon', icon));
  }
  if (link) link.className = 'nav-card-link';
  if (desc) desc.className = 'nav-card-desc';
  card.append(el('div', 'nav-card-body', link, desc));
  return card;
}

/** promotional banner: image link + bold title + subtitle */
function buildPromo(li) {
  const link = li.querySelector('a');
  const img = li.querySelector('img');
  const [title, subtitle] = li.querySelectorAll('p');
  const promo = el('a', 'nav-promo');
  promo.href = link ? link.href : '#';
  promo.append(
    el('span', 'nav-promo-text', title && el('span', 'nav-promo-title', title.textContent.trim()), subtitle && el('span', 'nav-promo-subtitle', subtitle.textContent.trim())),
    img && el('span', 'nav-promo-image', img),
  );
  return promo;
}

/**
 * content pane: title, optional promo banner, card grid, optional footer link.
 * Category panes also get a toggle that turns them into an accordion on mobile.
 */
function buildPane(titleText, list, more, collapsible = false) {
  const pane = el('div', 'nav-panel-pane', el('p', 'nav-panel-title', titleText));
  if (collapsible) {
    const toggle = el('button', 'nav-panel-toggle', titleText);
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const expand = !pane.classList.contains('is-expanded');
      pane.parentElement.querySelectorAll('.nav-panel-pane.is-expanded').forEach((other) => {
        other.classList.remove('is-expanded');
        other.querySelector('.nav-panel-toggle').setAttribute('aria-expanded', 'false');
      });
      pane.classList.toggle('is-expanded', expand);
      toggle.setAttribute('aria-expanded', expand ? 'true' : 'false');
    });
    pane.prepend(toggle);
  }
  const grid = el('ul', 'nav-panel-grid');
  [...(list ? list.children : [])].forEach((li) => {
    if (li.querySelector('strong')) pane.append(buildPromo(li));
    else grid.append(buildCard(li));
  });
  pane.append(grid);
  if (more) {
    more.className = 'nav-panel-more';
    pane.append(more);
  }
  return pane;
}

/**
 * Builds a megamenu panel. Categories (list items with their own list) become a sidebar
 * whose hover swaps the content pane; a flat list becomes a single pane.
 */
function buildPanel(list, title) {
  const panel = el('div', 'nav-panel');
  const categories = [...list.children].filter((li) => directChild(li, 'ul'));
  if (!categories.length) {
    panel.append(buildPane(title, list));
    return panel;
  }
  panel.classList.add('nav-panel-has-sidebar');
  const sidebar = el('ul', 'nav-panel-sidebar');
  const content = el('div', 'nav-panel-content');
  const activate = (index) => {
    sidebar.querySelectorAll('.nav-panel-category').forEach((cat, i) => cat.classList.toggle('is-active', i === index));
    content.querySelectorAll('.nav-panel-pane').forEach((pane, i) => { pane.hidden = i !== index; });
  };
  categories.forEach((li, index) => {
    const link = directChild(li, 'a');
    const label = link ? link.textContent.trim() : '';
    const catLink = link || el('a', '', label);
    catLink.className = 'nav-panel-category-link';
    const cat = el('li', 'nav-panel-category', catLink);
    catLink.addEventListener('mouseenter', () => activate(index));
    catLink.addEventListener('focus', () => activate(index));
    sidebar.append(cat);
    content.append(buildPane(label, directChild(li, 'ul'), directChild(li, 'p'), true));
  });
  panel.append(sidebar, content);
  activate(0);
  return panel;
}

function buildMenu(nav, section) {
  const wrapper = el('div', 'nav-sections');
  const list = section.querySelector('ul');
  if (!list) return wrapper;
  const menu = el('ul', 'nav-menu');
  [...list.children].forEach((li) => {
    const sub = directChild(li, 'ul');
    const label = directChild(li, 'p');
    if (sub) {
      const text = label ? label.textContent.trim() : '';
      const trigger = el('button', 'nav-drop-trigger', text);
      trigger.type = 'button';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');
      const item = el('li', 'nav-item nav-drop', trigger, buildPanel(sub, text));
      item.addEventListener('mouseenter', () => { if (isDesktop.matches) openItem(nav, item); });
      item.addEventListener('mouseleave', () => { if (isDesktop.matches) closeItem(item); });
      trigger.addEventListener('click', () => {
        // a pointer click on a hover-opened desktop panel keeps it open (as on the source);
        // keyboard and touch clicks toggle it
        const hovered = isDesktop.matches && item.matches(':hover');
        if (item.classList.contains('is-open') && !hovered) closeItem(item);
        else openItem(nav, item);
      });
      menu.append(item);
    } else {
      const link = li.querySelector('a');
      if (link) link.className = 'nav-menu-link';
      const item = el('li', li.querySelector('strong') ? 'nav-item nav-pill' : 'nav-item nav-link', link);
      menu.append(item);
    }
  });
  wrapper.append(menu);
  return wrapper;
}

function buildSearch(nav, li) {
  const [iconP, clearP, headingP] = [...li.children].filter((c) => c.tagName === 'P');
  const action = iconP.querySelector('a');
  const icon = iconP.querySelector('img');
  const clearIcon = clearP ? clearP.querySelector('img') : null;
  const suggestions = directChild(li, 'ul');

  const trigger = el('button', 'nav-search-trigger', icon);
  trigger.type = 'button';
  trigger.setAttribute('aria-label', icon ? icon.alt : 'search');
  trigger.setAttribute('aria-expanded', 'false');
  if (icon) icon.alt = '';

  const form = el('form', 'nav-search-form');
  form.action = action ? action.href : '';
  form.method = 'get';
  form.setAttribute('role', 'search');
  const input = el('input', 'nav-search-input');
  input.type = 'search';
  input.name = 'query';
  input.placeholder = action ? action.textContent.trim() || icon?.getAttribute('alt') || 'search' : 'search';
  input.setAttribute('aria-label', input.placeholder);
  input.autocomplete = 'off';
  const clear = el('button', 'nav-search-clear', clearIcon);
  clear.type = 'button';
  clear.setAttribute('aria-label', clearIcon ? clearIcon.alt : 'clear search');
  if (clearIcon) clearIcon.alt = '';
  form.append(input, clear);

  const suggest = el('div', 'nav-search-suggest');
  if (headingP) {
    headingP.className = 'nav-search-heading';
    suggest.append(headingP);
  }
  if (suggestions) {
    suggestions.className = 'nav-search-list';
    suggest.append(suggestions);
  }
  const dialog = el('div', 'nav-search-dialog', form, suggest);
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', input.placeholder);
  const backdrop = el('div', 'nav-search-backdrop');
  const item = el('li', 'nav-tool nav-search', trigger, backdrop, dialog);

  const close = () => {
    closeItem(item);
    trigger.focus();
  };
  trigger.addEventListener('click', () => {
    if (item.classList.contains('is-open')) {
      closeItem(item);
    } else {
      openItem(nav, item);
      input.focus();
    }
  });
  clear.addEventListener('click', () => {
    if (input.value) {
      input.value = '';
      input.focus();
    } else {
      close();
    }
  });
  backdrop.addEventListener('click', close);
  dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  return item;
}

function buildDropdownTool(nav, li) {
  const [label, ...headings] = [...li.children].filter((c) => c.tagName === 'P');
  const list = directChild(li, 'ul');
  const img = label ? label.querySelector('img') : null;
  const trigger = el('button', 'nav-tool-trigger');
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'true');
  if (img) {
    trigger.setAttribute('aria-label', img.alt);
    img.alt = '';
    trigger.append(img);
  } else {
    trigger.append(el('span', 'nav-tool-label', label ? label.textContent.trim() : ''));
  }
  list.className = 'nav-tool-menu';
  // extra paragraphs label the menu where it is shown inline (mobile "sign in" card)
  headings.forEach((h) => { h.className = 'nav-tool-heading'; });
  const item = el('li', `nav-tool nav-dropdown${img ? ' nav-dropdown-icon' : ''}`, trigger, ...headings, list);
  trigger.addEventListener('click', () => {
    if (item.classList.contains('is-open')) closeItem(item);
    else openItem(nav, item);
  });
  return item;
}

function buildTools(nav, section) {
  const wrapper = el('div', 'nav-tools');
  const list = section ? section.querySelector('ul') : null;
  if (!list) return wrapper;
  const tools = el('ul', 'nav-tools-list');
  [...list.children].forEach((li) => {
    const search = li.querySelector(':scope > p a[href*="search"]');
    if (search) tools.append(buildSearch(nav, li));
    else if (directChild(li, 'ul')) tools.append(buildDropdownTool(nav, li));
    else tools.append(el('li', 'nav-tool', ...li.childNodes));
  });
  wrapper.append(tools);
  return wrapper;
}

function toggleMenu(nav, hamburger, force) {
  const expanded = force !== undefined ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  hamburger.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  if (!expanded) closeAll(nav);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const [brandSection, menuSection, toolsSection] = [...fragment.children];
  const nav = el('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  const brand = el('div', 'nav-brand');
  if (brandSection) {
    brand.append(...brandSection.childNodes);
    const logo = brand.querySelector('img');
    if (logo) logo.loading = 'eager';
  }

  const hamburger = el('button', 'nav-hamburger', el('span', 'nav-hamburger-icon'));
  hamburger.type = 'button';
  hamburger.setAttribute('aria-controls', 'nav');

  const sections = buildMenu(nav, menuSection || el('div'));
  // mobile bar shows the highlighted (pill) link as a compact badge next to the logo
  const pill = sections.querySelector('.nav-pill .nav-menu-link');
  const badge = pill ? el('div', 'nav-badge', pill.cloneNode(true)) : null;
  nav.append(...[brand, badge, sections, buildTools(nav, toolsSection), el('div', 'nav-hamburger-wrapper', hamburger)].filter(Boolean));
  toggleMenu(nav, hamburger, false);
  hamburger.addEventListener('click', () => toggleMenu(nav, hamburger));

  // click outside or Escape closes any open dropdown/panel
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) closeAll(nav); });
  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-item.is-open, .nav-tool.is-open');
    if (open) {
      closeItem(open);
      directChild(open, 'button')?.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, hamburger, false);
      hamburger.focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeAll(nav);
    toggleMenu(nav, hamburger, false);
  });

  const navWrapper = el('div', 'nav-wrapper', nav);
  block.append(navWrapper);
}
