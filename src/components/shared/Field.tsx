import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Calendar, ChevronDown } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Reusable form field components matching the Figma                          */
/* `Input` + `input-label` (label + field) specs.                             */
/*                                                                            */
/* Visual spec:                                                               */
/*  - h-11 (44px) container, rounded-2xl (radius var), pl-5 / pr-4, border    */
/*  - bg-surface default, bg-elevated on hover/focus                          */
/*  - 16px regular text, leading-5, tracking-[-0.16px]                        */
/*  - placeholder: text-tertiary                                              */
/*  - filled value: text-primary                                              */
/*  - disabled: bg-page + text-disabled                                       */
/*  - large variant (textarea): h-22 (88px), items-start                      */
/*  - dropdown variant: chevron right                                         */
/*  - number variant: "+1" prefix on the left                                 */
/*                                                                            */
/* Label spec:                                                                */
/*  - 14px font-medium text-secondary                                         */
/*  - required: orange "*" with 4px gap                                       */
/*  - 12px gap between label and input                                        */
/* -------------------------------------------------------------------------- */

// `--field-bg` is a custom property the input's autofill rule (in index.css)
// reads from, so the autofill mask always matches whatever bg the parent
// container is currently showing.
const FIELD_BASE =
  "flex items-center gap-2 h-11 pl-5 pr-4 rounded-2xl border transition-colors bg-[var(--field-bg)]";
const FIELD_DEFAULT =
  "[--field-bg:var(--color-bg-surface)] hover:[--field-bg:var(--color-bg-elevated)] focus-within:[--field-bg:var(--color-bg-elevated)] border-[var(--color-border)] focus-within:border-[var(--color-border-focus)]";
const FIELD_DISABLED =
  "[--field-bg:var(--color-bg-page)] border-[var(--color-border)] cursor-not-allowed";
const INPUT_TEXT =
  "flex-1 min-w-0 bg-transparent text-base leading-5 tracking-[-0.16px] outline-none placeholder:text-[var(--color-text-tertiary)]";

interface LabeledFieldProps {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Wrapper that renders a label (optionally with a required asterisk) above
 *  the input, with the 12px gap from the Figma `input-label` component. */
export function LabeledField({
  label,
  required = false,
  className = "",
  children,
}: LabeledFieldProps) {
  return (
    <label className={`flex flex-col gap-3 w-full ${className}`}>
      <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-text-secondary)] leading-none">
        {label}
        {required && (
          <span className="text-[var(--color-text-warning)]" aria-hidden>
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function TextField({
  value,
  onChange,
  disabled,
  className = "",
  ...rest
}: TextFieldProps) {
  return (
    <div
      className={`${FIELD_BASE} ${disabled ? FIELD_DISABLED : FIELD_DEFAULT} ${className}`}
    >
      <input
        {...rest}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_TEXT} ${
          disabled
            ? "text-[var(--color-text-disabled)] cursor-not-allowed"
            : "text-[var(--color-text-primary)]"
        }`}
      />
    </div>
  );
}

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

/** Number variant — fixed "+1" prefix in front of a phone-style input. */
export function PhoneField({
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete = "tel-national",
}: PhoneFieldProps) {
  return (
    <div className={`${FIELD_BASE} ${disabled ? FIELD_DISABLED : FIELD_DEFAULT}`}>
      <span
        className={`shrink-0 text-base leading-5 tracking-[-0.16px] ${
          disabled
            ? "text-[var(--color-text-disabled)]"
            : "text-[var(--color-text-primary)]"
        }`}
      >
        +1
      </span>
      <input
        type="tel"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${INPUT_TEXT} ${
          disabled
            ? "text-[var(--color-text-disabled)] cursor-not-allowed"
            : "text-[var(--color-text-primary)]"
        }`}
      />
    </div>
  );
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

/** Dropdown variant — native <select> styled to match the Figma spec, with a
 *  chevron-down icon on the right. */
export function SelectField({
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: SelectFieldProps) {
  return (
    <div
      className={`${FIELD_BASE} relative ${
        disabled ? FIELD_DISABLED : FIELD_DEFAULT
      }`}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 min-w-0 bg-transparent text-base leading-5 tracking-[-0.16px] outline-none appearance-none cursor-pointer pr-2 ${
          disabled
            ? "text-[var(--color-text-disabled)]"
            : value
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-tertiary)]"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            className="text-[var(--color-text-primary)]"
          >
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={20}
        className={`shrink-0 pointer-events-none ${
          disabled
            ? "text-[var(--color-text-disabled)]"
            : "text-[var(--color-icon-secondary)]"
        }`}
      />
    </div>
  );
}

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/** Icon variant — text input with a calendar icon on the right, used for
 *  date-of-birth and similar manual date entries. */
export function DateField({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  disabled,
}: DateFieldProps) {
  return (
    <div className={`${FIELD_BASE} ${disabled ? FIELD_DISABLED : FIELD_DEFAULT}`}>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className={`${INPUT_TEXT} ${
          disabled
            ? "text-[var(--color-text-disabled)] cursor-not-allowed"
            : "text-[var(--color-text-primary)]"
        }`}
      />
      <Calendar
        size={20}
        className={`shrink-0 ${
          disabled
            ? "text-[var(--color-text-disabled)]"
            : "text-[var(--color-icon-secondary)]"
        }`}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

/** Large variant — multi-line input (88px tall by default). */
export function TextAreaField({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div
      className={`${FIELD_BASE} items-start py-3 min-h-[88px] h-auto ${
        disabled ? FIELD_DISABLED : FIELD_DEFAULT
      }`}
    >
      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${INPUT_TEXT} resize-none ${
          disabled
            ? "text-[var(--color-text-disabled)] cursor-not-allowed"
            : "text-[var(--color-text-primary)]"
        }`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reference data shared by several signup steps                              */
/* -------------------------------------------------------------------------- */

export const US_STATES: { value: string; label: string }[] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
  ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"],
  ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"],
  ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"],
  ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
  ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"],
  ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"],
  ["WI", "Wisconsin"], ["WY", "Wyoming"],
].map(([value, label]) => ({ value, label }));

export const BUSINESS_TYPES: { value: string; label: string }[] = [
  { value: "sole_prop", label: "Sole proprietorship" },
  { value: "llc", label: "LLC" },
  { value: "c_corp", label: "C-Corporation" },
  { value: "s_corp", label: "S-Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "nonprofit", label: "Nonprofit" },
];

/** Hook that tracks whether a field has had any user interaction — handy for
 *  delaying validation messaging until the user has touched the field. */
export function useTouched() {
  const [touched, setTouched] = useState(false);
  return { touched, markTouched: () => setTouched(true) };
}
