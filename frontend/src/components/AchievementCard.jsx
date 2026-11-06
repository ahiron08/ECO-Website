import { motion } from 'framer-motion';

export default function AchievementCard({ achievement, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="achievement-card group bg-white rounded-2xl overflow-hidden shadow-card hover-lift h-full flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={achievement.image}
            alt={achievement.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="relative p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-[#222] mb-3">
            {achievement.title}
          </h3>
          <p className="achievement-description text-muted line-clamp-3 transition-transform duration-300 group-hover:-translate-y-2 group-focus-within:-translate-y-2">
            {achievement.description}
          </p>
          <div
            className="achievement-tooltip absolute inset-x-4 bottom-3 z-10 rounded-xl bg-gray-100/95 p-4 text-muted shadow-soft opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
            aria-hidden="true"
          >
            {achievement.description}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
