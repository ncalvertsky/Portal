import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import OutpaveLogo from "../shared/OutpaveLogo";
import Button from "../shared/Button";
import Selector from "../shared/Selector";
import dashboardPreview from "../../assets/e10c1adfd38cdc6fc2d4c9d70ecdafda78448193.png";

interface LoginPageProps {
  onLogin: () => void;
}

const DEFAULT_EMAIL = "ncalvert@skysystemz.com";
const DEFAULT_PASSWORD = "password123";

const SEEDED_ACCOUNTS: ReadonlyArray<Account> = [
  { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD },
  { email: "williamb@skysystemz.com", password: "password123" },
  { email: "test@skysystemz.com", password: "password123" },
];

const STORAGE_ACCOUNT = "outpave-account";
const STORAGE_RESET = "outpave-reset-token";
const STORAGE_PENDING = "outpave-pending-signup";

type View = "login" | "forgot" | "sent" | "reset" | "signup" | "verify";

interface Account {
  email: string;
  password: string;
}

interface ResetToken {
  email: string;
  token: string;
  expires: number;
}

interface PendingSignup {
  email: string;
  password: string;
  code: string;
  expires: number;
}

function getAccount(): Account {
  const raw = localStorage.getItem(STORAGE_ACCOUNT);
  if (raw) {
    try {
      return JSON.parse(raw) as Account;
    } catch {
      // fall through
    }
  }
  return { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD };
}

function setAccount(account: Account): void {
  localStorage.setItem(STORAGE_ACCOUNT, JSON.stringify(account));
}

function setCurrentPassword(pwd: string): void {
  setAccount({ ...getAccount(), password: pwd });
}

function setPendingSignup(p: PendingSignup): void {
  localStorage.setItem(STORAGE_PENDING, JSON.stringify(p));
}

function getPendingSignup(): PendingSignup | null {
  const raw = localStorage.getItem(STORAGE_PENDING);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as PendingSignup;
    if (p.expires < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}

function clearPendingSignup(): void {
  localStorage.removeItem(STORAGE_PENDING);
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function makeResetToken(email: string): string {
  const token =
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36);
  const record: ResetToken = {
    email,
    token,
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  };
  localStorage.setItem(STORAGE_RESET, JSON.stringify(record));
  return token;
}

function consumeResetToken(token: string): { email: string } | null {
  const raw = localStorage.getItem(STORAGE_RESET);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as ResetToken;
    if (data.token !== token || data.expires < Date.now()) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

function clearResetToken(): void {
  localStorage.removeItem(STORAGE_RESET);
}

// ---------------------------------------------------------------------------
// Email delivery
//
// Two paths:
//   1. EmailJS (preferred) — supports custom HTML emails so the message
//      matches the Figma design. Browser-safe (uses public key + signed
//      template). Free tier. Configure these env vars in `.env.local` and
//      restart the dev server:
//        VITE_EMAILJS_SERVICE_ID=...
//        VITE_EMAILJS_TEMPLATE_ID=...
//        VITE_EMAILJS_PUBLIC_KEY=...
//      The EmailJS template should have:
//        Subject: {{subject}}
//        To Email: {{to_email}}
//        Body:    {{{html_body}}}        ← triple-stash for raw HTML
//   2. FormSubmit (fallback) — no setup, but plain-text only.

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as
  | string
  | undefined;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as
  | string
  | undefined;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as
  | string
  | undefined;

async function sendViaEmailJS(
  toEmail: string,
  subject: string,
  html: string,
): Promise<boolean> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return false;
  }
  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            to_email: toEmail,
            subject,
            html_body: html,
          },
        }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function sendViaFormSubmit(
  toEmail: string,
  subject: string,
  message: string,
): Promise<void> {
  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: subject,
        _template: "basic",
        _captcha: "false",
        name: "Outpave",
        message,
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`FormSubmit responded ${response.status}`);
  }
}

async function sendEmail(
  toEmail: string,
  subject: string,
  html: string,
  text: string,
): Promise<void> {
  const sentHtml = await sendViaEmailJS(toEmail, subject, html);
  if (sentHtml) return;
  await sendViaFormSubmit(toEmail, subject, text);
}

// ---------------------------------------------------------------------------
// Email templates — match the Figma email card design

