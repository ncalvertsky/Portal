import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

interface PopoverProps {
  /** Renders the trigger element. Receives `{ open, toggle }` so the trigger
   *  can reflect open state and dispatch open/close. */
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode;
  /** Render-prop body. Receives a `close()` to dismiss the popover. */
  children: (close: () => void) => ReactNode;
  /** Layout classes applied to the popover panel (width, padding, flex, etc.). */
  panelClassName?: string;
  /** Horizontal alignment of the panel relative to the trigger. Default `start`. */
  align?: "start" | "end";
  /** When true, the panel is sized to the trigger's measured width — useful
   *  for select-style menus that should mirror the dropdown button. */
  matchTriggerWidth?: boolean;
}

const GAP = 8; // px gap between trigger and panel
const VIEWPORT_PAD = 8; // px min distance from viewport edges

/** Context that lets descendant Popovers register their panel with an
 *  ancestor. The ancestor's outside-click logic uses the registry so a click
 *  inside a nested popover doesn't close the parent. */
interface PopoverContextValue {
  registerChild: (ref: RefObject<HTMLDivElement | null>) => () => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

/** Generic popover that renders its panel into a portal with `position: fixed`,
 *  so it escapes any ancestor `overflow: hidden|auto|scroll` containers (e.g.
 *  horizontal-scrolling toolbars).
 *
 *  The trigger is wrapped in a `relative` div whose bounding rect is used to
 *  anchor the panel. Outside-click + Escape both dismiss. Nested Popovers
 *  register themselves with their parent so a click inside a child panel does
 *  not dismiss the parent. */
export default function Popover({
  trigger,
  children,
  panelClassName = "w-64 p-3 flex flex-col gap-2",
  align = "start",
  matchTriggerWidth = false,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  // Track child popovers so clicks inside them don't dismiss us.
  const childPanels = useRef<Set<RefObject<HTMLDivElement | null>>>(new Set());
  const registerChild = useCallback<PopoverContextValue["registerChild"]>((ref) => {
    childPanels.current.add(ref);
    return () => {
      childPanels.current.delete(ref);
    };
  }, []);
  const ctxValue = useMemo<PopoverContextValue>(
    () => ({ registerChild }),
    [registerChild],
  );

  // If we're nested inside another Popover, register with it.
  const parent = useContext(PopoverContext);
  useEffect(() => {
    if (!parent) return;
    return parent.registerChild(panelRef);
  }, [parent]);

  const reposition = () => {
    const triggerEl = triggerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    if (matchTriggerWidth) setTriggerWidth(rect.width);
    const panelWidth = matchTriggerWidth
      ? rect.width
      : panelEl?.offsetWidth ?? 256;
    const panelHeight = panelEl?.offsetHeight ?? 0;

    // Vertical position: prefer below the trigger; flip above when there
    // isn't room below. If neither side fits, pick the side with more space
    // and clamp into the viewport.
    const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_PAD;
    const spaceAbove = rect.top - GAP - VIEWPORT_PAD;
    let top: number;
    if (panelHeight <= spaceBelow) {
      top = rect.bottom + GAP;
    } else if (panelHeight <= spaceAbove) {
      top = rect.top - GAP - panelHeight;
    } else if (spaceBelow >= spaceAbove) {
      top = rect.bottom + GAP;
    } else {
      top = Math.max(VIEWPORT_PAD, rect.top - GAP - panelHeight);
    }

    let left = align === "end" ? rect.right - panelWidth : rect.left;
    const maxLeft = window.innerWidth - panelWidth - VIEWPORT_PAD;
    if (left > maxLeft) left = Math.max(VIEWPORT_PAD, maxLeft);
    if (left < VIEWPORT_PAD) left = VIEWPORT_PAD;
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => reposition();
    window.addEventListener("scroll", onWin, true);
    window.addEventListener("resize", onWin);
    return () => {
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      // Click inside a child popover panel — let that child manage itself.
      for (const childRef of childPanels.current) {
        if (childRef.current?.contains(t)) return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  return (
    <div className="relative" ref={triggerRef}>
      {trigger({ open, toggle })}
      {open &&
        createPortal(
          <PopoverContext.Provider value={ctxValue}>
            <div
              ref={panelRef}
              data-popover-panel
              style={{
                position: "fixed",
                top: pos?.top ?? -9999,
                left: pos?.left ?? -9999,
                visibility: pos ? "visible" : "hidden",
                width: matchTriggerWidth && triggerWidth ? triggerWidth : undefined,
              }}
              className={`z-50 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] ${panelClassName}`}
            >
              {children(() => setOpen(false))}
            </div>
          </PopoverContext.Provider>,
          document.body,
        )}
    </div>
  );
}
