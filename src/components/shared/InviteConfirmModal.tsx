import { useEffect, useMemo, useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import Button from "./Button";
import Tooltip from "./Tooltip";
import type { PersonSuggestion } from "../../data/mockData";

interface InviteConfirmModalProps {
  open: boolean;
  /** Initial set of suggestions pre-populated as selected chips. */
  initialSelected: PersonSuggestion[];
  /** Pool of additional suggestions the user can add as chips. */
  candidates: PersonSuggestion[];
  onClose: () => void;
  onSend?: (payload: { people: PersonSuggestion[]; message: string }) => void;
}

const MAX_INVITES = 10;

export default function InviteConfirmModal({
  open,
  initialSelected,
  candidates,
  onClose,
  onSend,
}: InviteConfirmModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [typed, setTyped] = useState("");
  const [typeError, setTypeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset when the modal opens with a fresh initial selection.
  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelected.map((p) => p.id));
      setMessage("");
      setTyped("");
      setTypeError(null);
      setCopied(false);
    }
  }, [open, initialSelected]);

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

  // Lookup helper so chips render in the order the user added them.
  const allCandidates = useMemo(() => {
    const map = new Map<string, PersonSuggestion>();
    for (const p of candidates) map.set(p.id, p);
    for (const p of initialSelected) map.set(p.id, p);
    return map;
  }, [candidates, initialSelected]);

  const selectedPeople = selectedIds
    .map((id) => allCandidates.get(id))
    .filter((p): p is PersonSuggestion => Boolean(p));

  const remainingPeople = candidates.filter((p) => !selectedIds.includes(p.id));

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_INVITES) return prev;
      return [...prev, id];
    });
  };

  const commitTyped = () => {
    const value = typed.trim().toLowerCase();
    if (!value) return;
    const match = candidates.find(
      (p) => p.email.toLowerCase() === value,
    );
    if (!match) {
      setTypeError(`${typed.trim()} isn't on the list of suggested coworkers.`);
      return;
    }
    if (!selectedIds.includes(match.id) && selectedIds.length < MAX_INVITES) {
      setSelectedIds((prev) => [...prev, match.id]);
    }
    setTyped("");
    setTypeError(null);
  };

  const handleSend = () => {
    if (selectedPeople.length === 0) return;
    onSend?.({ people: selectedPeople, message: message.trim() });
    onClose();
  };

  const handleCopyLink = async () => {
    const inviteLink = `${window.location.origin}/invite/clark-construction-3f9a2`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently no-op.
    }
  };

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
        aria-labelledby="invite-confirm-title"
        className="relative w-full max-w-[560px] bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-[20px] shadow-[0_24px_48px_rgba(17,21,29,0.5)] flex flex-col gap-6 p-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2
            id="invite-confirm-title"
            className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none"
          >
            Invite member
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            They'll receive an email invitation to join your team.
          </p>
        </div>

        {/* Email address + selected chips */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[var(--color-text-primary)]">
              Email address
            </label>
            <div className="min-h-12 px-2.5 py-2 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex flex-wrap gap-2 items-center focus-within:border-[var(--color-border-focus)] transition-colors">
              {selectedPeople.map((person) => (
                <SelectedChip
                  key={person.id}
                  person={person}
                  onRemove={() => toggle(person.id)}
                />
              ))}
              <input
                type="email"
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                  if (typeError) setTypeError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commitTyped();
                  } else if (
                    e.key === "Backspace" &&
                    !typed &&
                    selectedIds.length > 0
                  ) {
                    setSelectedIds((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={commitTyped}
                placeholder={
                  selectedPeople.length === 0
                    ? "Pick coworkers below or type firstname@clarkconcrete.com"
                    : "Add another…"
                }
                className="flex-1 min-w-[160px] bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none px-1.5"
              />
            </div>
            {typeError ? (
              <p className="text-xs text-[var(--color-text-danger)]">
                {typeError}
              </p>
            ) : (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Separate multiple emails with commas to invite up to{" "}
                {MAX_INVITES} people.
              </p>
            )}
          </div>

          {/* Add-more chips */}
          {remainingPeople.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {remainingPeople.map((person) => (
                <AddChip
                  key={person.id}
                  person={person}
                  onAdd={() => toggle(person.id)}
                  disabled={selectedIds.length >= MAX_INVITES}
                />
              ))}
            </div>
          )}
        </div>

        {/* Personal message */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            <label
              htmlFor="invite-message"
              className="text-[13px] font-medium text-[var(--color-text-primary)]"
            >
              Personal message
            </label>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              (optional)
            </span>
          </div>
          <textarea
            id="invite-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note to your invitation…"
            rows={3}
            className="resize-none min-h-20 px-4 py-3 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-border-focus)] transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand)] hover:underline cursor-pointer transition-colors"
          >
            <Copy size={20} />
            <span>{copied ? "Link copied" : "Copy invite link"}</span>
          </button>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={selectedPeople.length === 0}
              onClick={handleSend}
            >
              Send invite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedChip({
  person,
  onRemove,
}: {
  person: PersonSuggestion;
  onRemove: () => void;
}) {
  return (
    <Tooltip content={person.email}>
      <button
        type="button"
        onClick={onRemove}
        className="group inline-flex items-center gap-1 pl-2 pr-3 py-2 rounded-3xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        aria-label={`Remove ${person.name}`}
      >
        <X
          size={12}
          className="text-[var(--color-icon-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors"
        />
        <span className="leading-tight">{person.name}</span>
      </button>
    </Tooltip>
  );
}

function AddChip({
  person,
  onAdd,
  disabled,
}: {
  person: PersonSuggestion;
  onAdd: () => void;
  disabled: boolean;
}) {
  return (
    <Tooltip content={person.email}>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="inline-flex items-center gap-1 pl-2 pr-3 py-2 rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={12} className="text-[var(--color-icon-secondary)]" />
        <span className="leading-tight">{person.name}</span>
      </button>
    </Tooltip>
  );
}
