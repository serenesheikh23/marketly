import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

const images = new Map();
const seenPages = new Set();
const queuedPages = ['https://oranosmarket.com/'];

const storageDir = 'storage/app';
if (!existsSync(storageDir)) mkdirSync(storageDir, { recursive: true });

const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled']
});

const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ar-SA',
    viewport: { width: 1440, height: 900 },
});

// Hide automation fingerprints
await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});

async function loadPage(page, url, attempt) {
    console.log('  attempt ' + attempt + ' on ' + url);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
        console.log('    nav timeout, continuing');
    }
    // Wait for Cloudflare challenge + SPA render
    await page.waitForTimeout(8000);

    for (let i = 0; i < 6; i++) {
        try { await page.evaluate(() => window.scrollBy(0, 1500)); } catch {}
        await page.waitForTimeout(700);
    }
    await page.waitForTimeout(3000);

    const domCount = await page.$$eval('img', (imgs) => imgs.filter(i => i.src && i.src.includes('/images/')).length).catch(() => 0);
    return domCount;
}

while (queuedPages.length > 0 && seenPages.size < 300) {
    const url = queuedPages.shift();
    if (seenPages.has(url)) continue;
    seenPages.add(url);

    const page = await context.newPage();
    page.on('response', (response) => {
        const u = response.url();
        if (u.includes('/images/') && /\.(webp|jpg|jpeg|png|gif)/i.test(u)) {
            if (!images.has(u)) images.set(u, { url: u, alt: '', nearText: '', page: url });
        }
    });

    try {
        console.log('Crawling: ' + url);

        let domCount = await loadPage(page, url, 1);

        // If nothing rendered, retry once (Cloudflare challenge may have blocked)
        if (domCount === 0) {
            console.log('    nothing rendered, retrying...');
            await page.waitForTimeout(5000);
            domCount = await loadPage(page, url, 2);
        }

        // Extract any DOM images too
        const domImgs = await page.$$eval('img', (imgs) =>
            imgs.map(img => ({
                src: img.src,
                alt: img.alt || '',
                nearText: (img.closest('a,li,article,div')?.innerText || '').trim().slice(0, 150)
            })).filter(i => i.src && i.src.includes('/images/'))
        ).catch(() => []);

        for (const img of domImgs) {
            const existing = images.get(img.src) || {};
            images.set(img.src, {
                url: img.src,
                alt: img.alt || existing.alt || '',
                nearText: img.nearText || existing.nearText || '',
                page: url,
            });
        }

        console.log('  dom=' + domCount + ' total unique=' + images.size);

        const links = await page.$$eval('a[href]', (as) =>
            as.map(a => a.href)
                .filter(h => h.startsWith('https://oranosmarket.com'))
                .filter(h => !h.includes('#'))
                .filter(h => !h.match(/\.(pdf|zip|jpg|png|webp)$/i))
        ).catch(() => []);

        // Prioritize category pages
        const categoryLinks = links.filter(h => /\/category\/\d+/.test(h));
        const otherLinks = links.filter(h => !/\/category\/\d+/.test(h));
        for (const link of [...categoryLinks, ...otherLinks]) {
            if (!seenPages.has(link) && queuedPages.length < 500) {
                queuedPages.push(link);
            }
        }

        // Checkpoint after every page
        writeFileSync(
            'storage/app/oranos-all-images.json',
            JSON.stringify({ scraped_at: new Date().toISOString(), images: Array.from(images.values()) }, null, 2)
        );
    } catch (e) {
        console.log('Error on ' + url + ': ' + e.message.split('\n')[0]);
    } finally {
        await page.close();
    }
}

const result = Array.from(images.values());
writeFileSync(
    'storage/app/oranos-all-images.json',
    JSON.stringify({ scraped_at: new Date().toISOString(), images: result }, null, 2)
);

console.log('');
console.log('=====================================');
console.log('Total unique images: ' + result.length);
console.log('Category images: ' + result.filter(i => i.url.includes('/images/category/')).length);
console.log('Pages crawled: ' + seenPages.size);
console.log('=====================================');

await browser.close();
