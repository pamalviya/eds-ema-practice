/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-business.js
  var import_business_exports = {};
  __export(import_business_exports, {
    default: () => import_business_default
  });

  // tools/importer/parsers/carousel-hero-banner.js
  function parse(element, { document }) {
    const cells = [];
    let slides = [...element.querySelectorAll(".slick-slide:not(.slick-cloned) .banner-slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".banner-slide")];
    slides.forEach((slide) => {
      const img = slide.querySelector("img.banner-image, img");
      if (!img) return;
      const image = document.createElement("img");
      image.src = img.getAttribute("src") || img.src;
      image.alt = img.getAttribute("alt") || "";
      const cta = slide.querySelector("a.banner-btn") || [...slide.querySelectorAll("a[href]")].find((a) => a.textContent.trim());
      let ctaCell = "";
      if (cta) {
        const label = (cta.textContent || cta.getAttribute("title") || "").trim();
        const href = (cta.getAttribute("href") || "").trim();
        if (label) {
          if (href) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = href;
            a.textContent = label;
            p.append(a);
            ctaCell = p;
          } else {
            const p = document.createElement("p");
            p.textContent = label;
            ctaCell = p;
          }
        }
      }
      cells.push([image, ctaCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-portfolio.js
  function parse2(element, { document }) {
    const cells = [];
    const labels = [...element.querySelectorAll(".entTabSection .nav-item a.nav-link")].filter((a) => !a.closest(".slick-cloned"));
    const panes = [...element.querySelectorAll(".entContentSlider .tab-content > .tab-pane")];
    const buildSlide = (slide) => {
      const out = [];
      const img = slide.querySelector(".entTabcaSlideLeft img.sliderDeskImg") || slide.querySelector(".entTabcaSlideLeft img:not(.slidermobImg)");
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src") || img.src;
        image.alt = img.getAttribute("alt") || "";
        out.push(image);
      }
      const right = slide.querySelector(".entTabcaSlideRght") || slide;
      const heading = right.querySelector("h3, .entRghtContentHead");
      if (heading && heading.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = heading.textContent.trim();
        out.push(h3);
      }
      const text = right.querySelector("p.entRghtText, p");
      if (text && text.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = text.textContent.trim();
        out.push(p);
      }
      const btn = right.querySelector("button.entSliderCTA");
      const link = right.querySelector("a[href]") || btn && btn.closest("a[href]");
      const label = (btn && btn.textContent || link && link.textContent || "").trim();
      if (label) {
        const p = document.createElement("p");
        const href = link ? (link.getAttribute("href") || "").trim() : "";
        if (href) {
          const a = document.createElement("a");
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
      const label = labelEl ? (labelEl.textContent || labelEl.getAttribute("title") || "").trim() : "";
      const content = [];
      if (pane) {
        let slides = [...pane.querySelectorAll(".slick-slide:not(.slick-cloned) .entTabcaSlide")];
        if (!slides.length) slides = [...pane.querySelectorAll(".entTabcaSlide")];
        slides.forEach((slide) => content.push(...buildSlide(slide)));
      }
      if (!label && !content.length) continue;
      cells.push([label, content.length ? content : ""]);
    }
    const title = element.querySelector("h2.entTabcaTitle");
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-portfolio", cells });
    if (title) element.before(title);
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  function parse3(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(".slick-slide:not(.slick-cloned) .slide-custom")];
    if (!items.length) items = [...element.querySelectorAll(".slide-custom")];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const img = item.querySelector("img");
      const titleEl = item.querySelector(".award-title");
      const descEl = item.querySelector(".award-desc");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const desc = descEl ? descEl.textContent.trim() : "";
      const src = img ? img.getAttribute("src") || img.src || "" : "";
      const key = `${title}|${desc}|${src}`;
      if (!title && !desc && !src || seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (img) {
        const image = document.createElement("img");
        image.src = src;
        image.alt = img.getAttribute("alt") || title;
        imageCell = image;
      }
      const content = [];
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = title;
        p.append(strong);
        content.push(p);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      cells.push([imageCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse4(element, { document }) {
    const cells = [];
    let items = [...element.querySelectorAll(".slick-slide:not(.slick-cloned) .slide-custom")];
    if (!items.length) items = [...element.querySelectorAll(".slide-custom")];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const img = item.querySelector("img.blog-img");
      const titleEl = item.querySelector(".blog-title");
      const descEl = item.querySelector(".blog-desc");
      const dateEl = item.querySelector(".blog-date-span");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const desc = descEl ? descEl.textContent.trim() : "";
      const date = dateEl ? dateEl.textContent.trim() : "";
      const linkEl = titleEl && titleEl.closest("a[href]") || item.querySelector("a[href]") || item.parentElement && item.parentElement.querySelector(":scope > a[href]");
      const href = linkEl ? (linkEl.getAttribute("href") || "").trim() : "";
      if (!title && !img) return;
      const key = `${href}|${title}`;
      if (seen.has(key)) return;
      seen.add(key);
      let imageCell = "";
      if (img) {
        const image = document.createElement("img");
        image.src = img.getAttribute("src") || img.src;
        image.alt = img.getAttribute("alt") || title;
        imageCell = image;
      }
      const content = [];
      if (title) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = title;
          p.append(a);
        } else {
          p.textContent = title;
        }
        content.push(p);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      if (date) {
        const p = document.createElement("p");
        p.textContent = date;
        content.push(p);
      }
      cells.push([imageCell, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var FALLBACK_FAQ = [
    {
      "name": "1. Which segments do we cater to?",
      "text": "\n	We provide total communications solutions to empower global and Indian corporations, public sector &amp; government bodies, small &amp; medium enterprises, and start-ups.\n	With market-leading enterprise mobility, robust fixed line connectivity, world-class IoT solutions and insightful business analytics &amp; digital solutions, we bring the smartest and newest technologies to serve businesses in the digital era.\n	We have built strong relationships with our enterprise customers by providing enterprise-grade solutions and services over the past several years.\n"
    },
    {
      "name": "2. How are we helping digitally transform large businesses?",
      "text": "\n	Our flexible infrastructure gives large businesses the digital tools they need to reinvent and grow in a dynamic environment.\n	Our solutions reduce the cost and complexity of managing global communications, while giving clear cost visibility and worldwide control of all assets.\n	&nbsp;Our Mobility, Connectivity, Cloud, Communications, and IoT solutions are helping large businesses create new products, revenue streams and routes to market.\n	With our transformative solutions, large businesses can respond faster while gaining insight, controlling costs, and managing security effectively.\n"
    },
    {
      "name": "3. How do we cater to the needs of the Government?",
      "text": "\n	Our company is fully committed towards the Government\u2019s vision of Digital India\n	We believe that IoT has the potential to grow multi-fold in the near future amidst the government\u2019s push towards \u2018Digital India\u2019 and \u2018Smart Cities\u2019.\n	We are a single point, trusted partner that serves the needs of today\u2019s Enterprises and Government Bodies.\n	We did it for&nbsp;Guwahati Municipal Corporation\u2019s (GMC) Smart City programme:\n	This is one example of the intelligent technology we bring to the table under Vi\u2019s Enterprise Mobility offerings. We provided more than 2500 Vi Mobility SIMs which helped the GMC to remotely connect with their workers \u2013 each SIM was enabled with our Vi Business location tracking solution.\n	We also helped&nbsp;Digital and Atma Nirbhar Bharat:\n	Here we made Government services easily accessible to citizens with our communication solutions \u2013 transforming how public services are delivered to citizens.\n	We believe that VIL, with its differentiated end-to-end IoT solutions, is well positioned for the Digital India vision\n"
    },
    {
      "name": "4. How does Vi Business help MSMEs?",
      "text": "\n	Our tailor-made solutions are carefully curated by considering the diverse range of SMEs in India and the unique set of challenges that accompany them.\n	Our SME portfolio is backed by a strong, integrated, ever-dependable, dynamic, and self-reliant network to improve data experience.\n	It is supported by a range of digital transformation solutions and partnerships that help SMEs with digitalisation, collaboration, security, networking, customer engagement and workforce management.\n	We also ensure workforce productivity through Mobility and Collaboration solutions such as Google Workspace.\n	Vi Business Plus, our industry-leading mobility plans, come with a host of value-added services like location tracking, mobile security, entertainment and more, enabling a productive workforce.\n	Vi Business also provides connectivity solutions such as reliable internet to serve critical business needs with Enterprise grade SLA.\n	We also provide Vi Business CCaaS solution that provides truly omnichannel support with chat, call, email.\n"
    },
    {
      "name": "5. What is the ReadyForNext digital assessment?",
      "text": "\n	Our Vi Business ReadyForNext programme has been recognized as India's largest digital advisory for small and medium businesses, for the Second consecutive year, and we have now engaged with over 2.5 lakh MSMEs across 16 sectors.\n	These engagements are focused on offering an consultative approach to measure a company's digital maturity and making the company digitally first through our products and solutions.\n	The assessment originally evaluated readiness on three parameters and has since been expanded to four pillars:\n	\n		Digital Customers: To what extent are MSMEs ready to serve their customers digitally.\n		Digital Workplace: Adoption of workplace collaboration platforms, productivity suites, HRMS solutions and digital ways of working. This is the fastest-growing pillar, rising from a score of 57.5 in 2023 to 65.7 in 2026.\n		Digital Operations: Use of technology to streamline processes, improve efficiency and strengthen business resilience, with scores improving from 56.5 to 62.0 over the same period.\n		Financial Readiness (new in 5.0): A newly introduced fourth pillar that benchmarks MSMEs' funding readiness and risk coverage awareness, helping map how effectively businesses convert digital gains into financial strength.\n	\n	\n	Key findings from the latest Vi Business MSME Growth Insights Study (2026):\n	\n		The overall Digital Maturity Index (DMI) has risen to 60.8, up from 58.0 in 2025 and 55.9 in 2023.\n		57% of surveyed MSMEs now view AI as a core tool to enhance and accelerate business growth.\n		Nearly half (46.3%) of MSMEs have adopted cyber defence solutions, a major driver of DMI growth.\n		Women-led MSMEs recorded a higher DMI (61.6) than male-led businesses (60.4).\n		Financial Services is now India's most digitally mature sector (DMI 67.3), overtaking IT &amp; ITeS (66.2), followed by Transportation, Energy &amp; Utilities, and Tourism &amp; Hospitality.\n	\n	\n"
    },
    {
      "name": "6. What is FInancial Readiness?",
      "text": "\n	Vi Business has expanded ReadyForNext by introducing Financial Readiness as a fourth pillar alongside Digital Maturity, Digital Workplace, and Digital Operations, aimed at benchmarking MSMEs' funding readiness and risk coverage awareness.\n\n\n&nbsp;"
    },
    {
      "name": "7. How is our network superior to our competition?",
      "text": "\n	Vodafone Idea has a total of 8,030.4 MHz of spectrum across difference frequency bands out of which 8,012.2 MHz spectrum is liberalized and can be used towards deployment of any technology.\n	This includes the spectrum acquired in June 2024 auction i.e. 900 MHz band sub GHz spectrum in 7 circles, namely Andhra Pradesh, Tamil Nadu, Karnataka, Punjab, Rajasthan, UP East and Kolkata, 1800 MHz spectrum in Madhya Pradesh and 2500 MHz spectrum in Bihar.\n	We also have the mid band 5G spectrum (3300 MHz band) in our 17 priority circles and mmWave 5G spectrum (26 GHz band) in 16 circles.\n	The Company has large network assets in the form of 2G and 4G equipment and country wide optical fibre cable (OFC).\n	The Company has presence in over 184,200 unique locations and has almost 439,600 broadband (3G+4G+5G) sites.\n	Its 4G population coverage is over 1.05 billion Indians as of September 30, 2024 and over last 6 months the Company has expanded its population coverage by 22 million.\n	The Company has a portfolio of over 303,500 km of OFC including own built, IRU OFC and excluding overlapping routes.\n	The site expansion, coupled with the deployment of TDD sites, DSR, Small Cells and Massive MIMO has enabled further capacity enhancement\n	It enables us to offer superior experience to our customers as well as strengthen our enterprise offerings and provide new opportunities for business growth in the emerging 5G era. We thus have a solid portfolio of spectrum across all bands in all our priority circles.\n"
    },
    {
      "name": "8. What are your 5G plans?",
      "text": "Explore our 5G plans designed to deliver ultra-fast speeds, low latency, and seamless connectivity for all your needs. Check out our 5G plans&nbsp;here"
    },
    {
      "name": "9. Why is Easy+ beneficial for me?",
      "text": "Easy+ lets you purchase services at your convenience for personal use, with instant payments and no approval processes to slow you down."
    },
    {
      "name": "10. What special offers are available with Easy+?",
      "text": "When you download the&nbsp;Vi App&nbsp;for the first time, you'll receive free 50 GB data. T&amp;C Apply."
    }
  ];
  function parse5(element, { document }) {
    const cells = [];
    const normalize = (s) => (s || "").replace(/ /g, " ").replace(/^\s*\d+\s*[.)]\s*/, "").replace(/\s+/g, " ").trim().toLowerCase();
    const decode = (s) => (s || "").replace(/&nbsp;/gi, " ").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&").replace(/ /g, " ");
    const collectFaq = (node, out) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach((n) => collectFaq(n, out));
        return;
      }
      const type = [].concat(node["@type"] || []);
      if (type.includes("FAQPage") && node.mainEntity) {
        [].concat(node.mainEntity).forEach((q) => {
          if (!q || !q.name) return;
          const ans = q.acceptedAnswer ? [].concat(q.acceptedAnswer)[0] : null;
          out.push({ name: String(q.name).trim(), text: ans && ans.text ? String(ans.text) : "" });
        });
      }
      if (node["@graph"]) collectFaq(node["@graph"], out);
    };
    const faq = [];
    const docs = [document, element.ownerDocument].filter((d, i, arr) => d && arr.indexOf(d) === i);
    docs.forEach((doc) => {
      if (faq.length) return;
      doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
        try {
          collectFaq(JSON.parse(s.textContent), faq);
        } catch (e) {
        }
      });
    });
    const buildAnswer = (raw) => {
      const out = [];
      const hasHtml = /<\s*(p|ul|ol|li|a|br|strong|b|div)\b/i.test(raw);
      if (hasHtml) {
        const div = document.createElement("div");
        div.innerHTML = raw;
        return [...div.childNodes].filter((n) => n.nodeType === 1 || (n.textContent || "").trim());
      }
      const lines = raw.split(/\r?\n/).map((l) => {
        const m = l.match(/^[\t ]*/)[0];
        const level = (m.match(/\t/g) || []).length;
        return { level, text: decode(l).replace(/\s+/g, " ").trim() };
      }).filter((l) => l.text);
      let i = 0;
      while (i < lines.length) {
        if (lines[i].level === 0) {
          const p = document.createElement("p");
          p.textContent = lines[i].text;
          out.push(p);
          i += 1;
          continue;
        }
        const group = [];
        while (i < lines.length && lines[i].level > 0) {
          group.push(lines[i]);
          i += 1;
        }
        const base = Math.min(...group.map((g) => g.level));
        const topCount = group.filter((g) => g.level === base).length;
        if (group.length === 1 && topCount === 1) {
          const p = document.createElement("p");
          p.textContent = group[0].text;
          out.push(p);
          continue;
        }
        const ul = document.createElement("ul");
        let lastLi = null;
        let nested = null;
        group.forEach((g) => {
          if (g.level === base || !lastLi) {
            lastLi = document.createElement("li");
            lastLi.textContent = g.text;
            ul.append(lastLi);
            nested = null;
          } else {
            if (!nested) {
              nested = document.createElement("ul");
              lastLi.append(nested);
            }
            const li = document.createElement("li");
            li.textContent = g.text;
            nested.append(li);
          }
        });
        out.push(ul);
      }
      return out;
    };
    const domQuestions = [...element.querySelectorAll(".card")].map((card) => card.querySelector(".card-header h3, .card-header h2") || card.querySelector(".card-header")).filter(Boolean).map((h) => h.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
    const faqSource = faq.length ? faq : FALLBACK_FAQ;
    const items = [];
    if (faqSource.length) {
      const used = /* @__PURE__ */ new Set();
      faqSource.forEach((f) => {
        const dom = domQuestions.find((q) => normalize(q) === normalize(f.name));
        if (dom) used.add(dom);
        items.push({ question: dom || f.name, answer: f.text });
      });
      domQuestions.forEach((q) => {
        if (!used.has(q)) items.push({ question: q, answer: "" });
      });
    } else {
      domQuestions.forEach((q) => items.push({ question: q, answer: "" }));
    }
    items.forEach(({ question, answer }) => {
      const answerNodes = answer ? buildAnswer(answer) : [];
      cells.push([question, answerNodes.length ? answerNodes : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-logo-marquee.js
  function parse6(element, { document }) {
    const cells = [];
    let imgs = [...element.querySelectorAll(".partnersliderGroup .item img")];
    if (!imgs.length) imgs = [...element.querySelectorAll("img")];
    const bySrc = /* @__PURE__ */ new Map();
    imgs.forEach((img) => {
      const src = (img.getAttribute("src") || img.src || "").trim();
      if (!src) return;
      const alt = (img.getAttribute("alt") || "").trim();
      const existing = bySrc.get(src);
      if (!existing) {
        const link = img.closest("a[href]");
        bySrc.set(src, { src, alt, href: link ? link.getAttribute("href") : "" });
      } else if (!existing.alt && alt) {
        existing.alt = alt;
      }
    });
    bySrc.forEach(({ src, alt, href }) => {
      const image = document.createElement("img");
      image.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
      image.alt = alt;
      let cell = image;
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.append(image);
        cell = a;
      }
      cells.push([cell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-logo-marquee", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  function parse7(element, { document }) {
    const cells = [];
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let items = [...element.querySelectorAll(":scope > .customer-service, :scope > .sales-enquiries, :scope > .our-email")];
    if (!items.length) items = [...element.children].filter((c) => c.querySelector(".title"));
    const row = [];
    items.forEach((item) => {
      const content = [];
      const img = item.querySelector(".services-icon img, img");
      if (img) {
        const p = document.createElement("p");
        const image = document.createElement("img");
        const src = img.getAttribute("src") || img.src || "";
        image.src = /\.svg$/i.test(src) ? `${src}?v=1` : src;
        image.alt = img.getAttribute("alt") || "";
        p.append(image);
        content.push(p);
      }
      const titleEl = item.querySelector(".title");
      const label = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        content.push(p);
      }
      const mailLink = item.querySelector('a[href^="mailto:"]');
      const valueEl = item.querySelector(".mail-address, .tele, .phonenumber");
      const value = (valueEl ? valueEl.textContent : mailLink ? mailLink.textContent : "").replace(/\s+/g, " ").trim();
      if (value) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        if (mailLink || EMAIL.test(value)) {
          const a = document.createElement("a");
          a.href = mailLink ? mailLink.getAttribute("href") : `mailto:${value}`;
          a.textContent = value;
          strong.append(a);
        } else {
          strong.textContent = value;
        }
        p.append(strong);
        content.push(p);
      }
      if (content.length) row.push(content);
    });
    if (row.length) cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/myvi-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#divLoading",
        // slick carousel duplicate slides (hero banner, awards, logos)
        ".slick-cloned",
        // awards year filter dropdown (interactive control, not content)
        ".year-dropdown-wrapper",
        ".awards-head-right",
        // mobile-only duplicate "view all" links in blog/case-study headers
        ".blogs-header a.view-all-link",
        // go-to-top control
        ".back-to-topBtn",
        // FAQ "see more" toggle (accordion-faq block renders its own)
        ".enterpriseFaq button.showMore",
        // overlays / drawers / popups
        "div.requestCallbackContainer",
        "div.sideDrawer",
        "div.enterpriseCookiepolicypopup"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "div.businessHeaderComponent",
        "nav.col-12.navbar",
        "div.business-footer-container",
        "header",
        "footer",
        // empty FAQ JSON-LD placeholder
        "div.faq-schema",
        // tracking / framework noise
        '[id^="batBeacon"]',
        "next-route-announcer",
        "iframe",
        "script",
        "style",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("on") || n.startsWith("data-gtm") || n.startsWith("data-analytics") || n.startsWith("data-track")) {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/myvi-sections.js
  var MARKER = "data-excat-section-id";
  function findSection(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, section);
        if (!el) continue;
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first", "true");
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const el = findSection(element, section);
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (el && el.parentNode) {
          el.after(meta);
        } else if (marker) {
          let next = marker.nextElementSibling;
          while (next && next.tagName !== "HR") next = next.nextElementSibling;
          if (next) next.parentNode.insertBefore(meta, next);
          else marker.parentNode.appendChild(meta);
        } else {
          continue;
        }
      }
      element.querySelectorAll(`hr[${MARKER}], hr[data-excat-first]`).forEach((hr) => {
        if (hr.hasAttribute("data-excat-first")) {
          hr.remove();
        } else {
          hr.removeAttribute(MARKER);
        }
      });
    }
  }

  // tools/importer/import-business.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-hero-banner": parse,
    "tabs-portfolio": parse2,
    "carousel-awards": parse3,
    "cards-article": parse4,
    "accordion-faq": parse5,
    "carousel-logo-marquee": parse6,
    "columns-contact": parse7
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
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
  var import_business_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_business_exports);
})();
