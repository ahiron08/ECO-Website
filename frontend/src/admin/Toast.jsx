import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './toastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success') => {
    const id = nextId.current;
    nextId.current += 1;

    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-[#cfe6cb] bg-[#eef7ea] text-[#245638]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

