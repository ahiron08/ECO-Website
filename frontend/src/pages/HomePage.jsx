import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import AchievementCard from '../components/AchievementCard';
import BlogCard from '../components/BlogCard';
import { useAchievements, useAnnouncements, useBlogs, useEvents } from '../hooks/useContent';
import { getUpcomingEvents } from '../utils/eventStatus';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const heroSlides = [
  {
    image:
      '/home/hero-1.webp',
    title: 'Rooted in Nature. Driven by Change.',
    subtitle:
      'Empowering the NIT Silchar community to protect nature and build a greener tomorrow.',
    cta: 'Explore Our Mission',
    alt: 'Sunlight filtering through a lush green forest',
  },
  {
    image:
      '/home/hero-2.webp',
    title: 'Plant Today. Sustain Tomorrow.',
    subtitle:
      'Every tree we nurture brings us one step closer to a healthier, more sustainable planet.',
    cta: 'Join the Green Movement',
    alt: 'Lush green plants growing in natural sunlight',
  },
  {
    image:
      '/home/hero-3.webp',
    title: 'A Campus That Cares for the Earth.',
    subtitle:
      'Turning environmental awareness into action through conservation, innovation, and community.',
    cta: 'Discover Our Initiatives',
    alt: 'Wildlife thriving in a natural green landscape',
  },
];

