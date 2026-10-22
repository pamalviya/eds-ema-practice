const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{7,}$/;

// turn a bare phone number or email address into a tel:/mailto: link
function linkify(el) {
  if (el.querySelector('a')) return;
  const text = el.textContent.trim();
  let href;
  if (EMAIL.test(text)) href = `mailto:${text}`;
  else if (PHONE.test(text)) href = `tel:${text.replace(/[^\d+]/g, '')}`;
  if (!href) return;
  const a = document.createElement('a');
  a.href = href;
  a.append(...el.childNodes);
  el.append(a);
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  if (firstRow) block.classList.add(`columns-contact-${firstRow.children.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-contact-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-contact-item');
      const parts = [...col.children];
      const icon = parts.find((el) => el.querySelector('picture, .icon, img') && el.textContent.trim() === '');
      if (icon) icon.classList.add('columns-contact-icon');
      const text = parts.filter((el) => el !== icon && el.textContent.trim() !== '');
      // last text element is the value (phone/email); anything before it is the label
      const value = text.pop();
      text.forEach((el) => el.classList.add('columns-contact-label'));
      if (value) {
        // a bold authored link gets auto-decorated as a button; it is a plain value here
        value.classList.remove('button-wrapper', 'button-container');
        value.querySelectorAll('a.button').forEach((a) => {
          a.classList.remove('button', 'primary', 'secondary', 'accent');
          if (!a.classList.length) a.removeAttribute('class');
        });
        value.classList.add('columns-contact-value');
        linkify(value.querySelector('strong, b') || value);
      }
    });
  });
}
