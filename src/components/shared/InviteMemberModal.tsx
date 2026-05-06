import { useEffect } from "react";
import { X } from "lucide-react";
import type { PersonSuggestion } from "../../data/mockData";

interface InviteMemberModalProps {
  open: boolean;
  suggestions: PersonSuggestion[];
  onClose: () => void;
  onInvite?: (person: PersonSuggestion) => void;
}

export default function InviteMemberModal({
  open,
  suggestions,
  onClose,
  onInvite,
}: InviteMemberModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="relative w-full max-w-[700px] max-h-[90vh] bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-[20px] shadow-[0_24px_48px_rgba(17,21,29,0.5)] flex flex-col overflow-hidden"
      >
        {/* Header — stays pinned while the grid scrolls below. */}
        <div className="shrink-0 flex flex-col gap-1.5 px-6 pt-6 pb-4 bg-[var(--color-bg-page)] border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="invite-member-title"
              className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none"
            >
              Invite member
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="size-7 rounded-full flex items-center justify-center text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            They'll receive an email invitation to join your team.
          </p>
        </div>

        {/* Grid of suggestions — scroll region. */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {suggestions.map((person) => (
              <SuggestionTile
                key={person.id}
                person={person}
                onInvite={() => onInvite?.(person)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]);
}

function SuggestionTile({
  person,
  onInvite,
}: {
  person: PersonSuggestion;
  onInvite: () => void;
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-3 w-full min-w-0">
        <div className="size-9 rounded-full bg-[var(--color-alpha-white-8)] flex items-center justify-center shrink-0">
          <span className="text-sm font-medium uppercase text-[var(--color-text-primary)] leading-none tracking-tight">
            {initialsFor(person.name)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-3 w-full min-w-0">
          <div className="flex flex-col items-center gap-1.5 w-full min-w-0">
            <p className="text-[18px] font-semibold text-[var(--color-text-primary)] leading-snug text-center truncate w-full">
              {person.name}
            </p>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] leading-none text-center truncate w-full">
              {person.email}
            </p>
          </div>
          <p className="text-xs font-medium text-[var(--color-text-tertiary)] leading-none text-center">
            {person.reason}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onInvite}
        className="w-[88px] h-9 px-4 rounded-xl bg-[var(--color-brand-8)] hover:bg-[var(--color-brand-12)] text-[13px] text-[var(--color-brand)] transition-colors cursor-pointer"
      >
        invite
      </button>
    </div>
  );
}
