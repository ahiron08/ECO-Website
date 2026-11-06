import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { envValue, frontendRoot, loadEnvFiles, parseArgs, requireEnv } from './env.mjs';
import { makeUniqueSlug, slugify } from '../src/lib/contentMapper.js';

loadEnvFiles();

const { flags } = parseArgs();
const dryRun = flags.has('--dry-run');
const skipImages = flags.has('--skip-images');
const updateExisting = flags.has('--update-existing');
const help = flags.has('--help');

const dataDir = join(frontendRoot, 'src', 'data');
const publicDir = join(frontendRoot, 'public');

const readJson = (file) => JSON.parse(readFileSync(join(dataDir, file), 'utf8'));

if (help) {
  console.log(`
ECO Club content migration

  node scripts/migrate-content.mjs --dry-run     preview the plan (no credentials needed)
  node scripts/migrate-content.mjs               upload assets and upsert records
  node scripts/migrate-content.mjs --skip-images keep bundled image paths
  node scripts/migrate-content.mjs --update-existing
                                                explicitly update existing legacy records

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local.
The JSON files are read only and are never deleted.
`);
  process.exit(0);
}

let supabase = null;
let supabaseUrl = '';
const report = new Map();

async function uploadAsset(bucket, url, label) {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('/')) return url;

  if (skipImages) return url;

  const sourcePath = join(publicDir, url.replace(/^\//, ''));

  if (!existsSync(sourcePath)) {
    console.warn(`  ! Missing file for ${label}: ${url} (keeping the original path)`);
    return url;
  }

  const objectPath = url.replace(/^\//, '');
  const size = Math.round(statSync(sourcePath).size / 1024);
  const sourceBuffer = readFileSync(sourcePath);
  const webpBuffer = await sharp(sourceBuffer)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const webpObjectPath = objectPath.replace(/\.[^.]+$/, '.webp');

  if (dryRun) {
    console.log(`  plan upload  ${bucket}/${webpObjectPath} (${size} KB source)`);
    return url;
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(webpObjectPath, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    });

  if (error) throw new Error(`Upload failed for ${url}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(webpObjectPath);
  return data.publicUrl;
}

async function ensureNoixorgoBucket() {
  if (dryRun) return;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(`Unable to inspect storage buckets: ${listError.message}`);
  if (buckets.some((bucket) => bucket.id === 'noixorgo-images')) return;

  const { error } = await supabase.storage.createBucket('noixorgo-images', {
    public: true,
    fileSizeLimit: '7864320',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  });

  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Unable to create noixorgo-images bucket: ${error.message}`);
  }
}

async function upsertRows(table, rows, onConflict) {
  const counts = { inserted: 0, updated: 0, skipped: 0, failed: 0 };
  report.set(table, counts);
  const saved = [];

  for (const row of rows) {
    if (dryRun) {
      counts.inserted += 1;
      continue;
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .upsert([row], {
          onConflict,
          ignoreDuplicates: !updateExisting,
        })
        .select();

      if (error) throw error;
      if (data?.length) {
        if (updateExisting) counts.updated += 1;
        else counts.inserted += 1;
        saved.push(data[0]);
      } else {
        counts.skipped += 1;
      }
    } catch (error) {
      counts.failed += 1;
      console.error(`  failed       ${table} ${row[onConflict]}: ${error.message}`);
    }
  }

  console.log(
    `  ${table}: ${counts.inserted} inserted, ${counts.updated} updated, `
    + `${counts.skipped} skipped, ${counts.failed} failed`,
  );
  return saved;
}

async function migrateEvents() {
  const events = readJson('events.json');
  const slugs = [];

  const rows = [];

  for (const event of events) {
    const slug = makeUniqueSlug(slugify(event.title), slugs);
    slugs.push(slug);

    const poster = await uploadAsset('event-posters', event.image, `event ${event.id} poster`);
    const results = await uploadAsset('event-posters', event.resultsImage, `event ${event.id} results poster`);

    rows.push({
      legacy_id: event.id,
      title: event.title,
      slug,
      description: event.description ?? null,
      short_description: event.description ?? null,
      poster_url: poster,
      results_image_url: results,
      event_category: event.category ?? null,
      venue: event.location ?? null,
      time_label: event.time ?? null,
      start_date: event.startDate ?? null,
      end_date: event.endDate ?? event.startDate ?? null,
      registration_url: event.link ?? null,
      organiser: event.organiser ?? 'Eco Club NITS',
      featured: Boolean(event.featured),
      status: 'published',
    });
  }

  await upsertRows('events', rows, 'legacy_id');
}

async function migrateTeam() {
  const teamData = readJson('team.json');
  const categories = ['facultyAdvisor', 'secretary', 'seniorExecutives', 'developers', 'juniorExecutives'];
  const rows = [];
  let order = 0;

  for (const [year, committee] of Object.entries(teamData.committees ?? {})) {
    for (const category of categories) {
      for (const member of committee[category] ?? []) {
        const photo = await uploadAsset('team-photos', member.image, `team ${year} ${member.name}`);
        rows.push({
          legacy_key: `${year}:${category}:${member.name}`,
          name: member.name,
          designation: member.position ?? null,
          academic_year: year,
          category,
          photo_url: photo,
          display_order: order,
          status: 'published',
        });
        order += 1;
      }
    }
  }

  await upsertRows('team_members', rows, 'legacy_key');
}

async function migrateGallery() {
  const images = readJson('gallery.json');
  const categories = [...new Set(images.map((image) => image.category).filter(Boolean))];

  const albumRows = categories.map((category, index) => ({
    slug: `gallery-${slugify(category)}`,
    title: category,
    category,
    display_order: index,
    status: 'published',
  }));

  const savedAlbums = await upsertRows('gallery_albums', albumRows, 'slug');
  const albumIds = new Map(savedAlbums.map((album) => [album.slug, album.id]));

  const rows = [];

  for (const [index, image] of images.entries()) {
    const imageUrl = await uploadAsset('gallery-images', image.src, `gallery ${image.alt}`);
    const categorySlug = image.category ? `gallery-${slugify(image.category)}` : null;

    rows.push({
      legacy_src: image.src,
      image_url: imageUrl,
      caption: image.alt ?? null,
      category: image.category ?? null,
      album_id: albumIds.get(categorySlug) ?? null,
      display_order: index,
      status: 'published',
    });
  }

  await upsertRows('gallery_items', rows, 'legacy_src');
}

async function migrateAchievements() {
  const achievements = readJson('achievements.json');

  const rows = [];

  for (const achievement of achievements) {
    const image = await uploadAsset('achievement-images', achievement.image, `achievement ${achievement.id}`);
    rows.push({
      legacy_id: achievement.id,
      title: achievement.title,
      description: achievement.description ?? null,
      image_url: image,
      featured: false,
      status: 'published',
    });
  }

  await upsertRows('achievements', rows, 'legacy_id');
}

async function migrateBlogs() {
  const blogs = readJson('blogs.json');
  const slugs = [];

  const rows = [];

  for (const blog of blogs) {
    const slug = makeUniqueSlug(slugify(blog.title), slugs);
    slugs.push(slug);

    const cover = await uploadAsset('blog-images', blog.image, `blog ${blog.id} cover`);
    const parsedDate = blog.date ? new Date(blog.date) : null;

    rows.push({
      legacy_id: blog.id,
      title: blog.title,
      slug,
      excerpt: blog.excerpt ?? null,
      content: Array.isArray(blog.content) ? blog.content.join('\n\n') : (blog.content ?? null),
      cover_image_url: cover,
      author: blog.author ?? 'Eco Club',
      category: blog.category ?? null,
      published_at: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
      status: 'published',
    });
  }

  await upsertRows('blogs', rows, 'legacy_id');
}

function parseLegacyDate(value) {
  if (!value) return null;
  const parsed = new Date(String(value).replace(/(\d+)(st|nd|rd|th)/, '$1'));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

async function migrateNoixorgo() {
  const data = readJson('noixorgo.json');
  const issues = [data.featured, ...(data.previous ?? [])].filter(Boolean);
  const rows = [];

  for (const issue of issues) {
    const coverImage = await uploadAsset(
      'noixorgo-images',
      issue.coverImage,
      `Noixorgo week ${issue.week} cover`,
    );
    const quoteImage = await uploadAsset(
      'noixorgo-images',
      issue.quoteImage,
      `Noixorgo week ${issue.week} tip`,
    );

    rows.push({
      week: issue.week,
      legacy_week: issue.week,
      issue_date: parseLegacyDate(issue.date),
      date_label: issue.date ?? null,
      cover_image_url: coverImage,
      quote_image_url: quoteImage,
      featured: issue === data.featured,
      status: 'published',
    });
  }

  await upsertRows('noixorgo_issues', rows, 'legacy_week');
}

function printReport() {
  console.log('\nMigration summary');
  for (const [table, counts] of report) {
    console.log(
      `  ${table}: ${counts.inserted} inserted, ${counts.updated} updated, `
      + `${counts.skipped} skipped, ${counts.failed} failed`,
    );
  }
}

async function main() {
  console.log(dryRun ? '\nECO Club content migration — DRY RUN\n' : '\nECO Club content migration\n');

  if (!dryRun) {
    const url = envValue('SUPABASE_URL', 'VITE_SUPABASE_URL');
    const key = requireEnv(['SUPABASE_SERVICE_ROLE_KEY'], 'service-role key');

    if (!url) {
      console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) in frontend/.env.local.');
      process.exit(1);
    }

    if (/^VITE_/i.test(key)) {
      console.warn('Warning: the key starts with VITE_, which suggests it is a public key. Use the service-role key.');
    }

    supabaseUrl = url;
    supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  await migrateEvents();
  await migrateTeam();
  await migrateGallery();
  await migrateAchievements();
  await migrateBlogs();
  await ensureNoixorgoBucket();
  await migrateNoixorgo();
  printReport();

  if (dryRun) {
    console.log('\nDry run complete. No records or files were changed.');
    console.log('Run without --dry-run and with owner credentials to apply the migration.\n');
  } else {
    console.log(`\nMigration complete for ${supabaseUrl}.`);
    console.log('The existing JSON files were not modified or deleted.\n');
  }
}

main().catch((error) => {
  console.error(`\nMigration failed: ${error.message}\n`);
  process.exitCode = 1;
});
