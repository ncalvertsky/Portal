import { type ReactNode } from "react";
import FilterChip from "./FilterChip";
import Popover from "./Popover";

interface FilterPopoverProps {
  label: ReactNode;
  selected?: boolean;
  onClear?: () => void;
  /** Render-prop body. Receives a `close()` to dismiss the popover. */
  children: (close: () => void) => ReactNode;
  /** Layout classes applied to the popover panel (width, padding, flex, etc.).
   *  Defaults to a 256px-wide panel with 12px padding and a vertical stack. */
  panelClassName?: string;
}

/** Filter chip + popover panel. Thin wrapper over the generic `Popover` that
 *  uses a `FilterChip` as the trigger. */
export default function FilterPopover({
  label,
  selected,
  onClear,
  children,
  panelClassName = "w-64 p-3 flex flex-col gap-2",
}: FilterPopoverProps) {
  return (
    <Popover
      panelClassName={panelClassName}
      trigger={({ toggle }) => (
        <FilterChip
          label={label}
          selected={selected}
          onClick={toggle}
          onClear={() => onClear?.()}
        />
      )}
    >
      {children}
    </Popover>
  );
}
