import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight, FiMapPin, FiPackage } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

const PREORDER_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSexGY0aeydanQCLMAcfdFA6qyvIS4WQEnRiAy5Fj2tk_Y-dmQ/viewform'; // Add the preorder destination here when it is ready.
const MERCH_REVEAL_URL = 'https://www.canva.com/design/DAHZOSUX61w/Cja8NS6KNjqsC0YGeSsQGQ/view?embed';
const MERCH_VIDEO = '/merch/merch.mp4';
const MERCH_POSTER = '/merch/merch-poster.jpg';

const designers = ['Krishnav', 'Gitartha', 'Atikuj'];

const details = [
  {
    icon: FaLeaf,
    title: 'A tribute to nature',
    text: 'Assam’s wildlife, native blooms and leaves come together in one illustrated design.',
  },
  {
    icon: FiMapPin,
    title: 'Rooted in Assam',
    text: 'A gamosa, the one-horned rhino and other familiar symbols celebrate the place we call home.',
  },
  {
    icon: FiPackage,
    title: 'Made for your fit',
    text: 'Choose a regular fit at 190 GSM or an oversized fit at 230 GSM.',
  },
];

export default function MerchPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="merch-page min-h-screen bg-[#F6F4E9] pt-20 text-[#173E2B]">
      <section className="relative isolate overflow-hidden bg-[#103B29] px-6 py-16 text-white sm:py-20 lg:px-8">
        <div className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-[#3FAE5C]/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#D6F38B]">
              <span className="h-2 w-2 rounded-full bg-[#C7F65B]" />
              The 2026 drop
            </span>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-[#B8D9A6]">Eco Club NITS presents</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[1.04] sm:text-6xl lg:text-7xl">
              Wear what
              <span className="block font-medium italic text-[#C7F65B]">you stand for.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75 sm:text-xl">
              A little piece of Assam, a reminder to care for the living world around us. Meet this year’s Eco Club tee.
            </p>
            <blockquote className="mt-8 max-w-lg border-l-2 border-[#C7F65B] pl-5 text-lg leading-7 text-white/90">
              “Plant a tree in my name that will live longer than flowers or gamosas”
              <cite className="mt-2 block text-sm not-italic text-[#B8D9A6]">— ZG</cite>
            </blockquote>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {PREORDER_URL ? (
                <a
                  href={PREORDER_URL}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C7F65B] px-6 py-3 font-bold text-[#173E2B] transition hover:bg-white"
                >
                  Order the tee <FiArrowUpRight aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-full bg-[#C7F65B] px-6 py-3 font-bold text-[#173E2B] opacity-90"
                  aria-label="Orders available"
                >
                  Orders available
                </button>
              )}
              <span className="text-sm text-white/60">Order your T-shirt here.</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="mx-auto w-full max-w-[430px]"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-[#0B251B] p-2 shadow-2xl shadow-black/30">
              <video
                className="merch-video aspect-[4/5] w-full rounded-[1.5rem] bg-[#F6F4E9] object-cover"
                poster={MERCH_POSTER}
                autoPlay={!prefersReducedMotion}
                muted
                loop
                playsInline
                preload="metadata"
                controls={prefersReducedMotion}
                aria-label="Rotating reveal of the 2026 Eco Club merch design"
              >
                <source src={MERCH_VIDEO} type="video/mp4" />
              </video>
              <p className="px-4 py-3 text-center text-xs tracking-wide text-white/60">
                {prefersReducedMotion
                  ? 'Rotating merch reveal — press play to watch'
                  : 'Rotating merch reveal · front and back of the 2026 design'}
              </p>
            </div>
            <a
              href={MERCH_REVEAL_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C7F65B] transition hover:text-white"
            >
              View full design details <FiArrowUpRight aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="merch-details px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#3FAE5C]">More than a tee</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">A wearable tribute to the wild.</h2>
            <p className="merch-muted mt-4 leading-7 text-[#5E6E61]">
              The artwork brings together the one-horned rhino, Gee’s golden langur, the Siberian crane, native flowers, leaves and Assamese cultural motifs—all around a message of remembrance and care.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {details.map(({ icon: Icon, title, text }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="merch-detail-card rounded-3xl border border-[#DFE5D8] bg-white p-7 shadow-sm"
              >
                <span className="merch-detail-icon flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4DD] text-2xl text-[#287447]">
                  <Icon aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="merch-muted mt-3 leading-7 text-[#657268]">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="merch-fit-section bg-[#E9F0DE] px-6 py-14 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] bg-[#173E2B] px-7 py-9 text-white sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#C7F65B]">Find your fit</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Two fits. One green state of mind.</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4">
              <p className="text-sm text-white/65">Regular fit</p>
              <p className="mt-1 text-2xl font-extrabold">190 <span className="text-base font-medium">GSM</span></p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4">
              <p className="text-sm text-white/65">Oversize fit</p>
              <p className="mt-1 text-2xl font-extrabold">230 <span className="text-base font-medium">GSM</span></p>
            </div>
          </div>
        </div>
        <p className="merch-muted mx-auto mt-6 max-w-7xl text-sm text-[#657268]">
          Keep an eye on <a className="font-semibold text-[#287447] underline underline-offset-4 hover:text-[#173E2B]" href="https://www.instagram.com/eco_club_nits" target="_blank" rel="noreferrer">@eco_club_nits</a> for the preorder announcement.
        </p>
      </section>

      <section className="merch-designers px-6 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#DFE5D8] bg-white px-6 py-8 text-center shadow-sm sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#548545]">Made with care</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#173E2B]">Designers</h2>
          <ul className="mt-5 flex flex-wrap justify-center gap-3">
            {designers.map((designer) => (
              <li key={designer} className="rounded-full bg-[#EAF4DD] px-5 py-2 font-semibold text-[#287447]">
                {designer}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
