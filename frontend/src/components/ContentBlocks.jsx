import { parseContentBlocks } from '../lib/contentMapper';

const headingClasses = {
  1: 'text-3xl font-bold text-[#222]',
  2: 'text-2xl font-bold text-[#222]',
  3: 'text-xl font-semibold text-[#222]',
};

export default function ContentBlocks({ content, className = '' }) {
  const blocks = parseContentBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2 key={index} className={headingClasses[block.level] ?? headingClasses[3]}>
              {block.text}
            </h2>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={index} className="border-l-4 border-[#3FAE5C] pl-5 italic text-muted">
              {block.text}
            </blockquote>
          );
        }

        if (block.type === 'image') {
          return (
            <figure key={index} className="my-6">
              <img
                src={block.src}
                alt={block.alt || ''}
                className="w-full rounded-xl object-cover"
                loading="lazy"
              />
              {block.alt && (
                <figcaption className="mt-2 text-center text-sm text-muted">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          );
        }

        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
