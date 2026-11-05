import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiImage, FiMapPin, FiX } from 'react-icons/fi';
import Button from './Button';
import { getEventStatus } from '../utils/eventStatus';

export default function EventCard({ event, index }) {
  const status = getEventStatus(event);
  const [showResults, setShowResults] = useState(false);
  const resultsPoster = typeof event.resultsImage === 'string' ? event.resultsImage.trim() : '';
  const hasResultsPoster = resultsPoster.length > 0;
  const statusColors = {
    upcoming: 'bg-[#3FAE5C] text-white',
    ongoing: 'bg-amber-500 text-white',
    past: 'bg-gray-500 text-white',
  };

  useEffect(() => {
    if (!showResults) return undefined;

    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowResults(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showResults]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-card hover-lift h-full flex flex-col">
        <div className="relative">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-[#e8f3e4] to-[#cfe6cb] text-[#3FAE5C]">
              <FiImage className="h-10 w-10" aria-hidden="true" />
              <span className="sr-only">No poster available</span>
            </div>
          )}
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
            {status}
          </span>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-[#222] mb-3">{event.title}</h3>
          <p className="text-sm text-muted mb-2">Organized by: {event.organizer}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted">
              <FiCalendar className="w-4 h-4 mr-2 text-[#3FAE5C]" />
              {event.date}
            </div>
            <div className="flex items-center text-sm text-muted">
              <FiClock className="w-4 h-4 mr-2 text-[#3FAE5C]" />
              {event.time}
            </div>
            {event.location && (
              <div className="flex items-center text-sm text-muted">
                <FiMapPin className="w-4 h-4 mr-2 text-[#3FAE5C]" />
                {event.location}
              </div>
            )}
          </div>
          <p className="text-muted mb-4 flex-grow line-clamp-3">{event.description}</p>
          <div className="flex flex-col gap-3">
            {status === 'upcoming' && event.link && (
              <Button variant="primary" className="w-full" href={event.link}>
                Register Now
              </Button>
            )}
            {hasResultsPoster && (
              <Button
                variant={status === 'upcoming' && event.link ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => setShowResults(true)}
                aria-haspopup="dialog"
                aria-label={`View results poster for ${event.title}`}
              >
                View Results
              </Button>
            )}
          </div>
        </div>
      </div>

      {showResults && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Results poster for ${event.title}`}
          onClick={(e) => e.target === e.currentTarget && setShowResults(false)}
        >
          <button
            type="button"
            onClick={() => setShowResults(false)}
            aria-label="Close results poster"
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white/80 transition-colors hover:text-[#3FAE5C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3FAE5C]"
          >
            <FiX className="h-6 w-6" />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex max-h-full w-full max-w-4xl flex-col items-center gap-3"
            onClick={(e) => e.target === e.currentTarget && setShowResults(false)}
          >
            <img
              src={resultsPoster}
              alt={`${event.title} results poster`}
              className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />
            <p className="text-center text-sm font-medium text-white/70">
              {event.title} · Results
            </p>
          </motion.div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}
