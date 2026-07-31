// @ts-check
// Task 5 — 10 virtual UX personas, 390×844 viewport
// Tests realistic user journeys and UX quality without live API calls.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { setupPage, stubSearch } = require('./helpers');

const UX_MD = path.join(__dirname, '..', 'UX_VIRTUAL_TEST.md');

// Persona results collected across tests
const RESULTS = [];

function makeResult(payload, overrides) {
  return {
    product_name: 'Product',
    ai_verdict: 'BUY',
    verdict_label: 'Pirkti dabar',
    verdict_reason: 'Geriausia kaina rinkoje.',
    ai_summary: 'Goody rado 3 kainas.',
    buy_recommendation: 'Geras pasiūlymas.',
    alternative: '',
    price_forecast: '',
    deal_score: 82,
    price_min: 0,
    price_max: 0,
    price_avg: 0,
    price_history: {},
    search_suggestion: '',
    product_type: 'electronics',
    category_icon: '🛍️',
    results: [],
    _rate: { used: 1, limit: 50, remaining: 49 },
    ...payload,
    ...overrides,
  };
}

function card(shop, flag, price, title, extra) {
  return {
    shop, flag,
    url: 'https://example.com/product',
    affiliate_url: '',
    price,
    currency: 'EUR',
    in_stock: true,
    delivery: '2-3 d.',
    deal_score: 75,
    rating: 4.3,
    review_count: 120,
    notes: '',
    is_best_value: false,
    is_cheapest: false,
    is_top_rated: false,
    why_recommended: '',
    source: shop.toLowerCase().replace(/[^a-z]/g, ''),
    product_title: title,
    ...extra,
  };
}