export default function HomePage() {
  const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [achievementsRef, achievementsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [blogRef, blogInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const { data: eventsData, loading: eventsLoading } = useEvents();
  const { data: achievementsData } = useAchievements();
  const { data: blogsData } = useBlogs();
  const { data: announcementsData } = useAnnouncements();
  const [dismissedAnnouncementId, setDismissedAnnouncementId] = useState(null);

  const achievements = achievementsData ?? [];
  const blogs = blogsData ?? [];
  const announcement = (announcementsData ?? [])[0];
  const upcomingEvents = getUpcomingEvents(eventsData ?? []);
  const featuredEvent = upcomingEvents.find((event) => event.featured) ?? upcomingEvents[0];
  const showAnnouncement = announcement && announcement.id !== dismissedAnnouncementId;

  return (
    <div className="home-page min-h-screen bg-[#FAFAFA]">
      {/* Hero Section */}
      <section className="relative h-[min(88vh,850px)] min-h-[620px] overflow-hidden bg-[#10291d] max-md:min-h-[620px]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          navigation
          pagination={{ clickable: true }}
          loop
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071b12]/85 via-[#071b12]/55 to-[#071b12]/10" />
                <div className="absolute inset-0 flex items-center px-6 pb-12 pt-20 sm:px-10 lg:px-16">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.75 }}
                    className="mx-auto w-full max-w-7xl text-white"
                  >
                    <div className="max-w-3xl">
                      <span className="home-hero-glass mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white sm:text-sm">
                        <span className="h-2 w-2 rounded-full bg-[#91d65c]" />
                        NIT Silchar · Eco Club
                      </span>
                      <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        {slide.title}
                      </h1>
                      <p className="max-w-2xl text-base leading-7 text-white/85 sm:text-lg md:text-xl md:leading-8">
                        {slide.subtitle}
                      </p>
                      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Button href="/events" className="gap-2 !rounded-full !bg-[#71bd54] !px-7 !py-4 !text-[#10291d] !shadow-lg hover:!bg-[#8bd46d]">
                          {slide.cta}
                          <FiArrowRight aria-hidden="true" />
                        </Button>
                        <Link
                          to="/noixorgo"
                          className="home-hero-glass inline-flex items-center justify-center rounded-full border border-white/55 px-7 py-4 font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          Discover our work
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Campus impact strip */}
      <section className="home-impact-strip relative z-10 mx-auto -mt-8 w-[calc(100%-2rem)] max-w-6xl rounded-2xl border border-[#e6eee7] bg-white px-5 py-6 shadow-[0_18px_50px_rgba(18,50,31,0.12)] sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-[#e6eee7]">
          <div className="px-3">
            <p className="text-2xl font-extrabold tracking-tight text-[#24623b] sm:text-3xl">166th</p>
            <p className="mt-1 text-xs font-medium text-[#66756b] sm:text-sm">UI GreenMetric global sustainability rank</p>
          </div>
          <div className="px-3">
            <p className="text-2xl font-extrabold tracking-tight text-[#24623b] sm:text-3xl">1st</p>
            <p className="mt-1 text-xs font-medium text-[#66756b] sm:text-sm">in India for Energy &amp; Climate Change</p>
          </div>
          <div className="px-3">
            <p className="text-2xl font-extrabold tracking-tight text-[#24623b] sm:text-3xl">One community</p>
            <p className="mt-1 text-xs font-medium text-[#66756b] sm:text-sm">students taking action for a greener campus</p>
          </div>
        </div>
      </section>

      {/* Active announcement */}
      {showAnnouncement && (
        <section className="px-6 pt-10 lg:px-8">
          <div className="home-announcement mx-auto flex max-w-7xl flex-col gap-3 rounded-2xl border border-[#cfe6cb] bg-[#eef7ea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#548545]">Announcement</p>
              <p className="mt-1 font-semibold text-[#20372a]">{announcement.title}</p>
              {announcement.content && (
                <p className="mt-1 text-sm leading-6 text-[#45634c]">{announcement.content}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setDismissedAnnouncementId(announcement.id)}
              className="self-start rounded-full border border-[#a9c9a2] px-4 py-2 text-sm font-semibold text-[#31523a] transition hover:bg-white sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      {/* Featured upcoming event */}
      <section className="home-featured-events bg-white px-6 pb-20 pt-16 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#548545]">Mark your calendar</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#20372a] sm:text-4xl">What’s happening next</h2>
            </div>
            <Link to="/events" className="home-featured-all-link inline-flex items-center gap-2 font-semibold text-[#24623b] transition hover:text-[#17482c]">
              All events <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          {eventsLoading && !featuredEvent ? (
            <div className="home-featured-event-card grid min-h-80 animate-pulse overflow-hidden rounded-[1.75rem] border border-[#e6eee7] bg-[#f6f9f4] md:grid-cols-[0.95fr_1.05fr]" aria-hidden="true">
              <div className="hidden bg-[#dce8d4] md:block" />
              <div className="space-y-4 p-8 sm:p-12">
                <div className="h-4 w-32 rounded bg-[#dce8d4]" />
                <div className="h-9 w-4/5 rounded bg-[#dce8d4]" />
                <div className="h-4 w-full rounded bg-[#e4eee0]" />
                <div className="h-4 w-3/4 rounded bg-[#e4eee0]" />
              </div>
            </div>
          ) : featuredEvent ? (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55 }}
              className="home-featured-event-card grid overflow-hidden rounded-[1.75rem] border border-[#e6eee7] bg-[#f6f9f4] shadow-[0_20px_60px_rgba(18,50,31,0.10)] md:grid-cols-[0.95fr_1.05fr]"
            >
              <div className="relative min-h-64 md:min-h-[25rem]">
                <img src={featuredEvent.image} alt={featuredEvent.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071b12]/65 via-transparent to-transparent md:bg-gradient-to-r" />
                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#17482c]/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur sm:left-7 sm:top-7">
                  <span className="h-2 w-2 rounded-full bg-[#a2df72]" />
                  Upcoming event
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#548545]">{featuredEvent.organizer}</p>
                <h3 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#20372a] sm:text-4xl">{featuredEvent.title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-[#66756b]">{featuredEvent.description}</p>
                <div className="home-featured-event-meta mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#3d5144]">
                  {featuredEvent.date && <span className="inline-flex items-center gap-2"><FiCalendar className="text-[#548545]" aria-hidden="true" />{featuredEvent.date}</span>}
                  {featuredEvent.time && <span className="inline-flex items-center gap-2"><FiClock className="text-[#548545]" aria-hidden="true" />{featuredEvent.time}</span>}
                  {featuredEvent.location && <span className="inline-flex items-center gap-2"><FiMapPin className="text-[#548545]" aria-hidden="true" />{featuredEvent.location}</span>}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {featuredEvent.link ? (
                    <Button href={featuredEvent.link} target="_blank" rel="noreferrer" className="home-featured-register gap-2 !rounded-full !px-7">
                      Register now <FiArrowRight aria-hidden="true" />
                    </Button>
                  ) : (
                    <span className="home-featured-registration-note inline-flex items-center rounded-full bg-[#e8efe5] px-5 py-3 font-semibold text-[#45634c]">Registration details coming soon</span>
                  )}
                  <Link to="/events" className="home-featured-details inline-flex items-center justify-center rounded-full border border-[#cddbcc] px-6 py-3 font-semibold text-[#31523a] transition hover:bg-white">
                    Event details
                  </Link>
                </div>
              </div>
            </motion.article>
          ) : (
            <div className="home-featured-event-card rounded-[1.75rem] border border-[#e6eee7] bg-[#f6f9f4] px-6 py-12 text-center sm:px-10">
              <p className="text-xl font-bold text-[#20372a]">No upcoming events just yet</p>
              <p className="mx-auto mt-2 max-w-lg text-[#66756b]">We’re planning what’s next. Visit the events page to explore our past activities and check back for new announcements.</p>
              <Link to="/events" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#215d39] px-6 py-3 font-semibold text-white transition hover:bg-[#17482c]">
                Browse events <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="home-about bg-[#f5f8f3] px-6 py-20 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={aboutInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20"
        >
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-4 -top-4 h-28 w-28 rounded-tl-[2.5rem] border-l-2 border-t-2 border-[#78b95c] sm:-left-6 sm:-top-6" />
            <img
              src="/achievements/tree-plant.jpeg"
              alt="Eco Club members planting a young tree on campus"
              loading="lazy"
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[0_24px_60px_rgba(18,50,31,0.18)]"
            />
            <div className="home-about-callout absolute -bottom-5 right-4 max-w-[17rem] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur sm:right-[-1.5rem] sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#548545]">Rooted in action</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-[#20372a] sm:text-base">Small steps today. A healthier campus tomorrow.</p>
            </div>
          </div>
          <div className="pt-4 lg:pt-0">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#548545]">Who we are</p>
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#20372a] sm:text-4xl lg:text-5xl">
              A greener campus starts with all of us.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#66756b] sm:text-lg">
              The Eco Club at National Institute of Technology Silchar brings students, faculty, and staff together to turn care for the environment into meaningful action. We learn, work on campus initiatives, and make sustainability part of everyday life.
            </p>
            <div className="mt-7 space-y-3">
              {[
                'Build awareness through learning and conversation',
                'Care for campus green spaces and natural resources',
                'Turn ideas into hands-on community initiatives',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm font-medium leading-6 text-[#334b3b] sm:text-base">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#62a84b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link
              to="/noixorgo"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#215d39] px-6 py-3.5 font-semibold text-white transition hover:bg-[#17482c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#215d39]"
            >
              Explore our initiatives <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </section>

    {/* future initiative upgrade */}
      {/* Green Initiatives Section
      <section
        id="initiatives"
        className="bg-[#F1F7F0] py-20 px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Our Green Initiatives"
            subtitle="Turning environmental awareness into meaningful action"
          />

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {greenInitiatives.map((initiative, index) => (
              <motion.article
                key={initiative.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group overflow-hidden rounded-2xl bg-white
                  shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="overflow-hidden aspect-[4/3]">
                  <img
                    src={initiative.image}
                    alt={initiative.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover
                      transition-transform duration-500
                      group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#245638]">
                    {initiative.title}
                  </h3>

                  <p className="mt-3 text-sm text-gray-600 leading-7">
                    {initiative.description}
                  </p>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 mt-5
                      font-semibold text-[#26734D]
                      hover:text-[#17452D] transition-colors
                      focus-visible:outline-2
                      focus-visible:outline-offset-4"
                  >
                    Get involved
                    <FiArrowRight aria-hidden="true" />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section> */}


      {/* Achievements Section */}
      <section ref={achievementsRef} className="home-content-section py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Our Achievements"
            subtitle="Celebrating our impact and milestones"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={achievementsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            {achievements.length > 0 ? (
              <Swiper
                modules={[Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop
              >
                {achievements.map((achievement, index) => (
                  <SwiperSlide key={achievement.id}>
                    <AchievementCard achievement={achievement} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <p className="py-8 text-center text-muted">
                Achievements will appear here once they are published.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      

      {/* Blog Section */}
      <section ref={blogRef} className="home-blog-section py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="From Our Blog"
            subtitle="Latest articles and stories from Eco Club"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={blogInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid md:grid-cols-3 gap-8"
          >
            {blogs.length > 0 ? blogs.slice(0, 3).map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            )) : (
              <p className="col-span-full text-center text-muted">
                New stories will appear here soon.
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}