import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const sizes = {
  sm: 'sm:max-w-lg',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'lg',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={`my-auto w-full ${sizes[size] ?? sizes.lg} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-[#ECECEC] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#222]">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-muted transition hover:bg-[#f3f6f2] hover:text-[#222]"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-[#ECECEC] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
