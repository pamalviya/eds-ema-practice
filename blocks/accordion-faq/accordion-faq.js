const VISIBLE_COUNT = 6;
let instanceId = 0;

export default function decorate(block) {
  instanceId += 1;
  const groupName = `accordion-faq-${instanceId}`;
  const items = [];
  [...block.children].forEach((row) => {
    const [labelCell, bodyCell] = row.children;
    if (!labelCell || labelCell.textContent.trim() === '') {
      row.remove();
      return;
    }
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    // unwrap a single paragraph/heading so the summary holds inline content only
    const only = labelCell.children.length === 1 ? labelCell.firstElementChild : null;
    summary.append(...(only ? only.childNodes : labelCell.childNodes));

    const body = bodyCell || document.createElement('div');
    body.className = 'accordion-faq-item-body';
    // wrap bare answer text in a paragraph so it gets paragraph spacing
    if (!body.children.length && body.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...body.childNodes);
      body.append(p);
    }

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    // native exclusive accordion: details sharing a name open one at a time
    details.name = groupName;
    details.append(summary, body);
    row.replaceWith(details);
    items.push(details);
  });

  // single-open fallback for browsers without exclusive <details name>
  block.addEventListener('toggle', (e) => {
    if (!e.target.open || !items.includes(e.target)) return;
    items.forEach((item) => {
      if (item !== e.target) item.open = false;
    });
  }, true);

  if (items.length <= VISIBLE_COUNT) return;

  const extra = items.slice(VISIBLE_COUNT);
  extra.forEach((item) => item.classList.add('accordion-faq-item-extra'));

  // collapsed questions stay findable via find-in-page and text fragments
  if (!('onbeforematch' in HTMLElement.prototype)) return;

  const wrap = document.createElement('div');
  wrap.className = 'accordion-faq-more';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'accordion-faq-more-button';

  const setCollapsed = (collapsed) => {
    extra.forEach((item) => {
      if (collapsed) item.setAttribute('hidden', 'until-found');
      else item.removeAttribute('hidden');
    });
    button.setAttribute('aria-expanded', String(!collapsed));
    button.textContent = collapsed ? 'see more' : 'see less';
  };

  setCollapsed(true);
  button.addEventListener('click', () => {
    const collapsed = button.getAttribute('aria-expanded') === 'true';
    setCollapsed(collapsed);
    if (!collapsed) extra[0].querySelector('summary').focus();
  });
  // a find-in-page match inside a collapsed question reveals the full list
  block.addEventListener('beforematch', () => setCollapsed(false));

  wrap.append(button);
  block.append(wrap);
}
