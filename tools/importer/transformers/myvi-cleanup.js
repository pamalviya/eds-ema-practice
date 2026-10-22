/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for myvi.in business pages.
 * Removes non-authorable chrome (header, footer, drawers, popups, loaders),
 * carousel clones, and widget controls. All selectors come from the captured DOM.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Elements that would interfere with block matching / parsing
    WebImporter.DOMUtils.remove(element, [
      '#divLoading',
      // slick carousel duplicate slides (hero banner, awards, logos)
      '.slick-cloned',
      // awards year filter dropdown (interactive control, not content)
      '.year-dropdown-wrapper',
      '.awards-head-right',
      // mobile-only duplicate "view all" links in blog/case-study headers
      '.blogs-header a.view-all-link',
      // go-to-top control
      '.back-to-topBtn',
      // FAQ "see more" toggle (accordion-faq block renders its own)
      '.enterpriseFaq button.showMore',
      // overlays / drawers / popups
      'div.requestCallbackContainer',
      'div.sideDrawer',
      'div.enterpriseCookiepolicypopup',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Global chrome
    WebImporter.DOMUtils.remove(element, [
      'div.businessHeaderComponent',
      'nav.col-12.navbar',
      'div.business-footer-container',
      'header',
      'footer',
      // empty FAQ JSON-LD placeholder
      'div.faq-schema',
      // tracking / framework noise
      '[id^="batBeacon"]',
      'next-route-announcer',
      'iframe',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Strip tracking / inline event attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (n.startsWith('on') || n.startsWith('data-gtm') || n.startsWith('data-analytics') || n.startsWith('data-track')) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
