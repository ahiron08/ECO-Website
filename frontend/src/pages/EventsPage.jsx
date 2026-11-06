import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import SectionTitle from '../components/SectionTitle';
import EventCard from '../components/EventCard';
import { useEvents } from '../hooks/useContent';
import { withEventStatus } from '../utils/eventStatus';

const filters = ['Upcoming', 'Past'];

function eventTimestamp(event) {
  const timestamp = Date.parse(event.startDate);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function EventsPage() {
  const { data: eventsData, loading, error, refetch } = useEvents();
  const [filterChoice, setFilterChoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const eventsWithStatus = useMemo(
    () => (eventsData ?? []).map((event) => withEventStatus(event)),
    [eventsData],
  );

  const activeFilter = filterChoice
    ?? (eventsWithStatus.some((event) => event.status !== 'past') ? 'Upcoming' : 'Past');

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return eventsWithStatus
      .filter((event) => {
        const matchesFilter = activeFilter === 'Upcoming'
          ? event.status !== 'past'
          : event.status === 'past';
        const matchesSearch = !query
          || event.title.toLowerCase().includes(query)
          || event.description.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => (
        activeFilter === 'Upcoming'
          ? eventTimestamp(a) - eventTimestamp(b)
          : eventTimestamp(b) - eventTimestamp(a)
      ));
  }, [activeFilter, eventsWithStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      {/* Hero Section */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Events"
            subtitle="Join us in our environmental initiatives and activities"
          />
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Category Chips */}
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterChoice(filter)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    activeFilter === filter
                      ? 'bg-[#3FAE5C] text-white'
                      : 'bg-white text-[#222] border border-[#ECECEC] hover:border-[#3FAE5C]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#ECECEC] focus:outline-none focus:ring-2 focus:ring-[#3FAE5C] bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading && eventsWithStatus.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3FAE5C] border-t-transparent" />
              <p className="text-muted">Loading events…</p>
            </div>
          )}

          {!loading && error && eventsWithStatus.length === 0 && (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#ECECEC] bg-white p-8 text-center shadow-card">
              <p className="text-xl font-semibold text-[#222]">We couldn’t load events.</p>
              <p className="mt-2 text-muted">Please try again in a moment.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-full bg-[#3FAE5C] px-6 py-2.5 font-medium text-white transition hover:bg-[#359a4f]"
              >
                Try again
              </button>
            </div>
          )}

          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </motion.div>

          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
