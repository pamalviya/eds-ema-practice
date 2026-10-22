/* eslint-disable */
/* global WebImporter */
/**
 * Parser: accordion-faq
 * Source: #accordion-1 (questions only, .card .card-header h3 — numbered "1. ...")
 * Answers are NOT in the DOM; they come from the page's FAQPage JSON-LD
 * (script[type="application/ld+json"]). Questions are matched by normalized text.
 * Model: one row per Q&A -> [question | answer rich text]
 */
// Fallback answers captured from the page FAQPage JSON-LD (migration-work/metadata.json),
// used when the JSON-LD script is not available in the import document. Matched by question text.
const FALLBACK_FAQ = [
  {
    "name": "1. Which segments do we cater to?",
    "text": "\n\tWe provide total communications solutions to empower global and Indian corporations, public sector &amp; government bodies, small &amp; medium enterprises, and start-ups.\n\tWith market-leading enterprise mobility, robust fixed line connectivity, world-class IoT solutions and insightful business analytics &amp; digital solutions, we bring the smartest and newest technologies to serve businesses in the digital era.\n\tWe have built strong relationships with our enterprise customers by providing enterprise-grade solutions and services over the past several years.\n"
  },
  {
    "name": "2. How are we helping digitally transform large businesses?",
    "text": "\n\tOur flexible infrastructure gives large businesses the digital tools they need to reinvent and grow in a dynamic environment.\n\tOur solutions reduce the cost and complexity of managing global communications, while giving clear cost visibility and worldwide control of all assets.\n\t&nbsp;Our Mobility, Connectivity, Cloud, Communications, and IoT solutions are helping large businesses create new products, revenue streams and routes to market.\n\tWith our transformative solutions, large businesses can respond faster while gaining insight, controlling costs, and managing security effectively.\n"
  },
  {
    "name": "3. How do we cater to the needs of the Government?",
    "text": "\n\tOur company is fully committed towards the Government’s vision of Digital India\n\tWe believe that IoT has the potential to grow multi-fold in the near future amidst the government’s push towards ‘Digital India’ and ‘Smart Cities’.\n\tWe are a single point, trusted partner that serves the needs of today’s Enterprises and Government Bodies.\n\tWe did it for&nbsp;Guwahati Municipal Corporation’s (GMC) Smart City programme:\n\tThis is one example of the intelligent technology we bring to the table under Vi’s Enterprise Mobility offerings. We provided more than 2500 Vi Mobility SIMs which helped the GMC to remotely connect with their workers – each SIM was enabled with our Vi Business location tracking solution.\n\tWe also helped&nbsp;Digital and Atma Nirbhar Bharat:\n\tHere we made Government services easily accessible to citizens with our communication solutions – transforming how public services are delivered to citizens.\n\tWe believe that VIL, with its differentiated end-to-end IoT solutions, is well positioned for the Digital India vision\n"
  },
  {
    "name": "4. How does Vi Business help MSMEs?",
    "text": "\n\tOur tailor-made solutions are carefully curated by considering the diverse range of SMEs in India and the unique set of challenges that accompany them.\n\tOur SME portfolio is backed by a strong, integrated, ever-dependable, dynamic, and self-reliant network to improve data experience.\n\tIt is supported by a range of digital transformation solutions and partnerships that help SMEs with digitalisation, collaboration, security, networking, customer engagement and workforce management.\n\tWe also ensure workforce productivity through Mobility and Collaboration solutions such as Google Workspace.\n\tVi Business Plus, our industry-leading mobility plans, come with a host of value-added services like location tracking, mobile security, entertainment and more, enabling a productive workforce.\n\tVi Business also provides connectivity solutions such as reliable internet to serve critical business needs with Enterprise grade SLA.\n\tWe also provide Vi Business CCaaS solution that provides truly omnichannel support with chat, call, email.\n"
  },
  {
    "name": "5. What is the ReadyForNext digital assessment?",
    "text": "\n\tOur Vi Business ReadyForNext programme has been recognized as India's largest digital advisory for small and medium businesses, for the Second consecutive year, and we have now engaged with over 2.5 lakh MSMEs across 16 sectors.\n\tThese engagements are focused on offering an consultative approach to measure a company's digital maturity and making the company digitally first through our products and solutions.\n\tThe assessment originally evaluated readiness on three parameters and has since been expanded to four pillars:\n\t\n\t\tDigital Customers: To what extent are MSMEs ready to serve their customers digitally.\n\t\tDigital Workplace: Adoption of workplace collaboration platforms, productivity suites, HRMS solutions and digital ways of working. This is the fastest-growing pillar, rising from a score of 57.5 in 2023 to 65.7 in 2026.\n\t\tDigital Operations: Use of technology to streamline processes, improve efficiency and strengthen business resilience, with scores improving from 56.5 to 62.0 over the same period.\n\t\tFinancial Readiness (new in 5.0): A newly introduced fourth pillar that benchmarks MSMEs' funding readiness and risk coverage awareness, helping map how effectively businesses convert digital gains into financial strength.\n\t\n\t\n\tKey findings from the latest Vi Business MSME Growth Insights Study (2026):\n\t\n\t\tThe overall Digital Maturity Index (DMI) has risen to 60.8, up from 58.0 in 2025 and 55.9 in 2023.\n\t\t57% of surveyed MSMEs now view AI as a core tool to enhance and accelerate business growth.\n\t\tNearly half (46.3%) of MSMEs have adopted cyber defence solutions, a major driver of DMI growth.\n\t\tWomen-led MSMEs recorded a higher DMI (61.6) than male-led businesses (60.4).\n\t\tFinancial Services is now India's most digitally mature sector (DMI 67.3), overtaking IT &amp; ITeS (66.2), followed by Transportation, Energy &amp; Utilities, and Tourism &amp; Hospitality.\n\t\n\t\n"
  },
  {
    "name": "6. What is FInancial Readiness?",
    "text": "\n\tVi Business has expanded ReadyForNext by introducing Financial Readiness as a fourth pillar alongside Digital Maturity, Digital Workplace, and Digital Operations, aimed at benchmarking MSMEs' funding readiness and risk coverage awareness.\n\n\n&nbsp;"
  },
  {
    "name": "7. How is our network superior to our competition?",
    "text": "\n\tVodafone Idea has a total of 8,030.4 MHz of spectrum across difference frequency bands out of which 8,012.2 MHz spectrum is liberalized and can be used towards deployment of any technology.\n\tThis includes the spectrum acquired in June 2024 auction i.e. 900 MHz band sub GHz spectrum in 7 circles, namely Andhra Pradesh, Tamil Nadu, Karnataka, Punjab, Rajasthan, UP East and Kolkata, 1800 MHz spectrum in Madhya Pradesh and 2500 MHz spectrum in Bihar.\n\tWe also have the mid band 5G spectrum (3300 MHz band) in our 17 priority circles and mmWave 5G spectrum (26 GHz band) in 16 circles.\n\tThe Company has large network assets in the form of 2G and 4G equipment and country wide optical fibre cable (OFC).\n\tThe Company has presence in over 184,200 unique locations and has almost 439,600 broadband (3G+4G+5G) sites.\n\tIts 4G population coverage is over 1.05 billion Indians as of September 30, 2024 and over last 6 months the Company has expanded its population coverage by 22 million.\n\tThe Company has a portfolio of over 303,500 km of OFC including own built, IRU OFC and excluding overlapping routes.\n\tThe site expansion, coupled with the deployment of TDD sites, DSR, Small Cells and Massive MIMO has enabled further capacity enhancement\n\tIt enables us to offer superior experience to our customers as well as strengthen our enterprise offerings and provide new opportunities for business growth in the emerging 5G era. We thus have a solid portfolio of spectrum across all bands in all our priority circles.\n"
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

export default function parse(element, { document }) {
  const cells = [];

  const normalize = (s) => (s || '')
    .replace(/ /g, ' ')
    .replace(/^\s*\d+\s*[.)]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const decode = (s) => (s || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/ /g, ' ');

  // ---- Collect FAQPage entries from JSON-LD (original document, before cleanup) ----
  const collectFaq = (node, out) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((n) => collectFaq(n, out)); return; }
    const type = [].concat(node['@type'] || []);
    if (type.includes('FAQPage') && node.mainEntity) {
      [].concat(node.mainEntity).forEach((q) => {
        if (!q || !q.name) return;
        const ans = q.acceptedAnswer ? [].concat(q.acceptedAnswer)[0] : null;
        out.push({ name: String(q.name).trim(), text: ans && ans.text ? String(ans.text) : '' });
      });
    }
    if (node['@graph']) collectFaq(node['@graph'], out);
  };

  const faq = [];
  const docs = [document, element.ownerDocument].filter((d, i, arr) => d && arr.indexOf(d) === i);
  docs.forEach((doc) => {
    if (faq.length) return;
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try { collectFaq(JSON.parse(s.textContent), faq); } catch (e) { /* ignore malformed */ }
    });
  });

  // ---- Build answer DOM from JSON-LD text ----
  // Answer text is stripped HTML: tab-indented lines are list items,
  // deeper indentation = nested list, unindented lines = paragraphs.
  const buildAnswer = (raw) => {
    const out = [];
    const hasHtml = /<\s*(p|ul|ol|li|a|br|strong|b|div)\b/i.test(raw);
    if (hasHtml) {
      const div = document.createElement('div');
      div.innerHTML = raw;
      return [...div.childNodes].filter((n) => n.nodeType === 1 || (n.textContent || '').trim());
    }

    const lines = raw.split(/\r?\n/)
      .map((l) => {
        const m = l.match(/^[\t ]*/)[0];
        const level = (m.match(/\t/g) || []).length;
        return { level, text: decode(l).replace(/\s+/g, ' ').trim() };
      })
      .filter((l) => l.text);

    let i = 0;
    while (i < lines.length) {
      if (lines[i].level === 0) {
        const p = document.createElement('p');
        p.textContent = lines[i].text;
        out.push(p);
        i += 1;
        continue;
      }
      // group consecutive indented lines into a list
      const group = [];
      while (i < lines.length && lines[i].level > 0) { group.push(lines[i]); i += 1; }
      const base = Math.min(...group.map((g) => g.level));
      const topCount = group.filter((g) => g.level === base).length;
      if (group.length === 1 && topCount === 1) {
        const p = document.createElement('p');
        p.textContent = group[0].text;
        out.push(p);
        continue;
      }
      const ul = document.createElement('ul');
      let lastLi = null;
      let nested = null;
      group.forEach((g) => {
        if (g.level === base || !lastLi) {
          lastLi = document.createElement('li');
          lastLi.textContent = g.text;
          ul.append(lastLi);
          nested = null;
        } else {
          if (!nested) { nested = document.createElement('ul'); lastLi.append(nested); }
          const li = document.createElement('li');
          li.textContent = g.text;
          nested.append(li);
        }
      });
      out.push(ul);
    }
    return out;
  };

  // ---- Questions from DOM ----
  const domQuestions = [...element.querySelectorAll('.card')]
    .map((card) => card.querySelector('.card-header h3, .card-header h2') || card.querySelector('.card-header'))
    .filter(Boolean)
    .map((h) => h.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  // JSON-LD from the document; fallback to captured FAQ data (matched by question text)
  const faqSource = faq.length ? faq : FALLBACK_FAQ;

  const items = [];
  if (faqSource.length) {
    const used = new Set();
    faqSource.forEach((f) => {
      // prefer DOM question text (keeps numbering) when it matches
      const dom = domQuestions.find((q) => normalize(q) === normalize(f.name));
      if (dom) used.add(dom);
      items.push({ question: dom || f.name, answer: f.text });
    });
    domQuestions.forEach((q) => { if (!used.has(q)) items.push({ question: q, answer: '' }); });
  } else {
    domQuestions.forEach((q) => items.push({ question: q, answer: '' }));
  }

  items.forEach(({ question, answer }) => {
    const answerNodes = answer ? buildAnswer(answer) : [];
    cells.push([question, answerNodes.length ? answerNodes : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
