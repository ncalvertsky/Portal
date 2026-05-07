import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "./Button";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { oldPassword: string; newPassword: string }) => void;
}

interface PasswordFields {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: PasswordFields = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) {
  const [fields, setFields] = useState<PasswordFields>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFields(EMPTY);
      setError(null);
    }
  }, [open]);

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

  const update = (key: keyof PasswordFields) => (value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const canSubmit =
    fields.oldPassword.length > 0 &&
    fields.newPassword.length > 0 &&
    fields.confirmPassword.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (fields.newPassword !== fields.confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    onSubmit?.({
      oldPassword: fields.oldPassword,
      newPassword: fields.newPassword,
    });
    onClose();
  };

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
        aria-labelledby="change-password-title"
        className="relative w-full max-w-[480px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[28px] shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] flex flex-col gap-6 p-6"
      >
        <h2
          id="change-password-title"
          className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none"
        >
          Change password
        </h2>

        <div className="flex flex-col gap-4">
          <PasswordField
            label="Old password"
            value={fields.oldPassword}
            onChange={update("oldPassword")}
            autoComplete="current-password"
          />
          <PasswordField
            label="New password"
            value={fields.newPassword}
            onChange={update("newPassword")}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm new password"
            value={fields.confirmPassword}
            onChange={update("confirmPassword")}
            autoComplete="new-password"
          />
          {error && (
            <p className="text-xs text-[var(--color-text-danger)]">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text-secondary)] leading-none">
        {label}
      </span>
      <div className="h-11 px-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center gap-2 focus-within:border-[var(--color-border-focus)] transition-colors">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </label>
  );
}
