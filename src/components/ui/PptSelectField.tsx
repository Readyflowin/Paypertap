import { type ChangeEventHandler } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export type PptSelectFieldProps = {
  label: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  options: string[];
  getOptionLabel?: (option: string) => string;
  className?: string;
};

export function PptSelectField({
  label,
  value,
  onChange,
  options,
  getOptionLabel,
  className,
}: PptSelectFieldProps) {
  return (
    <label className={clsx("pds-field", className)}>
      <span>{label}</span>
      <div className="pds-select-wrap">
        <select value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option} value={option}>
              {getOptionLabel ? getOptionLabel(option) : option}
            </option>
          ))}
        </select>
        <ChevronDown size={17} />
      </div>
    </label>
  );
}
