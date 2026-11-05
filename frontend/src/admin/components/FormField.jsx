import ImageUploadField from './ImageUploadField';
import MarkdownField from './MarkdownField';

const inputBase = 'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#222] outline-none transition focus:ring-2 focus:ring-[#3FAE5C]/30';

function optionList(field) {
  return (field.options ?? []).map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
}

export default function FormField({ field, value, error, onChange, idPrefix = 'admin' }) {
  const id = `${idPrefix}-${field.name}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = error ? errorId : (field.help ? helpId : undefined);
  const inputClass = `${inputBase} ${error ? 'border-red-400' : 'border-[#ECECEC] focus:border-[#3FAE5C]'}`;
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#222]">
      {field.label}
      {field.required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );

  if (field.type === 'checkbox') {
    return (
      <div>
        <label
          htmlFor={id}
          className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition ${
            error ? 'border-red-400' : 'border-[#ECECEC] hover:border-[#3FAE5C]'
          }`}
        >
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#c9d6c4] text-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]"
            aria-describedby={describedBy}
          />
          <span>
            <span className="block text-sm font-semibold text-[#222]">{field.label}</span>
            {field.help && <span className="mt-0.5 block text-xs leading-5 text-muted">{field.help}</span>}
          </span>
        </label>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    );
  }

  let control;

  if (field.type === 'image') {
    control = (
      <ImageUploadField
        id={id}
        bucket={field.bucket}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  } else if (field.type === 'markdown') {
    control = (
      <MarkdownField
        id={id}
        field={field}
        value={value}
        onChange={onChange}
        error={error}
      />
    );
  } else if (field.type === 'textarea') {
    control = (
      <textarea
        id={id}
        rows={field.rows ?? 4}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
    );
  } else if (field.type === 'select') {
    const options = optionList(field);
    control = (
      <select
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      >
        <option value="">{field.placeholder ?? 'Select an option'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  } else {
    const inputType = {
      number: 'number',
      date: 'date',
      datetime: 'datetime-local',
      email: 'email',
      url: 'url',
      text: 'text',
    }[field.type] ?? 'text';

    control = (
      <input
        id={id}
        type={inputType}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        className={inputClass}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
    );
  }

  return (
    <div>
      {label}
      {control}
      {field.help && !error && (
        <p id={helpId} className="mt-1.5 text-xs leading-5 text-muted">{field.help}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
