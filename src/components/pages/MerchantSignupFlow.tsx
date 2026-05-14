import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Check, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import BrandLogo from "../shared/BrandLogo";
import Button from "../shared/Button";
import Selector from "../shared/Selector";
import {
  BUSINESS_TYPES,
  DateField,
  LabeledField,
  PhoneField,
  SelectField,
  TextAreaField,
  TextField,
  US_STATES,
} from "../shared/Field";
import { useTheme } from "../../ThemeContext";

/**
 * Multi-step merchant onboarding wizard. Branches on the entity type
 * selected on the landing page:
 *
 *   solo path    → authorization → review → submitted
 *   business path → business info → authorization → owners list → review → submitted
 *
 * State for every step lives at this top level so that going back & forth
 * preserves user input. Validation is intentionally light — primary buttons
 * advance the step regardless of whether all fields are filled (this is a
 * prototype, not a production KYB flow).
 */

interface MerchantSignupFlowProps {
  path: "solo" | "business";
  onExit: () => void;
}

type Step =
  | "business-info"
  | "authorization"
  | "owners-list"
  | "owner-form"
  | "review"
  | "submitted";

interface BusinessInfo {
  legalName: string;
  dba: string;
  businessType: string;
  ein: string;
  description: string;
  website: string;
  phone: string;
  stateOfIncorporation: string;
  locationName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

interface PersonInfo {
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  dateOfBirth: string;
  taxIdType: string;
  taxIdNumber: string;
  issuingCountry: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  ownsCompanyShare: boolean;
  authorizedSigner: boolean;
}

const EMPTY_BUSINESS: BusinessInfo = {
  legalName: "",
  dba: "",
  businessType: "",
  ein: "",
  description: "",
  website: "",
  phone: "",
  stateOfIncorporation: "",
  locationName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

const EMPTY_PERSON: PersonInfo = {
  firstName: "",
  lastName: "",
  title: "",
  phone: "",
  dateOfBirth: "",
  taxIdType: "",
  taxIdNumber: "",
  issuingCountry: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  ownsCompanyShare: false,
  authorizedSigner: false,
};

const TITLES: { value: string; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "ceo", label: "CEO" },
  { value: "cfo", label: "CFO" },
  { value: "coo", label: "COO" },
  { value: "president", label: "President" },
  { value: "vp", label: "Vice President" },
  { value: "manager", label: "Manager" },
  { value: "founder", label: "Founder" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

const TAX_ID_TYPES: { value: string; label: string }[] = [
  { value: "ssn", label: "Social Security Number (SSN)" },
  { value: "itin", label: "Individual Taxpayer ID (ITIN)" },
];

const COUNTRIES: { value: string; label: string }[] = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" },
];

export default function MerchantSignupFlow({
  path,
  onExit,
}: MerchantSignupFlowProps) {
  // Onboarding is always shown in the Outpave brand chrome since this flow
  // is selling Outpave specifically — same pattern as the merchant landing
  // page. Restored on unmount.
  const { brand, setBrand } = useTheme();
  useEffect(() => {
    const previous = brand;
    setBrand("outpave");
    return () => setBrand(previous);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialStep: Step = path === "solo" ? "authorization" : "business-info";
  const [step, setStep] = useState<Step>(initialStep);
  const [business, setBusiness] = useState<BusinessInfo>(EMPTY_BUSINESS);
  const [primary, setPrimary] = useState<PersonInfo>(EMPTY_PERSON);
  const [otherOwners, setOtherOwners] = useState<PersonInfo[]>([]);
  const [editingOwnerIndex, setEditingOwnerIndex] = useState<number | null>(null);
  const [draftOwner, setDraftOwner] = useState<PersonInfo>(EMPTY_PERSON);

  // Step ordering by path — drives the Next/Previous navigation.
  const order: Step[] = useMemo(
    () =>
      path === "solo"
        ? ["authorization", "review", "submitted"]
        : ["business-info", "authorization", "owners-list", "review", "submitted"],
    [path],
  );

  const goNext = () => {
    const idx = order.indexOf(step);
    if (idx >= 0 && idx < order.length - 1) setStep(order[idx + 1]);
  };
  const goPrev = () => {
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  const startAddingOwner = () => {
    setDraftOwner(EMPTY_PERSON);
    setEditingOwnerIndex(null);
    setStep("owner-form");
  };
  const startEditingOwner = (index: number) => {
    setDraftOwner(otherOwners[index]);
    setEditingOwnerIndex(index);
    setStep("owner-form");
  };
  const saveOwner = () => {
    setOtherOwners((prev) => {
      if (editingOwnerIndex === null) return [...prev, draftOwner];
      const copy = [...prev];
      copy[editingOwnerIndex] = draftOwner;
      return copy;
    });
    setStep("owners-list");
  };
  const removeOwner = (index: number) =>
    setOtherOwners((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      <header className="shrink-0 flex items-center justify-between px-6 md:px-10 py-5 max-w-[840px] w-full mx-auto">
        <BrandLogo className="h-8 w-auto" />
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to portal
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 md:px-10 pb-16 gap-4">
        <Stepper path={path} step={step} />
        <div className="w-full max-w-[600px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-6">
          {step === "business-info" && (
            <BusinessInfoStep
              info={business}
              onChange={setBusiness}
              onNext={goNext}
              onExit={onExit}
            />
          )}

          {step === "authorization" && (
            <AuthorizationStep
              showOwnershipCheck={path === "business"}
              info={primary}
              onChange={setPrimary}
              onPrev={path === "business" ? goPrev : onExit}
              onPrevLabel={path === "business" ? "Previous" : "Back to portal"}
              onNext={goNext}
            />
          )}

          {step === "owners-list" && (
            <OwnersListStep
              primary={primary}
              owners={otherOwners}
              onAdd={startAddingOwner}
              onEdit={startEditingOwner}
              onRemove={removeOwner}
              onPrev={goPrev}
              onNext={goNext}
            />
          )}

          {step === "owner-form" && (
            <OwnerFormStep
              info={draftOwner}
              onChange={setDraftOwner}
              isEditing={editingOwnerIndex !== null}
              onCancel={() => setStep("owners-list")}
              onSave={saveOwner}
            />
          )}

          {step === "review" && (
            <ReviewStep
              path={path}
              business={business}
              primary={primary}
              owners={otherOwners}
              onPrev={() =>
                setStep(path === "business" ? "owners-list" : "authorization")
              }
              onSubmit={goNext}
              onEditBusiness={() => setStep("business-info")}
              onEditAuthorization={() => setStep("authorization")}
              onEditOwners={() => setStep("owners-list")}
            />
          )}

          {step === "submitted" && <SubmittedStep onExit={onExit} />}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step components                                                            */
/* -------------------------------------------------------------------------- */

interface StepperItem {
  /** Internal `Step` ids that count as "this stepper item" — when one is the
   *  current step, this item is the active dot. */
  matches: Step[];
  label: string;
}

function buildStepperItems(path: "solo" | "business"): StepperItem[] {
  const reviewItem: StepperItem = {
    matches: ["review", "submitted"],
    label: "Review & submit",
  };
  if (path === "solo") {
    return [
      { matches: ["authorization"], label: "Authorization" },
      reviewItem,
    ];
  }
  return [
    { matches: ["business-info"], label: "Business" },
    { matches: ["authorization"], label: "Authorization" },
    { matches: ["owners-list", "owner-form"], label: "Owners" },
    reviewItem,
  ];
}

/** Horizontal labeled stepper that sits above the modal card.
 *
 *  Three states per step (matches Figma 1189:53164):
 *   - complete:  filled brand dot with white check ✓ + label text-primary
 *   - active:    brand-20 fill + brand border (hollow-ish) + label text-tertiary
 *   - upcoming:  border-default outline + label text-tertiary
 *
 *  Connector between steps is brand-colored if the step BEFORE it is complete,
 *  otherwise border-default.
 */
function Stepper({ path, step }: { path: "solo" | "business"; step: Step }) {
  const items = buildStepperItems(path);
  if (step === "submitted") return null;
  const activeIndex = items.findIndex((it) => it.matches.includes(step));

  return (
    <div className="w-full max-w-[600px] flex items-center gap-2">
      {items.map((item, i) => {
        const state: "complete" | "active" | "upcoming" =
          i < activeIndex ? "complete" : i === activeIndex ? "active" : "upcoming";
        return (
          <Fragment key={item.label}>
            <div className="flex items-center gap-1 shrink-0">
              <StepDot state={state} />
              <span
                className={`text-xs font-medium ${
                  state === "complete"
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-tertiary)]"
                }`}
              >
                {item.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <span
                className={`flex-1 min-w-[8px] h-0.5 rounded-[1px] ${
                  state === "complete"
                    ? "bg-[var(--color-brand)]"
                    : "bg-[var(--color-border)]"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function StepDot({ state }: { state: "complete" | "active" | "upcoming" }) {
  if (state === "complete") {
    return (
      <span className="size-4 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-text-on-brand)]">
        <Check size={10} strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="size-4 rounded-full bg-[var(--color-brand-20)] border border-[var(--color-border-brand)]" />
    );
  }
  return (
    <span className="size-4 rounded-full border-[1.5px] border-[var(--color-border)]" />
  );
}

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[22px] font-medium tracking-tight text-[var(--color-text-primary)] leading-tight">
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

function StepFooter({
  primaryLabel = "Next",
  secondaryLabel = "Previous",
  onPrimary,
  onSecondary,
  primaryDisabled,
}: {
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 w-full pt-6">
      <Button
        variant="primary"
        className="w-full"
        onClick={onPrimary}
        disabled={primaryDisabled}
      >
        {primaryLabel}
      </Button>
      <Button variant="secondary" className="w-full" onClick={onSecondary}>
        {secondaryLabel}
      </Button>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {(title || subtitle) && (
        <div className="flex flex-col gap-2">
          {title && (
            <h2 className="text-[22px] font-medium tracking-tight text-[var(--color-text-primary)] leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function BusinessInfoStep({
  info,
  onChange,
  onNext,
  onExit,
}: {
  info: BusinessInfo;
  onChange: (next: BusinessInfo) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const set =
    <K extends keyof BusinessInfo>(key: K) =>
    (value: BusinessInfo[K]) =>
      onChange({ ...info, [key]: value });

  return (
    <>
      <StepHeader
        title="Business information"
        subtitle="To set up your Outpave account, we need some business details."
      />

      <Section>
        <LabeledField label="Business legal name" required>
          <TextField
            value={info.legalName}
            onChange={set("legalName")}
            placeholder="e.g. Clark Construction LLC"
            autoComplete="organization"
          />
        </LabeledField>
        <LabeledField label="Doing business as (DBA)">
          <TextField
            value={info.dba}
            onChange={set("dba")}
            placeholder="e.g. Clark Concrete"
          />
        </LabeledField>
        <LabeledField label="Business type" required>
          <SelectField
            value={info.businessType}
            onChange={set("businessType")}
            placeholder="Select"
            options={BUSINESS_TYPES}
          />
        </LabeledField>
        <LabeledField label="Business EIN" required>
          <TextField
            value={info.ein}
            onChange={set("ein")}
            placeholder="12-3456789"
            inputMode="numeric"
          />
        </LabeledField>
        <LabeledField label="Business description">
          <TextAreaField
            value={info.description}
            onChange={set("description")}
            placeholder="e.g. Concrete and paving contractor serving the greater Nashville area"
          />
        </LabeledField>
        <LabeledField label="Business website">
          <TextField
            value={info.website}
            onChange={set("website")}
            placeholder="https://clarkconcrete.com"
            type="url"
          />
        </LabeledField>
        <LabeledField label="Business phone number" required>
          <PhoneField
            value={info.phone}
            onChange={set("phone")}
            placeholder="(555) 123-4567"
          />
        </LabeledField>
        <LabeledField label="State of incorporation">
          <SelectField
            value={info.stateOfIncorporation}
            onChange={set("stateOfIncorporation")}
            placeholder="Select"
            options={US_STATES}
          />
        </LabeledField>
      </Section>

      <Section
        title="Business address"
        subtitle="This is the physical location of your business."
      >
        <LabeledField label="Location name" required>
          <TextField
            value={info.locationName}
            onChange={set("locationName")}
            placeholder="e.g. Headquarters"
          />
        </LabeledField>
        <LabeledField label="Address 1" required>
          <TextField
            value={info.address1}
            onChange={set("address1")}
            placeholder="123 Main St"
            autoComplete="address-line1"
          />
        </LabeledField>
        <LabeledField label="Address 2">
          <TextField
            value={info.address2}
            onChange={set("address2")}
            placeholder="Suite 100"
            autoComplete="address-line2"
          />
        </LabeledField>
        <LabeledField label="City" required>
          <TextField
            value={info.city}
            onChange={set("city")}
            placeholder="e.g. Nashville"
            autoComplete="address-level2"
          />
        </LabeledField>
        <div className="flex gap-4 w-full">
          <LabeledField label="State" required className="flex-1">
            <SelectField
              value={info.state}
              onChange={set("state")}
              placeholder="Select"
              options={US_STATES}
            />
          </LabeledField>
          <LabeledField label="ZIP" required className="flex-1">
            <TextField
              value={info.zip}
              onChange={set("zip")}
              placeholder="37201"
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </LabeledField>
        </div>
      </Section>

      <StepFooter onPrimary={onNext} onSecondary={onExit} secondaryLabel="Back to portal" />
    </>
  );
}

function AuthorizationStep({
  showOwnershipCheck,
  info,
  onChange,
  onPrev,
  onPrevLabel,
  onNext,
}: {
  showOwnershipCheck: boolean;
  info: PersonInfo;
  onChange: (next: PersonInfo) => void;
  onPrev: () => void;
  onPrevLabel: string;
  onNext: () => void;
}) {
  return (
    <>
      <StepHeader
        title="Authorization"
        subtitle="To set up an account you need to be authorized by your company. For security, your SSN is not saved upon refreshing the page."
      />
      <PersonForm info={info} onChange={onChange} />

      <div className="flex flex-col gap-2 pt-1 pl-1">
        {showOwnershipCheck && (
          <CheckboxRow
            checked={info.ownsCompanyShare}
            onChange={(v) => onChange({ ...info, ownsCompanyShare: v })}
            label="Yes, at least one individual owns 25% or more of the company"
          />
        )}
        <CheckboxRow
          checked={info.authorizedSigner}
          onChange={(v) => onChange({ ...info, authorizedSigner: v })}
          label="I am authorized to act on behalf of my business"
        />
      </div>

      <StepFooter
        onPrimary={onNext}
        onSecondary={onPrev}
        secondaryLabel={onPrevLabel}
        primaryDisabled={!info.authorizedSigner}
      />
    </>
  );
}

function PersonForm({
  info,
  onChange,
}: {
  info: PersonInfo;
  onChange: (next: PersonInfo) => void;
}) {
  const set =
    <K extends keyof PersonInfo>(key: K) =>
    (value: PersonInfo[K]) =>
      onChange({ ...info, [key]: value });

  return (
    <>
      <Section>
        <LabeledField label="First name" required>
          <TextField
            value={info.firstName}
            onChange={set("firstName")}
            placeholder="e.g. Katy"
            autoComplete="given-name"
          />
        </LabeledField>
        <LabeledField label="Last name" required>
          <TextField
            value={info.lastName}
            onChange={set("lastName")}
            placeholder="e.g. Shultz"
            autoComplete="family-name"
          />
        </LabeledField>
        <LabeledField label="Title" required>
          <SelectField
            value={info.title}
            onChange={set("title")}
            placeholder="Select"
            options={TITLES}
          />
        </LabeledField>
        <LabeledField label="Phone number" required>
          <PhoneField
            value={info.phone}
            onChange={set("phone")}
            placeholder="(555) 123-4567"
          />
        </LabeledField>
        <LabeledField label="Date of birth" required>
          <DateField
            value={info.dateOfBirth}
            onChange={set("dateOfBirth")}
          />
        </LabeledField>
      </Section>

      <Section title="Tax identification">
        <LabeledField label="Tax identification type" required>
          <SelectField
            value={info.taxIdType}
            onChange={set("taxIdType")}
            placeholder="Select"
            options={TAX_ID_TYPES}
          />
        </LabeledField>
        <LabeledField label="Tax identification number" required>
          <TextField
            value={info.taxIdNumber}
            onChange={set("taxIdNumber")}
            placeholder="123-45-6789"
            inputMode="numeric"
          />
        </LabeledField>
        <LabeledField label="Issuing country" required>
          <SelectField
            value={info.issuingCountry}
            onChange={set("issuingCountry")}
            placeholder="Select"
            options={COUNTRIES}
          />
        </LabeledField>
      </Section>

      <Section title="Address">
        <LabeledField label="Address 1" required>
          <TextField
            value={info.address1}
            onChange={set("address1")}
            placeholder="123 Main St"
            autoComplete="address-line1"
          />
        </LabeledField>
        <LabeledField label="Address 2">
          <TextField
            value={info.address2}
            onChange={set("address2")}
            placeholder="Suite 100"
            autoComplete="address-line2"
          />
        </LabeledField>
        <LabeledField label="City" required>
          <TextField
            value={info.city}
            onChange={set("city")}
            placeholder="e.g. Nashville"
            autoComplete="address-level2"
          />
        </LabeledField>
        <div className="flex gap-4 w-full">
          <LabeledField label="State" required className="flex-1">
            <SelectField
              value={info.state}
              onChange={set("state")}
              placeholder="Select"
              options={US_STATES}
            />
          </LabeledField>
          <LabeledField label="ZIP" required className="flex-1">
            <TextField
              value={info.zip}
              onChange={set("zip")}
              placeholder="37201"
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </LabeledField>
        </div>
      </Section>
    </>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <Selector checked={checked} onChange={onChange} ariaLabel={label} />
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
    </label>
  );
}

function OwnersListStep({
  primary,
  owners,
  onAdd,
  onEdit,
  onRemove,
  onPrev,
  onNext,
}: {
  primary: PersonInfo;
  owners: PersonInfo[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <StepHeader
        title="Business owners"
        subtitle="We just need a few details about your business owners to keep things compliant with federal regulations."
      />

      <div className="flex flex-col">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_120px] items-center pb-3 border-b border-[var(--color-border)] text-xs font-medium uppercase tracking-tight text-[var(--color-text-tertiary)]">
          <span>Name</span>
          <span>Role</span>
          <span className="text-right">Actions</span>
        </div>
        {/* Primary user — locked, can't remove */}
        <div className="grid grid-cols-[1fr_1fr_120px] items-center py-4 border-b border-[var(--color-border)]">
          <span className="text-sm text-[var(--color-text-primary)]">
            {primary.firstName || "You"} {primary.lastName}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">
            Authorized signer
          </span>
          <span className="text-right text-xs text-[var(--color-text-tertiary)]">
            (You)
          </span>
        </div>
        {owners.map((o, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_120px] items-center py-4 border-b border-[var(--color-border)]"
          >
            <span className="text-sm text-[var(--color-text-primary)]">
              {o.firstName} {o.lastName}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Owner
            </span>
            <span className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(i)}
                aria-label={`Edit ${o.firstName} ${o.lastName}`}
                className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${o.firstName} ${o.lastName}`}
                className="text-[var(--color-icon-secondary)] hover:text-[var(--color-negative)] transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </span>
          </div>
        ))}
      </div>

      {/* + Add owner pill — Figma uses the small "stat-selector-button" style */}
      <button
        type="button"
        onClick={onAdd}
        className="self-start flex items-center gap-2 p-2 pr-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
      >
        <span className="size-9 rounded-2xl bg-[var(--color-brand-8)] border border-[var(--color-border-brand)] text-[var(--color-brand)] flex items-center justify-center">
          <Plus size={16} />
        </span>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Add another business owner
        </span>
      </button>

      <StepFooter onPrimary={onNext} onSecondary={onPrev} />
    </>
  );
}

function OwnerFormStep({
  info,
  onChange,
  isEditing,
  onCancel,
  onSave,
}: {
  info: PersonInfo;
  onChange: (next: PersonInfo) => void;
  isEditing: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <>
      <StepHeader
        title={isEditing ? "Edit business owner" : "Add a business owner"}
        subtitle="Same details we collected for you, for anyone who owns 25% or more of the business."
      />
      <PersonForm info={info} onChange={onChange} />
      <StepFooter
        primaryLabel={isEditing ? "Save changes" : "Add owner"}
        secondaryLabel="Cancel"
        onPrimary={onSave}
        onSecondary={onCancel}
      />
    </>
  );
}

function ReviewStep({
  path,
  business,
  primary,
  owners,
  onPrev,
  onSubmit,
  onEditBusiness,
  onEditAuthorization,
  onEditOwners,
}: {
  path: "solo" | "business";
  business: BusinessInfo;
  primary: PersonInfo;
  owners: PersonInfo[];
  onPrev: () => void;
  onSubmit: () => void;
  onEditBusiness: () => void;
  onEditAuthorization: () => void;
  onEditOwners: () => void;
}) {
  return (
    <>
      <StepHeader
        title="Review & submit"
        subtitle="Take one more look before sending. You can come back to edit anything until we approve your account."
      />

      <div className="flex flex-col gap-2">
        {path === "business" && (
          <ReviewSection
            title="Business"
            onEdit={onEditBusiness}
            rows={[
              ["Legal name", business.legalName || "—"],
              ["DBA", business.dba || "—"],
              ["EIN", business.ein || "—"],
              [
                "Address",
                [business.address1, business.city, business.state, business.zip]
                  .filter(Boolean)
                  .join(", ") || "—",
              ],
            ]}
          />
        )}

        <ReviewSection
          title={path === "business" ? "Authorized signer" : "About you"}
          onEdit={onEditAuthorization}
          rows={[
            [
              "Name",
              `${primary.firstName} ${primary.lastName}`.trim() || "—",
            ],
            ["Phone", primary.phone || "—"],
            ["Date of birth", primary.dateOfBirth || "—"],
          ]}
        />

        {path === "business" && owners.length > 0 && (
          <ReviewSection
            title={`Other owners (${owners.length})`}
            onEdit={onEditOwners}
            rows={owners.map((o) => [
              `${o.firstName} ${o.lastName}`.trim(),
              "Owner",
            ])}
          />
        )}
      </div>

      <p className="text-xs text-[var(--color-text-tertiary)] leading-snug pt-4">
        When you click 'Agree and Submit' you agree to the{" "}
        <a className="underline text-[var(--color-brand)]" href="#">
          Platform Agreement
        </a>
        , and you certify that the information provided is true according to
        the{" "}
        <a className="underline text-[var(--color-brand)]" href="#">
          Card Program Terms.
        </a>
      </p>

      <StepFooter
        primaryLabel="Agree and Submit"
        onPrimary={onSubmit}
        onSecondary={onPrev}
      />
    </>
  );
}

function ReviewSection({
  title,
  rows,
  onEdit,
}: {
  title: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)]">
        <h3 className="text-base font-medium text-[var(--color-text-primary)]">
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          <Pencil size={18} />
        </button>
      </div>
      <dl className="flex flex-col py-2">
        {rows.map(([label, value]) => (
          <div
            key={label + value}
            className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-sm"
          >
            <dt className="text-[var(--color-text-tertiary)]">{label}</dt>
            <dd className="text-[var(--color-text-primary)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SubmittedStep({ onExit }: { onExit: () => void }) {
  return (
    <div className="flex flex-col gap-6 items-start">
      <span className="size-12 rounded-2xl bg-[var(--color-brand-8)] border border-[var(--color-border-brand)] text-[var(--color-brand)] flex items-center justify-center">
        <CheckCircle2 size={24} />
      </span>
      <StepHeader
        title="Application submitted"
        subtitle="Thanks! We'll let you know within 24 hours. You can keep using the portal in the meantime."
      />
      <Button variant="primary" className="w-full" onClick={onExit}>
        Back to portal
      </Button>
    </div>
  );
}

