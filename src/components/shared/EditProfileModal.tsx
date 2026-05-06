import { useEffect, useState } from "react";
import Button from "./Button";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (profile: ProfileFields) => void;
}

export interface ProfileFields {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

const DEFAULT_PROFILE: ProfileFields = {
  name: "Katarina Shultz",
  email: "kshultz@clarkconstruction.com",
  phone: "+1 (555) 123-4567",
  company: "Clark Construction",
  address: "123 Main St, Suite 100, Nashville, TN 37201",
};

export default function EditProfileModal({
  open,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [fields, setFields] = useState<ProfileFields>(DEFAULT_PROFILE);

  useEffect(() => {
    if (open) setFields(DEFAULT_PROFILE);
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

  const handleSave = () => {
    onSave?.(fields);
    onClose();
  };

  const update = (key: keyof ProfileFields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

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
        aria-labelledby="edit-profile-title"
        className="relative w-full max-w-[480px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[20px] shadow-[0_24px_48px_rgba(17,21,29,0.5)] flex flex-col gap-6 p-6"
      >
        <h2
          id="edit-profile-title"
          className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none"
        >
          Edit profile
        </h2>

        <div className="flex flex-col gap-4">
          <Field
            label="Name"
            value={fields.name}
            onChange={update("name")}
            autoComplete="name"
          />
          <Field
            label="Email"
            type="email"
            value={fields.email}
            onChange={update("email")}
            autoComplete="email"
          />
          <Field
            label="Phone"
            type="tel"
            value={fields.phone}
            onChange={update("phone")}
            autoComplete="tel"
          />
          <Field
            label="Company"
            value={fields.company}
            onChange={update("company")}
            autoComplete="organization"
          />
          <Field
            label="Address"
            value={fields.address}
            onChange={update("address")}
            autoComplete="street-address"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[var(--color-text-primary)] leading-none">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="h-11 px-3.5 rounded-[28px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-border-focus)] transition-colors"
      />
    </label>
  );
}
