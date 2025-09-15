// Create a Chrome-extension-friendly build folder without `_next`.
// Copies `dist/` to `dist-ext/`, renames `_next` -> `next`, and rewrites
// all references in HTML/JS/CSS to use `next/`. Then overwrite popup.html/js/css
// with the static files from `public/` so the extension uses this UI.

import fs from 'fs/promises';
import path from 'path';

const SRC = 'dist';
const DST = 'dist-ext';
const PUB = 'public';

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function rmrf(p) { await fs.rm(p, { recursive: true, force: true }); }
async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function copyDir(src, dst) {
  await ensureDir(dst);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else if (e.isSymbolicLink()) { const real = await fs.readlink(s); await fs.symlink(real, d); }
    else await fs.copyFile(s, d);
  }
}

async function rewriteFiles(root) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { stack.push(p); continue; }
      const isText = /\.(html?|css|js|mjs|cjs|json|txt|map)$/.test(e.name);
      if (!isText) continue;
      const content = await fs.readFile(p, 'utf8');
      const replaced = content
        .replaceAll('/_next/', '/next/')
        .replaceAll('./_next/', './next/')
        .replaceAll('"/_next/', '"/next/')
        .replaceAll("'/_next/", "'/next/");
      if (replaced !== content) await fs.writeFile(p, replaced);
    }
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.error(`Source folder \`${SRC}\` not found. Run: npm run build`);
    process.exit(1);
  }
  await rmrf(DST);
  await copyDir(SRC, DST);
  const oldNext = path.join(DST, '_next');
  const newNext = path.join(DST, 'next');
  if (await exists(oldNext)) await fs.rename(oldNext, newNext);
  await rewriteFiles(DST);

  // Copy helper script only (do not override Next popup.html)
  for (const f of ['popup.js']) {
    const src = path.join(PUB, f);
    const dst = path.join(DST, f);
    if (await exists(src)) await fs.copyFile(src, dst);
  }

  // Sanitize Next's popup.html: move inline Next init blocks into external file
  const popupDst = path.join(DST, 'popup.html');
  if (await exists(popupDst)) {
    const popupSrc = path.join(SRC, 'popup.html');
    let srcHtml = '';
    if (await exists(popupSrc)) srcHtml = await fs.readFile(popupSrc, 'utf8');

    // Collect inline <script> blocks that contain Next's runtime queues
    const initBlocks = [];
    if (srcHtml) {
      const re = /<script>([\s\S]*?)<\/script>/g;
      let m;
      while ((m = re.exec(srcHtml))) {
        const code = m[1] || '';
        if (code.includes('self.__next_')) initBlocks.push(code);
      }
    }

    let html = await fs.readFile(popupDst, 'utf8');
    // Strip all inline scripts to satisfy MV3 CSP
    html = html.replace(/<script>([\s\S]*?)<\/script>/g, '');

    if (initBlocks.length) {
      const initPath = path.join(DST, 'popup.init.js');
      await fs.writeFile(initPath, initBlocks.join('\n'), 'utf8');
      if (!html.includes('/popup.init.js')) {
        html = html.replace('</body>', '<script src="/popup.init.js"></script></body>');
      }
    }
    // Inject benign-error silencer
    if (!html.includes('/popup.js')) {
      html = html.replace('</body>', '<script src="/popup.js"></script></body>');
    }
    await fs.writeFile(popupDst, html, 'utf8');
  }

  console.log('Chrome extension folder ready:', DST);
}

main().catch((err) => { console.error(err); process.exit(1); });
