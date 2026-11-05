import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SectionTitle from '../components/SectionTitle';
import { useNoixorgo } from '../hooks/useContent';

const ordinalSuffix = /(\d+)(st|nd|rd|th)/;

function getIssueTime(issue) {
  if (!issue.date) return Number.NEGATIVE_INFINITY;

  const normalizedDate = issue.date.replace(ordinalSuffix, '$1');
  const timestamp = Date.parse(normalizedDate);
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function getWrappedIndex(index, length) {
  return (index + length) % length;
}

function getRelativePosition(index, activeIndex, length) {
  const forwardDistance = getWrappedIndex(index - activeIndex, length);
  const backwardDistance = forwardDistance - length;

  if (forwardDistance === 0) return 'active';
  if (backwardDistance === -1) return 'previous';
  if (forwardDistance === 1) return 'next';
  if (forwardDistance === 2) return 'far';
  return 'hidden';
}

function IssueImage({ issue, showingTip, active }) {
  const transitionClass = active ? 'noixorgo-image-transition' : '';
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-black">
      <img
        src={issue.coverImage}
        alt={`Noixorgo Week ${issue.week} cover`}
        className={`absolute inset-0 h-full w-full object-contain ${transitionClass} ${
          showingTip ? 'opacity-0' : 'opacity-100'
        }`}
        loading={active ? 'eager' : 'lazy'}
        decoding="async"
      />
      <img
        src={issue.quoteImage}
        alt={`Noixorgo Week ${issue.week} environmental tip`}
        className={`absolute inset-0 h-full w-full object-contain ${transitionClass} ${
          showingTip ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default function NoixorgoPage() {
  const prefersReducedMotion = useReducedMotion();
  const { data: noixorgoData } = useNoixorgo();
  const stageRef = useRef(null);
  const issues = useMemo(
    () => (noixorgoData ?? [])
      .filter((issue) => issue?.coverImage && issue?.quoteImage)
      .sort((left, right) => getIssueTime(right) - getIssueTime(left)),
    [noixorgoData],
  );
  const latestIndex = issues.length > 0 ? 0 : -1;
  const [activeIndex, setActiveIndex] = useState(latestIndex);
  const [showingTip, setShowingTip] = useState(false);
  const lastWheelNavigation = useRef(0);
  const currentIndex = issues.length > 0 ? getWrappedIndex(activeIndex, issues.length) : -1;

  useEffect(() => {
    if (issues.length > 0 && (activeIndex < 0 || activeIndex >= issues.length)) {
      setActiveIndex(0);
    }
  }, [activeIndex, issues.length]);

  const selectIssue = useCallback((index) => {
    setActiveIndex(index);
    setShowingTip(false);
  }, []);

  const moveIssue = useCallback((direction) => {
    if (issues.length === 0) return;
    selectIssue(getWrappedIndex(currentIndex + direction, issues.length));
  }, [currentIndex, issues.length, selectIssue]);

  const activeIssue = issues[currentIndex];

  const toggleTip = () => setShowingTip((visible) => !visible);

  const handleActiveCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTip();
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const handleCarouselWheel = (event) => {
      if (issues.length < 2 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

      event.preventDefault();
      const now = Date.now();
      if (now - lastWheelNavigation.current < 350) return;

      lastWheelNavigation.current = now;
      moveIssue(event.deltaY > 0 ? 1 : -1);
    };

    stage.addEventListener('wheel', handleCarouselWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleCarouselWheel);
  }, [issues.length, moveIssue]);

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAFAFA] pt-20">
      <section className="bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            title="Noixorgo"
            subtitle="Eco Club&apos;s official magazine and newsletter"
          />
        </div>
      </section>

      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {activeIssue ? (
            <>
              <div className="mb-6 text-center">
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#3FAE5C]">
                  Noixorgo Issues
                </p>
                <p className="mt-2 text-muted" aria-live="polite">
                  Week {activeIssue.week} · {activeIssue.date}
                </p>
              </div>

              <div
                ref={stageRef}
                className="noixorgo-stage relative mx-auto w-full max-w-6xl"
                aria-label="Noixorgo issue carousel"
                aria-roledescription="carousel"
              >
                {issues.map((issue, index) => {
                  const position = getRelativePosition(index, currentIndex, issues.length);
                  const isActive = position === 'active';
                  const isHidden = position === 'hidden';

                  return (
                    <div
                      key={`${issue.week}-${issue.coverImage}`}
                      className={`noixorgo-layer ${isHidden ? 'noixorgo-layer-hidden' : ''} ${
                        prefersReducedMotion ? 'noixorgo-no-motion' : ''
                      }`}
                      data-position={position}
                      aria-hidden={isHidden}
                    >
                      {isActive ? (
                        <article
                          className="noixorgo-active-card mx-auto w-full"
                          role="button"
                          tabIndex={0}
                          onClick={toggleTip}
                          onKeyDown={handleActiveCardKeyDown}
                          aria-label={`Week ${issue.week} issue. ${
                            showingTip ? 'Showing tip. Click to view cover.' : 'Showing cover. Click to view tip.'
                          }`}
                          aria-pressed={showingTip}
                        >
                          <div className="relative overflow-hidden rounded-xl border border-[#ECECEC] bg-black shadow-soft">
                            {index === latestIndex && (
                              <span className="absolute left-3 top-3 z-10 rounded-full bg-[#3FAE5C] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                Latest issue
                              </span>
                            )}
                            <IssueImage issue={issue} showingTip={showingTip} active />
                          </div>
                          <div className="pt-4 text-center">
                            <h2 className="text-2xl font-bold text-[#222]">Week {issue.week}</h2>
                            <p className="mt-1 text-sm text-muted">{issue.date}</p>
                            <p className="mt-3 text-sm font-medium text-[#3FAE5C]">
                              {showingTip ? 'Click to view cover' : 'Click to view tip'}
                            </p>
                          </div>
                        </article>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectIssue(index)}
                          aria-label={`View Week ${issue.week} issue`}
                          tabIndex={isHidden ? -1 : 0}
                          className="noixorgo-background-card block w-full rounded-xl border border-[#ECECEC] bg-black text-left shadow-soft transition-shadow hover:border-[#3FAE5C] hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3FAE5C]"
                        >
                          <IssueImage issue={issue} showingTip={false} active={false} />
                          {index === latestIndex && (
                            <span className="absolute left-3 top-3 rounded-full bg-[#3FAE5C] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                              Latest issue
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => moveIssue(-1)}
                  aria-label="Previous issue"
                  className="rounded-full border border-[#ECECEC] bg-white p-2 text-[#222] transition-colors hover:border-[#3FAE5C] hover:text-[#3FAE5C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3FAE5C]"
                >
                  <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <p className="min-w-24 text-center text-sm text-muted" aria-live="polite">
                  Issue {currentIndex + 1} of {issues.length}
                </p>
                <button
                  type="button"
                  onClick={() => moveIssue(1)}
                  aria-label="Next issue"
                  className="rounded-full border border-[#ECECEC] bg-white p-2 text-[#222] transition-colors hover:border-[#3FAE5C] hover:text-[#3FAE5C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3FAE5C]"
                >
                  <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <p className="py-12 text-center text-xl text-muted">
              No Noixorgo issues are available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
