import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import OutpaveLogo from "../shared/OutpaveLogo";
import Button from "../shared/Button";

/**
 * Site-wide entry gate. Sits in front of the Projects picker so the
 * prototype URL isn't openly accessible — Netlify previews don't have a
 * password layer, so this stops casual link-sharing leaks. Credentials are
 * hardcoded (this is a prototype gate, not real auth) and the unlocked
 * state persists in sessionStorage so a refresh doesn't re-prompt.
 */

const GATE_USER = "outpave";
const GATE_PASS = "g7ghnpWB";
const STORAGE_KEY = "outpave-site-unlock";

/** Set when the gate has been passed in the current browser session.
 *  Cleared automatically when the tab closes (sessionStorage). */
export function isSiteUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}

function setSiteUnlocked(): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* sessionStorage unavailable — gate just re-prompts next refresh */
  }
}

interface SiteGateProps {
  onUnlock: () => void;
}

export default function SiteGate({ onUnlock }: SiteGateProps) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      user.trim().toLowerCase() === GATE_USER &&
      pass === GATE_PASS
    ) {
      setError(null);
      setSiteUnlocked();
      onUnlock();
    } else {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-page)] px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-[420px] flex flex-col gap-6 p-8 sm:p-10 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
      >
        <div className="flex flex-col gap-3">
          <OutpaveLogo className="h-7 w-auto self-start" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[22px] font-medium tracking-tight text-[var(--color-text-primary)] leading-tight">
              Internal prototype
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)] leading-snug">
              Enter the access credentials to continue.
            </p>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 w-full">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Username
          </span>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            autoFocus
            className="h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none border border-[var(--color-border)] focus:border-[var(--color-border-focus)] transition-colors"
          />
        </label>

        <label className="flex flex-col gap-1.5 w-full">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Password
          </span>
          <div className="h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] flex items-center gap-2 border border-[var(--color-border)] focus-within:border-[var(--color-border-focus)] transition-colors">
            <input
              type={show ? "text" : "password"}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              className="flex-1 min-w-0 bg-transparent text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((v) => !v)}
              className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </label>

        {error && (
          <p role="alert" className="text-sm text-[var(--color-text-danger)]">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full">
          Enter
        </Button>
      </form>
    </div>
  );
}