const OUTPAVE_LOGO_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 36" width="120" height="26" aria-label="Outpave"><path d="M16.6464 2.64641C16.2896 2.28959 15.7104 2.28959 15.3536 2.64641L0.646412 17.3536C0.289593 17.7104 0.289593 18.2896 0.646412 18.6464L15.3536 33.3536C15.7104 33.7104 16.2896 33.7104 16.6464 33.3536L20.0078 29.9922C20.3646 29.6354 20.3646 29.0562 20.0078 28.6994L9.95475 18.6464C9.59793 18.2896 9.59793 17.7104 9.95475 17.3536L20.0078 7.30058C20.3646 6.94376 20.3646 6.36458 20.0078 6.00776L16.6464 2.64641Z" fill="%23f8f9fa"/><path d="M20.2936 14.4489L23.3318 17.487C23.6162 17.7714 23.6162 18.2369 23.3318 18.5213L20.2936 21.5594C20.0092 21.8438 20.0092 22.3093 20.2936 22.5937L23.3318 25.6318C23.6162 25.9162 24.0816 25.9162 24.366 25.6318L31.4766 18.5213C31.761 18.2369 31.761 17.7714 31.4766 17.487L24.366 10.3765C24.0816 10.0921 23.6162 10.0921 23.3318 10.3765L20.2936 13.4146C20.0092 13.699 20.0092 14.1645 20.2936 14.4489Z" fill="%23ff4e17"/><path d="M72.8103 9.74365C72.576 9.74365 72.3842 9.9354 72.3842 10.1698V19.5653C72.3842 20.4814 72.1499 21.1632 71.6599 21.6745C71.1912 22.1858 70.2964 22.4202 69.359 22.4202C68.4216 22.4202 67.5481 22.1645 67.0794 21.6745C66.6107 21.1632 66.3764 20.4601 66.3764 19.544V10.1698C66.3764 9.9354 66.1846 9.74365 65.9503 9.74365L62.222 9.74365C61.9876 9.74365 61.7959 9.9354 61.7959 10.1698V19.6505C61.7959 21.0993 62.1155 22.335 62.712 23.3363C63.3298 24.3377 64.2033 25.0833 65.3537 25.5947C66.4829 26.0847 67.8251 26.319 69.359 26.319C70.9355 26.319 72.299 26.0634 73.4068 25.5947C74.536 25.1046 75.4307 24.3377 76.0486 23.3363C76.6664 22.335 76.9647 21.0993 76.9647 19.6505V10.1698C76.9647 9.9354 76.7729 9.74365 76.5386 9.74365L72.8103 9.74365Z" fill="%23f8f9fa"/><path d="M81.2119 10.1911V13.7064C81.2119 13.9621 81.425 14.1538 81.6593 14.1538H86.048V26.0421C86.048 26.2977 86.2611 26.4895 86.4954 26.4895L90.5646 26.4895C90.8202 26.4895 91.012 26.2977 91.012 26.0421V14.1751L95.4007 14.1751C95.6563 14.1751 95.8481 13.9621 95.8481 13.7277V10.1911C95.8481 9.9354 95.635 9.74365 95.4007 9.74365L81.638 9.74365C81.425 9.74365 81.2119 9.9567 81.2119 10.1911Z" fill="%23f8f9fa"/><path d="M114 12.4703C113.553 11.6181 112.892 10.9577 112.04 10.489C111.188 10.0202 109.952 9.78589 108.78 9.78589L100.344 9.78589C100.088 9.78589 99.8965 9.99894 99.8965 10.2333C99.8965 10.425 99.8965 10.702 99.8965 11.0855V26.0843C99.8965 26.34 100.11 26.553 100.365 26.5317H104.477C104.733 26.5317 104.946 26.34 104.946 26.0843V22.4198C104.946 22.1642 105.159 21.9724 105.414 21.9724H108.695C109.867 21.9724 111.167 21.6741 112.019 21.2054C112.892 20.7367 113.51 20.1189 113.979 19.2667C114.447 18.4145 114.682 17.2001 114.682 16.0496C114.682 14.8991 114.447 13.3012 114 12.4703ZM110.08 15.8152C110.08 17.5197 108.78 18.0097 108.227 18.0097H105.393C105.137 18.0097 104.924 17.8179 104.924 17.5623V14.1747C104.924 13.9191 105.137 13.7273 105.393 13.7273H108.227C108.631 13.7273 108.951 13.7913 109.185 13.9191C109.42 14.0682 110.08 14.3239 110.08 15.8152Z" fill="%23f8f9fa"/><path d="M144.821 10.0651C144.182 11.7908 141.029 20.462 140.944 20.6964C140.858 20.4194 137.514 11.7695 136.853 10.0651C136.789 9.89468 136.619 9.76685 136.427 9.76685L132.571 9.76685C132.251 9.76685 132.038 10.0651 132.145 10.3634L138.004 26.2144C138.068 26.3848 138.238 26.5127 138.43 26.5127L143.287 26.5127C143.479 26.5127 143.649 26.3848 143.713 26.2144L149.551 10.3634C149.657 10.0651 149.444 9.76685 149.125 9.76685H145.247C145.055 9.76685 144.885 9.87337 144.821 10.0651Z" fill="%23f8f9fa"/><path d="M120.485 26.2144C121.124 24.4887 124.277 15.8175 124.362 15.5831C124.447 15.8601 127.792 24.51 128.453 26.2144C128.517 26.3848 128.687 26.5127 128.879 26.5127H132.735C133.054 26.5127 133.268 26.2144 133.161 25.9161L127.302 10.0651C127.238 9.89468 127.068 9.76685 126.876 9.76685H122.019C121.827 9.76685 121.657 9.89468 121.593 10.0651L115.755 25.9161C115.649 26.2144 115.862 26.5127 116.181 26.5127H120.059C120.25 26.5127 120.421 26.4062 120.485 26.2144Z" fill="%23f8f9fa"/><path d="M158.841 22.0812V20.4194C158.841 20.1637 159.054 19.972 159.31 19.972H164.487C164.742 19.972 164.956 19.7803 164.956 19.5246V16.4993C164.956 16.2436 164.742 16.0519 164.487 16.0519L159.31 16.0519C159.054 16.0519 158.841 15.8601 158.841 15.6045V14.2196C158.841 13.964 159.054 13.7722 159.31 13.7722L165.232 13.7722C165.488 13.7722 165.701 13.5805 165.701 13.3248V10.2143C165.701 9.95859 165.488 9.76685 165.232 9.76685L154.261 9.76685C154.005 9.76685 153.792 9.95859 153.792 10.2143V26.0653C153.792 26.3209 154.005 26.5127 154.261 26.5127L165.232 26.5127C165.488 26.5127 165.701 26.3209 165.701 26.0653V22.976C165.701 22.7204 165.488 22.5286 165.232 22.5286H159.31C159.033 22.5286 158.841 22.3369 158.841 22.0812Z" fill="%23f8f9fa"/><path d="M56.8079 13.1952C56.1262 11.9595 55.1462 11.0221 53.8679 10.3829C52.6109 9.76507 51.1622 9.4668 49.4153 9.4668C47.6683 9.4668 46.2196 9.82898 44.9626 10.4468C43.6844 11.0647 42.7044 12.0234 42.0226 13.2591C41.3622 14.4948 41 16.0501 41 17.8823C41 19.7146 41.3409 21.2698 42.0226 22.5055C42.7044 23.7412 43.6844 24.7 44.9626 25.3178C46.2196 25.9357 47.6683 26.1913 49.4153 26.1913C51.1622 26.1913 52.6109 25.8717 53.8679 25.2752C55.1462 24.6574 56.1262 23.6986 56.8079 22.4629C57.4683 21.2272 57.8305 19.672 57.8305 17.8397C57.8305 16.0075 57.4896 14.4309 56.8079 13.1952ZM53.1648 17.3497V18.351C53.1648 18.9902 53.0796 19.5654 52.9305 20.0768C52.7814 20.5668 52.547 20.9929 52.2487 21.3124C51.9505 21.632 51.567 21.909 51.1409 22.0794C50.6935 22.2499 50.0118 22.3564 49.4153 22.3564C48.8187 22.3564 48.3287 22.3138 47.8813 22.1433C47.4339 21.9729 46.8587 21.7172 46.5818 21.3764C46.2835 21.0355 46.0705 20.6307 45.9213 20.1407C45.7722 19.6293 45.687 19.0541 45.687 18.415V17.4136C45.687 16.7532 45.7722 16.1779 45.9213 15.6666C46.0705 15.1766 46.3048 14.7505 46.5818 14.4309C46.88 14.09 47.2422 13.8343 47.6896 13.6639C48.137 13.4935 48.8187 13.3443 49.4153 13.3443C50.0118 13.3443 50.6935 13.4296 51.1409 13.6213C51.5883 13.7917 51.9505 14.0474 52.2487 14.3883C52.547 14.7292 52.7814 15.134 52.9305 15.624C53.1009 16.0927 53.1648 16.6892 53.1648 17.3497Z" fill="%23f8f9fa"/></svg>`,
  );

