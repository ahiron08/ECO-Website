import { motion } from 'framer-motion';

export default function GalleryCard({ image, index, onSelect }) {
  return (
    <motion.button
      type="button"
      key={image.id}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      onClick={() => onSelect && onSelect(image)}
      aria-label={`Open photo: ${image.alt}`}
      className="group relative overflow-hidden focus-within:ring-2 focus-within:ring-[#3FAE5C] focus-within:ring-offset-2 focus-within:ring-offset-[#FAFAFA] btn-grid-train"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm">
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-end p-3 text-left">
        <p className="text-white text-sm font-medium leading-snug">{image.alt}</p>
        <p className="text-white/70 text-xs mt-0.5">{image.category}</p>
      </div>
    </motion.button>
  );
}