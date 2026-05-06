import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
}

export default function SearchBar({
  placeholder,
  value,
  onChange,
  readOnly = false,
  className = "",
  autoFocus = false,
  onBlur,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Treat `autoFocus` as a controlled focus signal: focus the input whenever
  // it flips to `true`. This covers both initial mount and the case where
  // an always-mounted SearchBar transitions from hidden → visible (e.g. the
  // tablet search-icon expansion).
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const base =
    "flex items-center gap-2 h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] focus-within:bg-[var(--color-bg-surface)] focus-within:border-[var(--color-border-focus)] transition-colors";

  return (
    <div className={`${base} ${className}`}>
      <Search
        size={20}
        className="text-[var(--color-icon-secondary)] shrink-0"
      />
      {readOnly ? (
        // Hidden on mobile so the bar collapses to just the search icon — the
        // text reappears at the `sm` breakpoint where there's room for it.
        <span className="hidden sm:inline text-sm font-medium text-[var(--color-text-secondary)] truncate">
          {placeholder}
        </span>
      ) : (
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          // `placeholder:text-transparent` hides the placeholder visually on
          // mobile while keeping it for accessibility (the `aria-label` above
          // still announces the field). Above `sm` it shows normally.
          className="flex-1 bg-transparent outline-none text-sm font-medium text-[var(--color-text-primary)] placeholder:text-transparent sm:placeholder:text-[var(--color-text-secondary)] min-w-0"
        />
      )}
    </div>
  );
}
