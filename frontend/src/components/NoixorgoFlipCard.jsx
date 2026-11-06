import { useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function NoixorgoFlipCard({ issue, featured = false }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const label = `Week ${issue.week} Noixorgo issue, ${issue.date}`;

  const flipCard = () => setIsFlipped((flipped) => !flipped);

  return (
    <button
      type="button"
      onClick={flipCard}
      aria-label={`${label}. ${isFlipped ? 'Show cover' : 'Flip to read this week’s tip'}`}
      aria-pressed={isFlipped}
      className={`group relative block w-full rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3FAE5C] ${
        featured ? 'max-w-xl mx-auto' : ''
      }`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#ECECEC] bg-black transition-colors duration-200 group-hover:border-[#3FAE5C]">
        <div
          className={`absolute inset-0 transition-opacity ${
            prefersReducedMotion ? 'duration-0' : 'duration-200'
          } ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
        >
          <img
            src={issue.coverImage}
            alt={`Noixorgo Week ${issue.week} cover`}
            className="h-full w-full object-contain"
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>

        <div
          className={`absolute inset-0 transition-opacity ${
            prefersReducedMotion ? 'duration-0' : 'duration-200'
          } ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={issue.quoteImage}
            alt={`Noixorgo Week ${issue.week} environmental tip`}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold text-[#222]">Week {issue.week}</h3>
        <p className="text-sm text-muted">{issue.date}</p>
        <p className="mt-2 text-sm font-medium text-[#3FAE5C]">
          {isFlipped ? 'Click to show cover' : featured ? "View today's tip" : 'View environmental tip'}
        </p>
      </div>
    </button>
  );
}