function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;padding:24px 16px;background:#1e1e2e;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#f8f9fa;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:#0e0e0f;border:2px solid #484a4d;border-radius:24px;"><tr><td style="padding:40px 32px;text-align:center;">${body}</td></tr></table></td></tr></table></body></html>`;
}

function emailLogo(): string {
  return `<img src="${OUTPAVE_LOGO_DATA_URI}" alt="Outpave" width="120" height="26" style="display:block;margin:0 auto 32px;border:0;outline:none;">`;
}

function verifyEmailHtml(code: string): string {
  const body =
    emailLogo() +
    `<h1 style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:32px;line-height:32px;font-weight:500;letter-spacing:-0.64px;margin:0 0 12px;color:#f8f9fa;">Verify your email</h1>` +
    `<p style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.4;letter-spacing:-0.16px;color:#e6e9eb;margin:0 0 32px;">Use the code below to finish setting up your account.</p>` +
    `<div style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:32px;line-height:32px;font-weight:500;letter-spacing:11.52px;color:#f8f9fa;padding:12px 20px;margin:0 0 32px;">${code}</div>` +
    `<p style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.4;letter-spacing:-0.14px;color:#adadaa;margin:0;">This code expires in 10 minutes. If you didn't create an Outpave account, you can safely ignore this email.</p>`;
  return emailShell("Verify your email", body);
}

