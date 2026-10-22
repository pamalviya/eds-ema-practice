/* eslint-disable */
/* global WebImporter */

import carouselHeroBannerParser from './parsers/carousel-hero-banner.js';
import tabsPortfolioParser from './parsers/tabs-portfolio.js';
import carouselAwardsParser from './parsers/carousel-awards.js';
import cardsArticleParser from './parsers/cards-article.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import carouselLogoMarqueeParser from './parsers/carousel-logo-marquee.js';
import columnsContactParser from './parsers/columns-contact.js';
import myviCleanupTransformer from './transformers/myvi-cleanup.js';
import myviSectionsTransformer from './transformers/myvi-sections.js';

const PAGE_TEMPLATE = {
  "name": "business",
  "urls": [
    "https://www.myvi.in/business"
  ],
  "representativeUrl": "https://www.myvi.in/business",
  "description": "Vi Business landing page: hero banner carousel, portfolio tabs, awards slider, case study and blog cards, FAQ, partner logos and support contacts",
  "urlPattern": "/*",
  "blocks": [
    {
      "name": "carousel-hero-banner",
      "instances": [
        "div.banner-container"
      ]
    },
    {
      "name": "tabs-portfolio",
      "instances": [
        "#explore-portfolio div.entTabCarousel"
      ]
    },
    {
      "name": "carousel-awards",
      "instances": [
        "#awards div.awards-body"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        "div.blogs-container div.blogs-body"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "#accordion-1"
      ]
    },
    {
      "name": "carousel-logo-marquee",
      "instances": [
        "#valuable-partners div.partnersliderwrap"
      ]
    },
    {
      "name": "columns-contact",
      "instances": [
        "div.enterprise-dedicated-support-container div.dedicated-info"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Hero banner carousel",
      "selector": [
        "div.banner-container"
      ],
      "style": null,
      "blocks": [
        "carousel-hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Explore Vi business portfolio",
      "selector": [
        "div.enterpriseExploreportfolio",
        "#explore-portfolio"
      ],
      "style": null,
      "blocks": [
        "tabs-portfolio"
      ],
      "defaultContent": [
        "#explore-portfolio h2.entTabcaTitle"
      ]
    },
    {
      "id": "section-3",
      "name": "Awards and accolades",
      "selector": [
        "#awards",
        "div.awards-container-wrapper"
      ],
      "style": "awards-gradient",
      "blocks": [
        "carousel-awards"
      ],
      "defaultContent": [
        "#awards .awards-head-title img",
        "#awards .awards-head-title h2",
        "#awards .awards-head-desc"
      ]
    },
    {
      "id": "section-4",
      "name": "From our case studies",
      "selector": [
        "div.case-studies-container"
      ],
      "style": null,
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        "div.case-studies-container h2.blogs-header-title",
        "div.case-studies-container .blogs-footer a"
      ]
    },
    {
      "id": "section-5",
      "name": "From our blogs",
      "selector": [
        "body > div.blogs-container"
      ],
      "style": null,
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        "body > div.blogs-container h2.blogs-header-title",
        "body > div.blogs-container .blogs-footer a"
      ]
    },
    {
      "id": "section-6",
      "name": "Frequently asked questions",
      "selector": [
        "div.enterpriseFaq",
        "#faqsHome"
      ],
      "style": "light-blue",
      "blocks": [
        "accordion-faq"
      ],
      "defaultContent": [
        "#faqsHome h2"
      ]
    },
    {
      "id": "section-7",
      "name": "Our valuable partners",
      "selector": [
        "div.homePartnersSection",
        "#valuable-partners"
      ],
      "style": null,
      "blocks": [
        "carousel-logo-marquee"
      ],
      "defaultContent": [
        "#valuable-partners h2.maxdsspartnertitle"
      ]
    },
    {
      "id": "section-8",
      "name": "Dedicated support system",
      "selector": [
        "div.enterprise-dedicated-support-container"
      ],
      "style": "beige",
      "blocks": [
        "columns-contact"
      ],
      "defaultContent": [
        "h2.dedicated-heading-h2"
      ]
    }
  ]
};

const parsers = {
  'carousel-hero-banner': carouselHeroBannerParser,
  'tabs-portfolio': tabsPortfolioParser,
  'carousel-awards': carouselAwardsParser,
  'cards-article': cardsArticleParser,
  'accordion-faq': accordionFaqParser,
  'carousel-logo-marquee': carouselLogoMarqueeParser,
  'columns-contact': columnsContactParser,
};

const transformers = [myviCleanupTransformer, myviSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