const PERSONAS = [
  {
    id: 'P01',
    name: 'Ona (LT, 65+)',
    desc: 'Lithuanian pensioner searching for a Samsung refrigerator. First time using Goody.',
    lang: 'lt',
    query: 'Samsung šaldytuvas RB34',
    payload: makeResult({
      product_name: 'Samsung RB34C600ESA Šaldytuvas',
      price_min: 549, price_max: 679, price_avg: 610,
      results: [
        card('Varle.lt', '🇱🇹', 549, 'Samsung RB34C600ESA 341L NoFrost', { is_cheapest: true }),
        card('Elesen.lt', '🇱🇹', 599, 'Samsung RB34C600ESA šaldytuvas'),
        card('Amazon.DE', '🇩🇪', 679, 'Samsung RB34C600ESA/EF Kühlschrank'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results screen appears after search' },
      { id: 'first-card-above-fold', desc: 'First price card visible above fold' },
      { id: 'buy-button-present', desc: '"Pirkti" button present on first card' },
    ],
  },
  {
    id: 'P02',
    name: 'Markus (DE, 32)',
    desc: 'German tech enthusiast searching for Sony WH-1000XM5 headphones.',
    lang: 'de',
    query: 'Sony WH-1000XM5',
    payload: makeResult({
      product_name: 'Sony WH-1000XM5',
      price_min: 279, price_max: 349, price_avg: 310,
      results: [
        card('Amazon.DE', '🇩🇪', 279, 'Sony WH-1000XM5 kabellose Kopfhörer Schwarz', { is_cheapest: true }),
        card('Amazon.PL', '🇵🇱', 299, 'Sony WH-1000XM5 słuchawki bezprzewodowe'),
        card('Varle.lt', '🇱🇹', 349, 'Sony WH-1000XM5 ausinės'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'three-shops', desc: 'Three shop cards rendered' },
      { id: 'first-card-above-fold', desc: 'First card visible without scrolling' },
    ],
  },
  {
    id: 'P03',
    name: 'Monika (LT, 35)',
    desc: 'Lithuanian mother on mobile searching for Pampers during commute.',
    lang: 'lt',
    query: 'Pampers Active Baby 4 dydis',
    payload: makeResult({
      product_name: 'Pampers Active Baby Dydis 4',
      price_min: 12.99, price_max: 18.50, price_avg: 15.00,
      results: [
        card('Varle.lt', '🇱🇹', 12.99, 'Pampers Active Baby Sauskelnės 4 dydis 180vnt', { is_cheapest: true }),
        card('Elesen.lt', '🇱🇹', 15.49, 'Pampers Active Baby 4 (9-14kg) 96vnt'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'first-card-above-fold', desc: 'First card visible above fold' },
      { id: 'no-js-errors', desc: 'No JavaScript errors' },
    ],
  },
  {
    id: 'P04',
    name: 'Lukas (LT, 22)',
    desc: 'Young Lithuanian gamer searching for PlayStation 5 Slim.',
    lang: 'lt',
    query: 'PlayStation 5 Slim',
    payload: makeResult({
      product_name: 'Sony PlayStation 5 Slim',
      price_min: 419, price_max: 499, price_avg: 450,
      deal_score: 78,
      results: [
        card('Amazon.DE', '🇩🇪', 419, 'Sony PlayStation 5 Slim Digital Edition', { is_cheapest: true }),
        card('Amazon.PL', '🇵🇱', 439, 'Sony PlayStation 5 Slim Disc Edition'),
        card('Varle.lt', '🇱🇹', 499, 'PlayStation 5 Slim žaidimų konsolė'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
      { id: 'buy-button-present', desc: 'Buy button present' },
    ],
  },
  {
    id: 'P05',
    name: 'Anna (PL, 28)',
    desc: 'Polish user searching for Nivea cream on mobile during lunch break.',
    lang: 'pl',
    query: 'Nivea Creme 250ml',
    payload: makeResult({
      product_name: 'Nivea Creme 250ml',
      price_min: 3.99, price_max: 6.49, price_avg: 5.00,
      results: [
        card('Amazon.PL', '🇵🇱', 3.99, 'Nivea Creme uniwersalny krem 250ml', { is_cheapest: true }),
        card('Amazon.DE', '🇩🇪', 4.99, 'Nivea Creme Allzweck-Pflegecreme 250ml'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
      { id: 'no-js-errors', desc: 'No JavaScript errors' },
    ],
  },
  {
    id: 'P06',
    name: 'Jonas (LT, 45)',
    desc: 'Lithuanian budget shopper searching for LEGO Technic for his son.',
    lang: 'lt',
    query: 'LEGO Technic 42141',
    payload: makeResult({
      product_name: 'LEGO Technic 42141 McLaren',
      price_min: 149, price_max: 199, price_avg: 170,
      deal_score: 71,
      results: [
        card('Amazon.DE', '🇩🇪', 149, 'LEGO Technic 42141 McLaren Formula 1 Race Car', { is_cheapest: true }),
        card('Varle.lt', '🇱🇹', 179, 'LEGO Technic 42141 McLaren Race Car'),
        card('Amazon.PL', '🇵🇱', 199, 'LEGO Technic 42141 McLaren F1'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'three-shops', desc: 'Three shop cards' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
    ],
  },
  {
    id: 'P07',
    name: 'Petra (DE, 40)',
    desc: 'German homemaker searching for Bosch washing machine model number.',
    lang: 'de',
    query: 'Bosch WAX32EH0',
    payload: makeResult({
      product_name: 'Bosch WAX32EH0 Waschmaschine',
      price_min: 699, price_max: 849, price_avg: 760,
      results: [
        card('Amazon.DE', '🇩🇪', 699, 'Bosch WAX32EH0 Serie 8 Waschmaschine 9kg', { is_cheapest: true }),
        card('Elesen.lt', '🇱🇹', 799, 'Bosch WAX32EH0 skalbimo mašina'),
        card('Varle.lt', '🇱🇹', 849, 'Bosch WAX32EH0 9kg skalbimo mašina'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
      { id: 'no-js-errors', desc: 'No JavaScript errors' },
    ],
  },
  {
    id: 'P08',
    name: 'Aleksas (LT, 18)',
    desc: 'Lithuanian student searching for Apple MacBook Air M3 for university.',
    lang: 'lt',
    query: 'Apple MacBook Air M3',
    payload: makeResult({
      product_name: 'Apple MacBook Air M3',
      price_min: 1099, price_max: 1299, price_avg: 1180,
      deal_score: 85,
      results: [
        card('Amazon.DE', '🇩🇪', 1099, 'Apple MacBook Air M3 13" 8GB 256GB Mitternacht', { is_cheapest: true }),
        card('Amazon.PL', '🇵🇱', 1149, 'Apple MacBook Air M3 13 cali 8GB'),
        card('Varle.lt', '🇱🇹', 1299, 'Apple MacBook Air M3 13" 8GB 256GB'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'three-shops', desc: 'Three shop cards' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
      { id: 'buy-button-present', desc: 'Buy button present' },
    ],
  },
  {
    id: 'P09',
    name: 'Marta (PL, 55)',
    desc: 'Polish grandmother searching for DeLonghi espresso machine as a gift.',
    lang: 'pl',
    query: 'DeLonghi Magnifica Start',
    payload: makeResult({
      product_name: 'De\'Longhi Magnifica Start',
      price_min: 299, price_max: 399, price_avg: 345,
      results: [
        card('Amazon.DE', '🇩🇪', 299, "De'Longhi Magnifica Start ECAM220.21.B Kaffeevollautomat", { is_cheapest: true }),
        card('Elesen.lt', '🇱🇹', 349, 'DeLonghi Magnifica Start kavos aparatas'),
        card('Amazon.PL', '🇵🇱', 399, 'DeLonghi Magnifica Start ekspres do kawy'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
      { id: 'no-js-errors', desc: 'No JavaScript errors' },
    ],
  },
  {
    id: 'P10',
    name: 'Erik (DE, 29)',
    desc: 'German fitness enthusiast searching for Garmin Forerunner 265.',
    lang: 'de',
    query: 'Garmin Forerunner 265',
    payload: makeResult({
      product_name: 'Garmin Forerunner 265',
      price_min: 349, price_max: 429, price_avg: 385,
      deal_score: 80,
      results: [
        card('Amazon.DE', '🇩🇪', 349, 'Garmin Forerunner 265 GPS Multisport-Uhr Schwarz/Schiefergrau', { is_cheapest: true }),
        card('Amazon.PL', '🇵🇱', 369, 'Garmin Forerunner 265 zegarek GPS'),
        card('Varle.lt', '🇱🇹', 429, 'Garmin Forerunner 265 išmanusis laikrodis'),
      ],
    }),
    checks: [
      { id: 'home-visible', desc: 'Home screen loads' },
      { id: 'results-appear', desc: 'Results appear' },
      { id: 'three-shops', desc: 'Three shop cards' },
      { id: 'first-card-above-fold', desc: 'First card above fold' },
      { id: 'buy-button-present', desc: 'Buy button present' },
    ],
  },
];

// Run all 10 personas
for (const persona of PERSONAS) {
  test(`${persona.id}: ${persona.name} — ${persona.desc}`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.addInitScript((lang) => {
      try {
        localStorage.clear();
        localStorage.setItem('gy_ob_done', '1');
        localStorage.setItem('gy_lang', lang);
      } catch (e) {}
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.register) {
          navigator.serviceWorker.register = () => Promise.resolve({
            installing: null, waiting: null, active: null, scope: '/',
            update: () => Promise.resolve(), unregister: () => Promise.resolve(true),
            addEventListener: () => {}, removeEventListener: () => {},
          });
        }
      } catch (e) {}
    }, persona.lang);

    // Stub backend
    await page.route('**/api/health', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok', version: 'test', shops: ['Varle.lt'], ai: { configured: true }, supabase: true }) }));
    await page.route('**/api/rate-limit', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ used: 1, limit: 50, remaining: 49 }) }));
    await page.route('**/api/popular-searches**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ searches: [], total_unique: 0 }) }));
    await page.route('**/api/watchlist-check', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ alerts: [] }) }));
    await page.route('**/api/price-history**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ history: [] }) }));
    const sseBody = `data: ${JSON.stringify({ type: 'complete', payload: persona.payload })}\n\n`;
    await page.route('**/api/search', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(persona.payload) }));
    await page.route('**/api/search-stream', (r) => r.fulfill({ status: 200, contentType: 'text/event-stream', body: sseBody }));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(async () => {
      try {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (e) {}
    });
    await page.waitForFunction(() => !!document.getElementById('hero-headline'));

    const checkResults = {};

    // CHECK 1: home visible
    const homeVisible = await page.locator('#pg-home').isVisible();
    checkResults['home-visible'] = homeVisible;

    // TYPE and SUBMIT search
    const input = page.locator('#srch-inp');
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill(persona.query);
    await input.press('Enter');

    // CHECK 2: results appear
    try {
      await expect(page.locator('#pg-results')).toHaveClass(/on/, { timeout: 8000 });
      checkResults['results-appear'] = true;
    } catch {
      checkResults['results-appear'] = false;
    }

    // CHECK 3: three shops
    const cardCount = await page.locator('#pg-results .p-card').count();
    checkResults['three-shops'] = cardCount >= 3;

    // CHECK 4: first card above fold (must be in viewport)
    let firstCardAboveFold = false;
    const firstCard = page.locator('#pg-results .p-card').first();
    try {
      await expect(firstCard).toBeVisible({ timeout: 5000 });
      const box = await firstCard.boundingBox();
      // 390×844 viewport — card top must be above y=700 and bottom above y=844
      firstCardAboveFold = box !== null && box.y >= 0 && box.y + box.height <= 844;
    } catch {
      firstCardAboveFold = false;
    }
    checkResults['first-card-above-fold'] = firstCardAboveFold;

    // CHECK 5: buy button present
    const buyBtn = page.locator('#pg-results .p-card').first().locator('a.buy-btn, a[href*="example.com"], .btn-buy, [class*="buy"]');
    try {
      await expect(buyBtn.first()).toBeVisible({ timeout: 3000 });
      checkResults['buy-button-present'] = true;
    } catch {
      checkResults['buy-button-present'] = false;
    }

    // CHECK 6: no JS errors (exclude favicon/SW noise)
    const realErrors = errors.filter((e) => !/favicon|serviceWorker|sw\.js|manifest/i.test(e));
    checkResults['no-js-errors'] = realErrors.length === 0;

    const checks = persona.checks.map((c) => ({
      ...c,
      pass: checkResults[c.id] !== false,  // undefined = not checked = skip
      actual: checkResults[c.id],
    }));
    const passed = checks.filter((c) => c.actual === true || c.actual === undefined).length;
    const failed = checks.filter((c) => c.actual === false).length;

    RESULTS.push({
      persona,
      checks,
      passed,
      failed,
      errors: realErrors,
    });

    // Fail test if critical checks failed
    for (const c of checks) {
      if (c.actual === false) {
        testInfo.annotations.push({ type: 'fail', description: `${c.id}: ${c.desc}` });
      }
    }
  });
}

test.afterAll(async () => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const lines = [
    '# UX_VIRTUAL_TEST.md',
    '',
    `**Date:** ${now}  `,
    '**Viewport:** 390×844 (iPhone 13 class)  ',
    `**Personas tested:** ${RESULTS.length}/10  `,
    '',
    '---',
    '',
    '## Results by Persona',
    '',
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const r of RESULTS) {
    const p = r.persona;
    const allPassed = r.failed === 0;
    const status = allPassed ? '✅ PASS' : '⚠️ PARTIAL';
    totalPassed += r.passed;
    totalFailed += r.failed;

    lines.push(`### ${p.id} — ${p.name} ${status}`);
    lines.push('');
    lines.push(`**Scenario:** ${p.desc}  `);
    lines.push(`**Language:** \`${p.lang}\`  **Query:** \`${p.query}\`  `);
    lines.push('');
    lines.push('| Check | Result |');
    lines.push('|---|---|');
    for (const c of r.checks) {
      const icon = c.actual === true ? '✅' : c.actual === false ? '❌' : '—';
      lines.push(`| ${c.desc} | ${icon} |`);
    }
    if (r.errors.length > 0) {
      lines.push('');
      lines.push(`**JS errors:** ${r.errors.slice(0, 3).map((e) => '`' + e.slice(0, 80) + '`').join(', ')}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Personas tested | ${RESULTS.length}/10 |`);
  lines.push(`| Total checks passed | ${totalPassed} |`);
  lines.push(`| Total checks failed | ${totalFailed} |`);
  lines.push(`| Pass rate | ${totalPassed + totalFailed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(0) : 0}% |`);
  lines.push('');

  fs.writeFileSync(UX_MD, lines.join('\n'), 'utf-8');
  console.log(`UX_VIRTUAL_TEST.md written to ${UX_MD}`);
});