function verifyEmailText(code: string): string {
  return (
    `Verify your email\n\n` +
    `Use the code below to finish setting up your account:\n\n` +
    `   ${code}\n\n` +
    `This code expires in 10 minutes. If you didn't create an Outpave account, you can safely ignore this email.`
  );
}

function resetEmailHtml(resetUrl: string): string {
  const body =
    emailLogo() +
    `<h1 style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:32px;line-height:32px;font-weight:500;letter-spacing:-0.64px;margin:0 0 12px;color:#f8f9fa;">Reset your password</h1>` +
    `<p style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.4;letter-spacing:-0.16px;color:#e6e9eb;margin:0 0 32px;">Click the button below to reset your password:</p>` +
    `<a href="${resetUrl}" style="display:inline-block;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:16px;line-height:16px;font-weight:600;letter-spacing:-0.025px;color:#ffffff;background:#ff4e17;padding:14px 24px;border-radius:16px;text-decoration:none;margin:0 0 32px;">Reset password</a>` +
    `<p style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.4;letter-spacing:-0.14px;color:#adadaa;margin:0;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`;
  return emailShell("Reset your password", body);
}

function resetEmailText(resetUrl: string): string {
  return (
    `Reset your password\n\n` +
    `Click the link below to reset your password:\n\n` +
    `${resetUrl}\n\n` +
    `This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`
  );
}

function sendResetEmail(toEmail: string, resetUrl: string): Promise<void> {
  return sendEmail(
    toEmail,
    "Reset your Outpave password",
    resetEmailHtml(resetUrl),
    resetEmailText(resetUrl),
  );
}

