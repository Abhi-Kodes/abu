const fs = require('fs');
const path = require('path');

const htmlFiles = ['index.html', 'about.html', 'products.html', 'contact.html'];
let issues = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Check title
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  if (!titleMatch || !titleMatch[1].trim()) {
    issues.push({ file, type: 'SEO_MISSING_TITLE' });
  } else {
    const title = titleMatch[1].trim();
    if (title.length < 30 || title.length > 70) {
      issues.push({ file, type: 'SEO_TITLE_LENGTH', detail: `${title.length} chars: "${title}"` });
    }
  }

  // Check meta description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                    content.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (!descMatch || !descMatch[1].trim()) {
    issues.push({ file, type: 'SEO_MISSING_DESCRIPTION' });
  } else {
    const desc = descMatch[1].trim();
    if (desc.length < 70 || desc.length > 165) {
      issues.push({ file, type: 'SEO_DESC_LENGTH', detail: `${desc.length} chars` });
    }
  }

  // Check canonical
  const canMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  if (!canMatch) {
    issues.push({ file, type: 'SEO_MISSING_CANONICAL' });
  }

  // Check OpenGraph and Twitter
  if (!content.includes('property="og:title"')) issues.push({ file, type: 'SEO_MISSING_OG_TITLE' });
  if (!content.includes('property="og:image"')) issues.push({ file, type: 'SEO_MISSING_OG_IMAGE' });
  if (!content.includes('name="twitter:card"')) issues.push({ file, type: 'SEO_MISSING_TWITTER_CARD' });

  // 1. Check Images
  const imgRegex = /<img([^>]+)>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);

    if (srcMatch) {
      const src = srcMatch[1];
      if (!src.startsWith('http') && !src.startsWith('data:')) {
        const decodedSrc = decodeURIComponent(src);
        const exists = fs.existsSync(src) || fs.existsSync(decodedSrc);
        if (!exists) {
          issues.push({ file, type: 'BROKEN_IMAGE', src });
        }
      }
    } else {
      issues.push({ file, type: 'IMG_WITHOUT_SRC', tag: match[0] });
    }

    if (!altMatch || !altMatch[1].trim()) {
      issues.push({ file, type: 'MISSING_OR_EMPTY_ALT', src: srcMatch ? srcMatch[1] : 'unknown' });
    }
  }

  // 2. Check Local Links
  const linkRegex = /<a([^>]+)>/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const attrs = match[1];
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
        const [page, hash] = href.split('#');
        const targetPage = page ? page : file;
        if (!fs.existsSync(targetPage)) {
          issues.push({ file, type: 'BROKEN_PAGE_LINK', href });
        } else if (hash) {
          const targetContent = fs.readFileSync(targetPage, 'utf8');
          const hashExists = targetContent.includes('id="' + hash + '"') ||
                             targetContent.includes('name="' + hash + '"') ||
                             targetContent.includes("id='" + hash + "'");
          if (!hashExists) {
            issues.push({ file, type: 'BROKEN_ANCHOR', href, targetPage, hash });
          }
        }
      }
    }
  }

  // 3. Check JSON-LD
  const schemaRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
  while ((match = schemaRegex.exec(content)) !== null) {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      issues.push({ file, type: 'JSON_LD_SYNTAX_ERROR', error: e.message });
    }
  }
});

console.log('--- AUDIT RESULTS ---');
console.log(JSON.stringify(issues, null, 2));

