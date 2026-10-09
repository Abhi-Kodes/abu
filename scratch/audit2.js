const fs = require('fs');

const htmlFiles = ['index.html', 'about.html', 'products.html', 'contact.html'];

console.log('=== COMPREHENSIVE SITE AUDIT ===\n');

// 1. Check all anchor links across all pages
console.log('--- 1. ANCHOR & LINK VALIDATION ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('#')) {
      if (href !== '#' && !content.includes(`id="${href.slice(1)}"`)) {
        console.log(`[Broken internal anchor] ${file} -> ${href}`);
      }
    } else if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      const [page, hash] = href.split('#');
      if (!fs.existsSync(page)) {
        console.log(`[Broken page link] ${file} -> ${href}`);
      } else if (hash) {
        const targetHtml = fs.readFileSync(page, 'utf8');
        if (!targetHtml.includes(`id="${hash}"`)) {
          console.log(`[Broken cross-page anchor] ${file} -> ${href} (Missing id="${hash}" in ${page})`);
        }
      }
    }
  }
});

// 2. Check all images
console.log('\n--- 2. IMAGE SRC & ALT VALIDATION ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const imgRegex = /<img([^>]+)>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    if (!srcMatch || srcMatch[1] === '#' || (!srcMatch[1].startsWith('http') && !fs.existsSync(decodeURIComponent(srcMatch[1])))) {
      console.log(`[Broken Image] ${file}: ${srcMatch ? srcMatch[1] : 'NO SRC'}`);
    }
    if (!altMatch || !altMatch[1].trim()) {
      console.log(`[Missing Alt Tag] ${file}: ${srcMatch ? srcMatch[1] : 'Unknown'}`);
    }
  }
});

// 3. Check JavaScript in main.js
console.log('\n--- 3. JAVASCRIPT & DOM SELECTORS VALIDATION ---');
const js = fs.readFileSync('js/main.js', 'utf8');
// Check if elements selected by getElementById exist in HTML
const idRegex = /document\.getElementById\(["']([^"']+)["']\)/g;
let idMatch;
const checkedIds = new Set();
while ((idMatch = idRegex.exec(js)) !== null) {
  const id = idMatch[1];
  if (checkedIds.has(id)) continue;
  checkedIds.add(id);
  const foundIn = htmlFiles.filter(f => fs.readFileSync(f, 'utf8').includes(`id="${id}"`));
  if (foundIn.length === 0) {
    console.log(`[Missing DOM Element ID in JS] id="${id}" not found in any HTML file!`);
  }
}

// 4. Check SEO Meta Tags
console.log('\n--- 4. SEO META TAGS AUDIT ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const title = (content.match(/<title>([^<]*)<\/title>/i) || [])[1];
  const metaDesc = (content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1];
  const canonical = (content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) || [])[1];
  const ogTitle = (content.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || [])[1];
  const ogImage = (content.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1];
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];

  console.log(`\nFile: ${file}`);
  console.log(`  Title (${title ? title.length : 0} chars): ${title}`);
  console.log(`  Meta Desc (${metaDesc ? metaDesc.length : 0} chars): ${metaDesc}`);
  console.log(`  Canonical: ${canonical}`);
  console.log(`  H1 Count: ${h1Matches.length}`);
  if (h1Matches.length === 0) console.log(`  [SEO ERROR] Missing H1 tag!`);
  if (h1Matches.length > 1) console.log(`  [SEO WARNING] Multiple H1 tags found (${h1Matches.length})!`);
});

