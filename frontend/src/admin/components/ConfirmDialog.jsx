import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => {} : onCancel}
      size="sm"
      footer={(
        <>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-[#ECECEC] px-5 py-2.5 text-sm font-semibold text-[#222] transition hover:bg-[#f7f9f5] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </>
      )}
    >
      <div className="flex gap-4">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-red-50 text-red-600">
          <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm leading-6 text-muted">{message}</p>
      </div>
    </Modal>
  );
}
