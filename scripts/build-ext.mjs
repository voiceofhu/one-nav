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

function rewriteNextPaths(content) {
  return content
    .replaceAll('/_next/', '/next/')
    .replaceAll('./_next/', './next/')
    .replaceAll('"/_next/', '"/next/')
    .replaceAll("'/_next/", "'/next/");
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
      const replaced = rewriteNextPaths(content);
      if (replaced !== content) await fs.writeFile(p, replaced);
    }
  }
}

function sanitizeScriptBlocks(html, baseName, initBlocks, inlineBlocks) {
  return html.replace(/<script>([\s\S]*?)<\/script>/g, (match, code = '') => {
    const trimmed = code.trim();
    if (!trimmed) return '';
    if (trimmed.includes('self.__next_')) {
      initBlocks.push(trimmed);
      return '';
    }
    const file = `${baseName}.inline.${inlineBlocks.length}.js`;
    inlineBlocks.push({ file, code: trimmed });
    return `<script src="/${file}"></script>`;
  });
}

async function sanitizeHtmlEntry({ baseName, helperScripts = [] }) {
  const htmlName = `${baseName}.html`;
  const dstPath = path.join(DST, htmlName);
  if (!(await exists(dstPath))) return;

  let html = await fs.readFile(dstPath, 'utf8');
  const initBlocks = [];
  const inlineBlocks = [];

  html = sanitizeScriptBlocks(html, baseName, initBlocks, inlineBlocks);

  if (initBlocks.length) {
    const initFile = baseName === 'popup' ? 'popup.init.js' : `${baseName}.init.js`;
    const initPath = path.join(DST, initFile);
    const initContent = rewriteNextPaths(initBlocks.join('\n'));
    await fs.writeFile(initPath, initContent, 'utf8');
    if (!html.includes(`/${initFile}`)) {
      html = html.replace('</body>', `<script src="/${initFile}"></script></body>`);
    }
  }

  for (const { file, code } of inlineBlocks) {
    await fs.writeFile(path.join(DST, file), rewriteNextPaths(code), 'utf8');
  }

  for (const helper of helperScripts) {
    if (!html.includes(`/${helper}`)) {
      html = html.replace('</body>', `<script src="/${helper}"></script></body>`);
    }
  }

  await fs.writeFile(dstPath, html, 'utf8');
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
  const injectedHelpers = [];
  for (const f of ['popup.js']) {
    const src = path.join(PUB, f);
    const dst = path.join(DST, f);
    if (await exists(src)) {
      await fs.copyFile(src, dst);
      injectedHelpers.push(f);
    }
  }

  // Sanitize HTML entry points (popup, options, etc.) for MV3 CSP
  const entries = await fs.readdir(DST);
  for (const entry of entries) {
    if (!entry.endsWith('.html')) continue;
    const baseName = entry.replace(/\.html$/, '');
    const helperScripts = baseName === 'popup' ? injectedHelpers : [];
    await sanitizeHtmlEntry({ baseName, helperScripts });
  }

  console.log('Chrome extension folder ready:', DST);
}

main().catch((err) => { console.error(err); process.exit(1); });
