export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Team categories in the order the public Team page renders them. */
export const TEAM_CATEGORIES = [
  { key: 'facultyAdvisor', label: 'Faculty Advisor', layout: 'card' },
  { key: 'secretary', label: 'Secretary', layout: 'card' },
  { key: 'seniorExecutives', label: 'Senior Executives', layout: 'card' },
  { key: 'developers', label: 'Developers', layout: 'card' },
  { key: 'other', label: 'Team Members', layout: 'card' },
  { key: 'juniorExecutives', label: 'Junior Executives', layout: 'name' },
];

export const TEAM_CATEGORY_OPTIONS = TEAM_CATEGORIES.map(({ key, label }) => ({
  value: key,
  label,
}));

export const CONTENT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const EVENT_CATEGORY_SUGGESTIONS = [
  'Competition',
  'Workshop',
  'Awareness',
  'Celebration',
  'Hackathon',
  'Plantation',
  'Other',
];

export function slugify(value) {
  const slug = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'content';
}

export function makeUniqueSlug(base, existingSlugs = []) {
  const used = new Set(existingSlugs);
  const cleaned = slugify(base);

  if (!used.has(cleaned)) return cleaned;

  let suffix = 2;
  while (used.has(`${cleaned}-${suffix}`)) suffix += 1;
  return `${cleaned}-${suffix}`;
}

function parseDateOnly(value) {
  if (!value) return null;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDayMonthYear(date) {
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

/** "27 October, 2026" or "29 October, 2026 - 31 October, 2026". */
export function formatEventDate(startDate, endDate) {
  const start = parseDateOnly(startDate);
  if (!start) return '';

  const end = parseDateOnly(endDate) ?? start;
  const sameDay = start.getTime() === end.getTime();

  return sameDay
    ? formatDayMonthYear(start)
    : `${formatDayMonthYear(start)} - ${formatDayMonthYear(end)}`;
}

/** Blog dates can be ISO timestamps or legacy strings such as "May 15, 2025". */
export function formatBlogDate(value) {
  if (!value) return '';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return `${MONTH_NAMES[parsed.getUTCMonth()]} ${parsed.getUTCDate()}, ${parsed.getUTCFullYear()}`;
}

export function mapEventRow(row) {
  return {
    id: row.slug ?? row.id,
    dbId: row.id,
    legacyId: row.legacy_id ?? null,
    slug: row.slug ?? '',
    title: row.title ?? '',
    organizer: row.organiser || 'Eco Club NITS',
    date: formatEventDate(row.start_date, row.end_date),
    startDate: row.start_date ?? '',
    endDate: row.end_date ?? row.start_date ?? '',
    time: row.time_label ?? '',
    location: row.venue ?? '',
    description: row.description || row.short_description || '',
    image: row.poster_url ?? '',
    link: row.registration_url || undefined,
    resultsImage: row.results_image_url || undefined,
    category: row.event_category ?? '',
    featured: Boolean(row.featured),
    status: row.status ?? 'published',
  };
}

export function mapTeamMemberRow(row) {
  return {
    id: row.id,
    name: row.name ?? '',
    image: row.photo_url || '',
    position: row.designation || '',
    department: row.department || '',
    batch: row.batch || '',
    bio: row.bio || '',
    email: row.email || '',
    year: row.academic_year ?? '',
    category: row.category ?? 'other',
    displayOrder: row.display_order ?? 0,
  };
}

/**
 * Group flat team rows into the shape the public Team page already renders:
 * { committees: { "2026": { facultyAdvisor: [...], ... } } }
 */
export function mapTeamRows(rows) {
  const committees = {};

  [...rows]
    .map(mapTeamMemberRow)
    .sort((a, b) => (a.displayOrder - b.displayOrder) || a.name.localeCompare(b.name))
    .forEach((member) => {
      const year = member.year || 'Team';
      if (!committees[year]) {
        committees[year] = Object.fromEntries(
          TEAM_CATEGORIES.map(({ key }) => [key, []]),
        );
      }

      const category = TEAM_CATEGORIES.some(({ key }) => key === member.category)
        ? member.category
        : 'other';

      committees[year][category].push({
        id: member.id,
        name: member.name,
        image: member.image,
        position: member.position,
      });
    });

  return { committees };
}

export function mapGalleryRow(row) {
  return {
    id: row.id,
    legacyId: row.legacy_src ?? null,
    src: row.image_url ?? '',
    alt: row.caption || row.description || 'Eco Club gallery photo',
    description: row.description || '',
    category: row.category || 'Gallery',
    albumId: row.album_id ?? null,
    eventId: row.event_id ?? null,
  };
}

export function mapAchievementRow(row) {
  return {
    id: row.id,
    legacyId: row.legacy_id ?? null,
    title: row.title ?? '',
    description: row.description ?? '',
    image: row.image_url ?? '',
    date: row.achievement_date ?? '',
    category: row.category ?? '',
    featured: Boolean(row.featured),
  };
}

export function mapBlogRow(row) {
  return {
    id: row.slug || row.id,
    dbId: row.id,
    legacyId: row.legacy_id ?? null,
    slug: row.slug ?? '',
    title: row.title ?? '',
    excerpt: row.excerpt ?? '',
    date: formatBlogDate(row.published_at),
    image: row.cover_image_url ?? '',
    author: row.author || 'Eco Club',
    category: row.category || 'Sustainability',
    content: row.content ?? '',
  };
}

export function mapAnnouncementRow(row) {
  return {
    id: row.id,
    title: row.title ?? '',
    content: row.content ?? '',
    image: row.image_url || '',
    startDate: row.start_date ?? null,
    expiryDate: row.expiry_date ?? null,
  };
}

/**
 * Markdown-lite used by blog posts and the admin editor.
 * Supported: blank-line paragraphs, #/##/### headings, "> " quotes and
 * ![alt](image-url) images. Output is plain data rendered as React elements,
 * so stored content cannot inject HTML.
 */
export function parseContentBlocks(content) {
  if (Array.isArray(content)) {
    return content
      .filter((block) => typeof block === 'string' && block.trim())
      .map((text) => ({ type: 'paragraph', text: text.trim() }));
  }

  const lines = String(content ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];

  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flush();
      return;
    }

    const image = line.match(/^!\[([^\]]*)\]\((\S+)\)$/);
    if (image) {
      flush();
      blocks.push({ type: 'image', alt: image[1], src: image[2] });
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      return;
    }

    if (line.startsWith('> ')) {
      flush();
      blocks.push({ type: 'quote', text: line.slice(2) });
      return;
    }

    paragraph.push(line);
  });

  flush();
  return blocks;
}

/** Read a string value from a form, trimming and converting blanks to null. */
export function emptyToNull(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  return value ?? null;
}