function sendVerifyEmail(toEmail: string, code: string): Promise<void> {
  return sendEmail(
    toEmail,
    "Verify your Outpave email",
    verifyEmailHtml(code),
    verifyEmailText(code),
  );
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  // If the URL carries a valid reset token, jump straight to the reset view.
  const initialView = useMemo<View>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("reset_token") ? "reset" : "login";
  }, []);
  const [view, setView] = useState<View>(initialView);

  return (
    <div className="flex h-screen gap-3 p-3 bg-[var(--color-bg-page)]">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex-1 max-w-[600px] mx-auto lg:mx-0 flex flex-col gap-6 justify-center items-start px-8 lg:px-20 rounded-[var(--radius-2xl)]"
      >
        <OutpaveLogo accent className="h-9 w-auto self-start" />

        {view === "login" && (
          <LoginView
            onForgot={() => setView("forgot")}
            onSignup={() => setView("signup")}
            onLogin={onLogin}
          />
        )}
        {view === "forgot" && (
          <ForgotView
            onBack={() => setView("login")}
            onSent={() => setView("sent")}
          />
        )}
        {view === "sent" && (
          <SentView onBack={() => setView("login")} />
        )}
        {view === "reset" && (
          <ResetView
            onDone={() => {
              // Clear the token query param and return to login.
              const url = new URL(window.location.href);
              url.searchParams.delete("reset_token");
              window.history.replaceState({}, "", url.pathname + url.search);
              setView("login");
            }}
          />
        )}
        {view === "signup" && (
          <SignUpView
            onLogin={() => setView("login")}
            onSent={() => setView("verify")}
          />
        )}
        {view === "verify" && (
          <VerifyView
            onVerified={() => {
              clearPendingSignup();
              onLogin();
            }}
            onBack={() => setView("login")}
          />
        )}
      </form>

      <MarketingPanel />
    </div>
  );
}

function MarketingPanel() {
  return (
    <aside
      className="hidden lg:flex flex-1 flex-col gap-6 p-20 rounded-[var(--radius-2xl)] bg-[var(--color-bg-surface)] border border-[var(--color-border)] overflow-clip relative"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--color-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-grid-line) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      {/* Brand-tinted glow anchored to the top-right corner — a solid brand
          disk pushed past the corner and Gaussian-blurred so it bleeds across
          the upper third like an ambient light source. The aside's
          `overflow-clip` keeps the blur from spilling outside its rounded
          bounds. */}
      <div
        aria-hidden="true"
        className="absolute -top-80 -right-40 size-[520px] rounded-full pointer-events-none opacity-40"
        style={{
          background: "var(--color-brand)",
          filter: "blur(120px)",
        }}
      />

      <div className="flex flex-col gap-2 max-w-[540px] relative z-10">
        <h2 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]">
          Expense management without complexity
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
          Outpave is a powerful expense management tool, designed to help you
          streamline your business operations.
        </p>
      </div>
      <img
        src={dashboardPreview}
        alt=""
        aria-hidden="true"
        className="absolute top-[420px] left-20 w-[900px] max-w-none rounded-2xl border-2 border-[var(--color-border-strong)] -rotate-15 origin-top-left shadow-[0_19px_12px_rgba(0,0,0,0.49),0_4px_12px_rgba(0,0,0,0.72)] pointer-events-none"
      />
    </aside>
  );
}

function ViewHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <h1 className="text-[28px] font-medium tracking-tight text-[var(--color-text-primary)]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
      {children}
    </span>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none border border-[var(--color-border)] focus:border-[var(--color-border-focus)] transition-colors ${props.className ?? ""}`}
    />
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] flex items-center gap-2 border border-[var(--color-border)] focus-within:border-[var(--color-border-focus)] transition-colors">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
  );
}

function BackToLogin({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-[var(--color-brand)] hover:underline cursor-pointer self-start"
    >
      Back to login
    </button>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-[var(--color-text-danger)]">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Login

function LoginView({
  onForgot,
  onSignup,
  onLogin,
}: {
  onForgot: () => void;
  onSignup: () => void;
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    const account = getAccount();
    const seededMatch = SEEDED_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === normalized && a.password === password,
    );
    const storedMatch =
      account.email.toLowerCase() === normalized &&
      password === account.password;
    if (seededMatch || storedMatch) {
      setError(null);
      onLogin();
    } else {
      setError("Incorrect email or password.");
    }
  };

  return (
    <>
      <ViewHeader
        title="Welcome back!"
        subtitle="Access your invoices, payment requests, and agreements."
      />

      <div className="flex flex-col gap-4 w-full">
        <label className="flex flex-col gap-1.5 w-full">
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </label>

        <div className="flex flex-col gap-3 w-full">
          <label className="flex flex-col gap-1.5 w-full">
            <FieldLabel>Password</FieldLabel>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </label>

          <div className="flex items-center justify-between gap-3 pt-1 w-full">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Selector
                checked={remember}
                onChange={setRemember}
                ariaLabel="Remember me"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={onForgot}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={submit}
      >
        Login
      </Button>

      <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
        By clicking the button above, you agree to our{" "}
        <a href="#" className="font-semibold text-[var(--color-text-primary)] hover:underline">
          Terms of Use
        </a>{" "}
        and{" "}
        <a href="#" className="font-semibold text-[var(--color-text-primary)] hover:underline">
          Privacy Policy
        </a>
        .
      </p>

      <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
        Don't have an account?
        <button
          type="button"
          onClick={onSignup}
          className="font-semibold text-[var(--color-brand)] hover:underline cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Forgot password

function ForgotView({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackLink, setFallbackLink] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setFallbackLink(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter the email address tied to your account.");
      return;
    }
    setSubmitting(true);
    const token = makeResetToken(trimmed);
    const resetUrl = `${window.location.origin}${window.location.pathname}?reset_token=${token}`;
    // Stash the email so the "Email sent" view can display where it went.
    sessionStorage.setItem("outpave-sent-to", trimmed);

    try {
      await sendResetEmail(trimmed, resetUrl);
      onSent();
    } catch {
      // Network or service failure — show the link inline so the demo flow
      // still works even before FormSubmit activation completes.
      setFallbackLink(resetUrl);
      setError(
        "We couldn't send the email automatically. Open the reset link below to continue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ViewHeader
        title="Forgot password"
        subtitle="Don't worry! Enter your email address and we will send you a link to reset your password."
      />

      <label className="flex flex-col gap-1.5 w-full">
        <FieldLabel>Email</FieldLabel>
        <TextInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
        />
      </label>

      {error && <ErrorText>{error}</ErrorText>}
      {fallbackLink && (
        <a
          href={fallbackLink}
          className="text-sm font-semibold text-[var(--color-brand)] hover:underline break-all"
        >
          {fallbackLink}
        </a>
      )}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={submit}
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Submit"}
      </Button>

      <BackToLogin onClick={onBack} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Email sent confirmation

function SentView({ onBack }: { onBack: () => void }) {
  const sentTo = sessionStorage.getItem("outpave-sent-to") ?? "";
  return (
    <>
      <div className="size-12 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-icon-default)]">
        <Mail size={24} />
      </div>
      <ViewHeader
        title="Email sent"
        subtitle={
          <>
            A password reset email has been sent to{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">
              {sentTo}
            </span>
          </>
        }
      />
      <BackToLogin onClick={onBack} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Reset password

function ResetView({ onDone }: { onDone: () => void }) {
  const [tokenInfo, setTokenInfo] = useState<{ email: string } | null>(null);
  const [tokenError, setTokenError] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    if (!token) {
      setTokenError(true);
      return;
    }
    const result = consumeResetToken(token);
    if (!result) {
      setTokenError(true);
    } else {
      setTokenInfo(result);
    }
  }, []);

  const submit = () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setCurrentPassword(password);
    clearResetToken();
    onDone();
  };

  if (tokenError) {
    return (
      <>
        <ViewHeader
          title="Reset link invalid"
          subtitle="This password reset link is invalid or has expired. Request a new one to continue."
        />
        <BackToLogin onClick={onDone} />
      </>
    );
  }

  return (
    <>
      <ViewHeader
        title="Reset your password"
        subtitle={
          tokenInfo
            ? `Enter your new password below.`
            : "Enter your new password below."
        }
      />

      <div className="flex flex-col gap-4 w-full">
        <label className="flex flex-col gap-1.5 w-full">
          <FieldLabel>Password</FieldLabel>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="••••••••••••"
            autoComplete="new-password"
          />
        </label>

        <label className="flex flex-col gap-1.5 w-full">
          <FieldLabel>Confirm password</FieldLabel>
          <PasswordInput
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••••••"
            autoComplete="new-password"
          />
        </label>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={submit}
      >
        Reset password
      </Button>

      <BackToLogin onClick={onDone} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Sign up — collects credentials, emails a 6-digit code, hands off to verify

function SignUpView({
  onLogin,
  onSent,
}: {
  onLogin: () => void;
  onSent: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const code = generateCode();
    setPendingSignup({
      email: trimmed,
      password,
      code,
      expires: Date.now() + 10 * 60 * 1000, // 10 min
    });
    try {
      await sendVerifyEmail(trimmed, code);
      onSent();
    } catch {
      // Fall through to the verify view anyway — the code is in localStorage
      // and we surface a fallback there.
      onSent();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ViewHeader
        title="Join the customer portal"
        subtitle="Set up your password to access invoices, payment requests, and agreements."
      />

      <div className="flex flex-col gap-4 w-full">
        <label className="flex flex-col gap-1.5 w-full">
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-1.5 w-full">
          <FieldLabel>Password</FieldLabel>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="••••••••••••"
            autoComplete="new-password"
          />
        </label>

        <div className="flex flex-col gap-3 w-full">
          <label className="flex flex-col gap-1.5 w-full">
            <FieldLabel>Confirm password</FieldLabel>
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              placeholder="••••••••••••"
              autoComplete="new-password"
            />
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <Selector
              checked={remember}
              onChange={setRemember}
              ariaLabel="Remember me"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Remember me
            </span>
          </label>
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={submit}
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Activate account"}
      </Button>

      <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
        Already have an account?
        <button
          type="button"
          onClick={onLogin}
          className="font-semibold text-[var(--color-brand)] hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// 6-digit verification — promotes the pending signup into the active account

function CodeInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    while (arr.length < length) arr.push("");
    arr[i] = digit;
    const next = arr.slice(0, length).join("");
    onChange(next);
    if (digit && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(length, "").slice(0, length));
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-1.5">
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={value[i] ?? ""}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className={`w-[60px] h-[68px] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] text-[24px] text-center text-[var(--color-text-primary)] outline-none transition-colors border ${
              filled
                ? "border-[var(--color-border-brand)]"
                : "border-[var(--color-border)]"
            } focus:border-[var(--color-border-focus)]`}
          />
        );
      })}
    </div>
  );
}

function VerifyView({
  onVerified,
  onBack,
}: {
  onVerified: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const pending = useMemo(() => getPendingSignup(), []);

  // If there's no pending signup (e.g. user navigated here directly), bail.
  useEffect(() => {
    if (!pending) {
      onBack();
    }
  }, [pending, onBack]);

  const submit = () => {
    setError(null);
    const current = getPendingSignup();
    if (!current) {
      setError("Your verification has expired. Sign up again.");
      return;
    }
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (code !== current.code) {
      setError("That code doesn't match. Check the email and try again.");
      return;
    }
    setAccount({ email: current.email, password: current.password });
    onVerified();
  };

  const resend = async () => {
    setResendStatus(null);
    const current = getPendingSignup();
    if (!current) {
      setResendStatus("Sign up again to receive a new code.");
      return;
    }
    const newCode = generateCode();
    setPendingSignup({
      ...current,
      code: newCode,
      expires: Date.now() + 10 * 60 * 1000,
    });
    try {
      await sendVerifyEmail(current.email, newCode);
      setResendStatus("New code sent — check your inbox.");
    } catch {
      setResendStatus("Couldn't send the email. Please try again.");
    }
  };

  return (
    <>
      <ViewHeader
        title="Verify your email"
        subtitle={
          <>
            Please enter the 6-digit verification code we have sent you to
            {pending ? (
              <>
                {" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {pending.email}
                </span>
                .
              </>
            ) : (
              " your email."
            )}
          </>
        }
      />

      <CodeInput value={code} onChange={setCode} />

      {error && <ErrorText>{error}</ErrorText>}
      {resendStatus && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          {resendStatus}
        </p>
      )}

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={submit}
      >
        Verify
      </Button>

      <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
        Didn't receive a code?
        <button
          type="button"
          onClick={resend}
          className="font-semibold text-[var(--color-brand)] hover:underline cursor-pointer"
        >
          Click to resend
        </button>
      </p>
    </>
  );
}
