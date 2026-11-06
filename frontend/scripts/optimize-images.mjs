#!/usr/bin/env node
/**
 * Reduce image payloads in public/ using sharp.
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *   node scripts/optimize-images.mjs --dry-run
 *   node scripts/optimize-images.mjs --force
 *   node scripts/optimize-images.mjs --force --folders gallery,events
 *
 * The script only replaces an image when the optimized result is smaller.
 * Non-logo images are written as WebP and source references are updated when
 * the extension changes. Existing small images are left untouched.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const foldersArgument = process.argv.find((argument) => argument.startsWith('--folders='));
const TARGET_FOLDERS = foldersArgument
  ? new Set(foldersArgument.slice('--folders='.length).split(',').filter(Boolean))
  : null;

const MAX_EDGE = {
  team: 512,
  gallery: 1024,
  home: 1600,
  events: 1280,
  achievements: 1280,
  noixorgo: 1280,
  blogs: 1280,
};
const ROOT_LOGO_MAX = 320;
const ROOT_LOGO_MIN = 64 * 1024;
const MIN_SIZE_TO_BOTHER = 300 * 1024;
const SKIP = new Set(['vite.svg', 'logo.png', '10_year_logo.png']);
const IMAGE_PATTERN = /\.(jpe?g|png|webp)$/i;

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function maxEdgeFor(file) {
  const relative = path.relative(PUBLIC, file);
  if (!relative.includes(path.sep)) return ROOT_LOGO_MAX;
  return MAX_EDGE[relative.split(path.sep)[0]] ?? 1280;
}

function qualityFor(file) {
  const folder = path.relative(PUBLIC, file).split(path.sep)[0];
  return folder === 'home' ? 70 : 82;
}

async function optimize(file, destination, edge, quality, isLogo) {
  let pipeline = sharp(file).rotate().resize({
    width: edge,
    height: edge,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (isLogo) {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true, colors: 256 });
  } else {
    pipeline = pipeline.webp({ quality, effort: 6 });
  }

  await pipeline.toFile(destination);
}

const files = walk(PUBLIC).filter((file) => {
  if (!IMAGE_PATTERN.test(file)) return false;
  if (!TARGET_FOLDERS) return true;
  const relative = path.relative(PUBLIC, file);
  return TARGET_FOLDERS.has(relative.split(path.sep)[0]);
});
const renames = new Map();
let saved = 0;
let touched = 0;

for (const file of files) {
  const sourceStats = fs.statSync(file);
  const isLogo = SKIP.has(path.basename(file));
  const metadata = await sharp(file).metadata();
  const edge = maxEdgeFor(file);
  const canForceReencode = FORCE && !file.endsWith('.webp');
  const isAlreadySmall = !canForceReencode && sourceStats.size <= (isLogo ? ROOT_LOGO_MIN : MIN_SIZE_TO_BOTHER)
    && Math.max(metadata.width || 0, metadata.height || 0) <= edge;

  if (isAlreadySmall) continue;

  const destination = isLogo || file.endsWith('.webp')
    ? file
    : file.replace(/\.[^.]+$/, '.webp');
  const extension = path.extname(destination);
  const temporary = path.join(
    path.dirname(destination),
    `.${path.basename(destination, extension)}.tmp${extension}`,
  );

  try {
    await optimize(file, temporary, edge, qualityFor(file), isLogo);
    const optimizedSize = fs.statSync(temporary).size;

    if (optimizedSize >= sourceStats.size) {
      fs.rmSync(temporary);
      continue;
    }

    const relative = path.relative(ROOT, file);
    const dimensions = `${metadata.width || '?'}x${metadata.height || '?'}`;
    console.log(
      `  ~ ${relative}: ${kb(sourceStats.size)} ${dimensions} -> ${kb(optimizedSize)}`
      + `${destination !== file ? ` (${path.basename(destination)})` : ''}`,
    );
    saved += sourceStats.size - optimizedSize;
    touched++;

    if (DRY) {
      fs.rmSync(temporary);
      continue;
    }

    if (destination === file) {
      fs.writeFileSync(file, fs.readFileSync(temporary));
      fs.rmSync(temporary);
    } else {
      fs.renameSync(temporary, destination);
      fs.rmSync(file);
      renames.set(file, destination);
    }
  } catch (error) {
    if (fs.existsSync(temporary)) fs.rmSync(temporary);
    console.error(`  ! ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

const referenceFiles = [
  ...walk(path.join(ROOT, 'src')).filter((file) => /\.(jsx?|json|css)$/.test(file)),
  path.join(ROOT, 'index.html'),
];
let referenceEdits = 0;

for (const [oldFile, newFile] of renames) {
  const oldUrl = `/${path.relative(PUBLIC, oldFile).split(path.sep).join('/')}`;
  const newUrl = `/${path.relative(PUBLIC, newFile).split(path.sep).join('/')}`;

  for (const referenceFile of referenceFiles) {
    const content = fs.readFileSync(referenceFile, 'utf8');
    if (!content.includes(oldUrl)) continue;
    if (DRY) {
      console.log(`  ref ${oldUrl} -> ${newUrl} in ${path.relative(ROOT, referenceFile)}`);
      continue;
    }
    fs.writeFileSync(referenceFile, content.split(oldUrl).join(newUrl));
    referenceEdits++;
    console.log(`  ref ${oldUrl} -> ${newUrl} in ${path.relative(ROOT, referenceFile)}`);
  }
}

const total = walk(PUBLIC).reduce((sum, file) => sum + fs.statSync(file).size, 0);
console.log(
  `\n${DRY ? '[dry-run] ' : ''}optimised ${touched} file(s), freed ${kb(saved)}; `
  + `${renames.size} renamed, ${referenceEdits} reference(s) updated.`,
);
console.log(`public/ is now ${kb(total)} (${(total / 1024 / 1024).toFixed(1)} MB).`);
