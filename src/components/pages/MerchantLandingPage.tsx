import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Clock,
  Mail,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import BrandLogo from "../shared/BrandLogo";
import { useTheme } from "../../ThemeContext";

interface MerchantLandingPageProps {
  onBack: () => void;
  onSelectPath: (path: "solo" | "business") => void;
}

interface PathOption {
  id: "solo" | "business";
  icon: LucideIcon;
  title: string;
  blurb: string;
  pill: string;
  time: string;
  needs: string[];
}

const PATHS: PathOption[] = [
  {
    id: "solo",
    icon: User,
    title: "Just me",
    blurb: "I'm a freelancer or sole proprietor.",
    pill: "No EIN needed",
    time: "About 3 minutes",
    needs: ["Your legal name", "SSN + date of birth", "Bank account"],
  },
  {
    id: "business",
    icon: Building2,
    title: "Registered business",
    blurb: "LLC, Corporation, partnership, or nonprofit.",
    pill: "We'll need your EIN",
    time: "About 5 minutes",
    needs: ["Business legal name + EIN", "Owner SSN + date of birth", "Bank account"],
  },
];

const VALUE_PROPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Banknote,
    title: "Same-day payouts",
    body: "Funds hit your bank the day a customer pays — no 3-day hold.",
  },
  {
    icon: Mail,
    title: "Email & SMS invoices",
    body: "Send a payment link by email or text. Customers pay with one tap.",
  },
  {
    icon: ShieldCheck,
    title: "No monthly fee",
    body: "Pay only when you get paid. Free to start, no contracts.",
  },
];

export default function MerchantLandingPage({
  onBack,
  onSelectPath,
}: MerchantLandingPageProps) {
  // The "Send your own invoices on Outpave" landing is always shown in the
  // Outpave brand chrome regardless of which white-label tenant the user
  // came from — this page is selling Outpave specifically. Restored on
  // unmount so going back returns the user to whatever brand they had set.
  const { brand, setBrand } = useTheme();
  useEffect(() => {
    const previous = brand;
    setBrand("outpave");
    return () => setBrand(previous);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      {/* Top bar — logo + escape hatch */}
      <header className="shrink-0 flex items-center justify-between px-6 md:px-10 py-5">
        <BrandLogo className="h-8 w-auto" />
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to portal
        </button>
      </header>

      <main className="flex-1 flex justify-center px-6 md:px-10 pb-16">
        <div className="w-full max-w-[1040px] flex flex-col gap-12 pt-6 md:pt-12">
          {/* Hero */}
          <section className="flex flex-col items-center text-center gap-4 max-w-[680px] mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-[var(--color-brand-8)] border border-[var(--color-border-brand)] text-[13px] font-medium text-[var(--color-brand)]">
              Free to start
            </span>
            <h1 className="text-[40px] md:text-[52px] font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.05]">
              Send your own invoices on Outpave
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] leading-snug max-w-[560px]">
              Get paid faster with same-day payouts, email & SMS invoices, and
              no monthly fee. Most folks finish setup in under five minutes.
            </p>
          </section>

          {/* Fork — Just me / Registered business */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-medium text-[var(--color-text-tertiary)] tracking-tight text-center uppercase">
              How are you set up?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PATHS.map((path) => (
                <PathCard
                  key={path.id}
                  path={path}
                  onClick={() => onSelectPath(path.id)}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] text-center">
              Not sure?{" "}
              <span className="text-[var(--color-text-secondary)]">
                If you've never filed paperwork to register a company, choose
                "Just me."
              </span>
            </p>
          </section>

          {/* Value props */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALUE_PROPS.map((vp) => (
              <ValueProp key={vp.title} {...vp} />
            ))}
          </section>

          {/* Trust footer */}
          <footer className="text-center text-[13px] text-[var(--color-text-tertiary)] leading-snug max-w-[560px] mx-auto">
            Outpave partners with Highnote Payments Company for money
            transmission services and account services with funds held at Fifth
            Third Bank N.A., Member FDIC.
          </footer>
        </div>
      </main>
    </div>
  );
}

function PathCard({
  path,
  onClick,
}: {
  path: PathOption;
  onClick: () => void;
}) {
  const Icon = path.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left flex flex-col gap-5 p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-12 rounded-2xl bg-[var(--color-brand-8)] border border-[var(--color-border-brand)] text-[var(--color-brand)] flex items-center justify-center shrink-0">
          <Icon size={22} />
        </div>
        <span className="inline-flex items-center px-2.5 h-6 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] shrink-0">
          {path.pill}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none">
          {path.title}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
          {path.blurb}
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] font-medium uppercase tracking-tight">
          <Clock size={12} />
          {path.time} · You'll need
        </div>
        <ul className="flex flex-col gap-1.5">
          {path.needs.map((n) => (
            <li
              key={n}
              className="text-sm text-[var(--color-text-secondary)] leading-snug flex items-start gap-2"
            >
              <span className="mt-2 size-1 rounded-full bg-[var(--color-text-tertiary)] shrink-0" />
              {n}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <span className="text-sm font-semibold text-[var(--color-brand)]">
          Continue
        </span>
        <ArrowRight
          size={16}
          className="text-[var(--color-brand)] transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </button>
  );
}

function ValueProp({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
      <div className="size-9 rounded-xl bg-[var(--color-bg-elevated)] text-[var(--color-icon-default)] flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <h4 className="text-base font-medium text-[var(--color-text-primary)] tracking-tight">
        {title}
      </h4>
      <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
        {body}
      </p>
    </div>
  );
}
