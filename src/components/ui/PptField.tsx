import { type ChangeEventHandler, type ReactNode } from "react";
import clsx from "clsx";

export type PptFieldProps = {
  label: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  textarea?: boolean;
  icon?: ReactNode;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  name?: string;
  type?: string;
  min?: string | number;
  step?: string | number;
  minLength?: number;
  required?: boolean;
  className?: string;
};

export function PptField({
  label,
  placeholder,
  error,
  helper,
  textarea,
  icon,
  value,
  onChange,
  name,
  type = "text",
  min,
  step,
  minLength,
  required,
  className,
}: PptFieldProps) {
  return (
    <label className={clsx("pds-field", error && "has-error", className)}>
      <span>{label}</span>
      <div className="pds-input-wrap">
        {icon ? <div className="pds-input-icon">{icon}</div> : null}
        {textarea ? (
          <textarea
            rows={4}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            required={required}
          />
        ) : (
          <input
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            type={type}
            min={min}
            step={step}
            minLength={minLength}
            required={required}
          />
        )}
      </div>
      {error ? <small>{error}</small> : helper ? <small className="is-helper">{helper}</small> : null}
    </label>
  );
}
