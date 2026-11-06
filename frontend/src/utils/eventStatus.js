function parseCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp;
}

export function getEventStatus(event, now = new Date()) {
  const start = parseCalendarDate(event.startDate);
  const end = parseCalendarDate(event.endDate || event.startDate);

  if (start === null || end === null || end < start) return 'past';

  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < start) return 'upcoming';
  if (today <= end) return 'ongoing';
  return 'past';
}

export function withEventStatus(event, now) {
  return { ...event, status: getEventStatus(event, now) };
}

export function getUpcomingEvents(events, now) {
  return events
    .map((event) => withEventStatus(event, now))
    .filter((event) => event.status === 'upcoming')
    .sort((a, b) => parseCalendarDate(a.startDate) - parseCalendarDate(b.startDate));
}
