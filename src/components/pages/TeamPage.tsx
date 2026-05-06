import { useMemo, useState } from "react";
import { SlidersHorizontal, Plus, MoreHorizontal, Copy } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import SearchBar from "../shared/SearchBar";
import Button from "../shared/Button";
import Popover from "../shared/Popover";
import InviteMemberModal from "../shared/InviteMemberModal";
import InviteConfirmModal from "../shared/InviteConfirmModal";
import Toast from "../shared/Toast";
import {
  teamNavItems,
  teamMembers,
  personSuggestions,
  type PageId,
  type PersonSuggestion,
  type TeamMember,
} from "../../data/mockData";

const TEAM_GRID =
  "grid-cols-[minmax(220px,1.6fr)_minmax(220px,1.6fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_minmax(110px,0.8fr)_96px]";

interface TeamPageProps {
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
}

export default function TeamPage({ onNavigate, onLogout }: TeamPageProps = {}) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmInvitees, setConfirmInvitees] = useState<PersonSuggestion[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [suggestionsHidden, setSuggestionsHidden] = useState(false);

  const openConfirm = (people: PersonSuggestion[]) => {
    setInviteOpen(false);
    setConfirmInvitees(people);
  };

  const sendInvites = (payload: { people: PersonSuggestion[]; message: string }) => {
    const count = payload.people.length;
    setToast(
      count === 1
        ? `Invite sent to ${payload.people[0].name}`
        : `${count} invites sent`,
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teamMembers;
    return teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <>
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={teamNavItems}
      sidebarFooter={<SidebarCTA />}
      showLogout={false}
      onNavigate={onNavigate}
      onLogout={onLogout}
      topBarLeft={
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)] flex-1 min-w-0">
          Team
        </h1>
      }
    >
      {/* People to add — coworker suggestions */}
      {!suggestionsHidden ? (
        <>
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-medium text-[var(--color-text-primary)]">
                  People to add
                </span>
                <span className="text-sm text-[var(--color-text-tertiary)]">
                  Coworkers from your company who aren't on the portal yet
                </span>
              </div>
              <div className="flex items-center gap-4 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="text-sm font-semibold text-[var(--color-brand)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  See all suggestions ({personSuggestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionsHidden(true)}
                  className="text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  Hide
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {personSuggestions.slice(0, 4).map((person) => (
                <SuggestionCard
                  key={person.id}
                  person={person}
                  onInvite={() => openConfirm([person])}
                />
              ))}
            </div>
          </div>

          <div className="h-px shrink-0 bg-[var(--color-border)]" />
        </>
      ) : (
        <button
          type="button"
          onClick={() => setSuggestionsHidden(false)}
          className="self-start text-sm font-semibold text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
        >
          Show people to add
        </button>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <SearchBar
            placeholder="Search team"
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <button
            type="button"
            className="size-11 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-bg-surface)] active:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:border-[var(--color-border-focus)] transition-colors cursor-pointer shrink-0"
            aria-label="Filter team"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
        {/* Mobile: icon-only circular plus button. md+: full button with label. */}
        <button
          type="button"
          onClick={() => openConfirm([])}
          aria-label="Invite member"
          className="md:hidden size-11 rounded-full bg-[var(--color-brand)] text-[var(--color-text-on-brand)] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[color-mix(in_srgb,var(--color-brand)_85%,white)] transition-colors"
        >
          <Plus size={20} />
        </button>
        <div className="hidden md:block">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => openConfirm([])}
          >
            Invite member
          </Button>
        </div>
      </div>

      {/* Table — same grid + row pattern as Payments / Agreements tables. */}
      <div className="w-full overflow-hidden shrink-0 bg-[var(--color-bg-surface)] rounded-[13px] border border-[var(--color-border)] md:overflow-x-auto md:rounded-lg">
        <div className="flex flex-col md:min-w-[1000px]">
          {/* Desktop header */}
          <div
            className={`hidden md:grid ${TEAM_GRID} gap-4 items-center px-3 py-2 border-b border-[var(--color-border)]`}
          >
            <HeaderCell>User</HeaderCell>
            <HeaderCell>Email</HeaderCell>
            <HeaderCell>Role</HeaderCell>
            <HeaderCell>Last active</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <div />
          </div>

          {filtered.map((member) => (
            <TeamRow key={member.id} member={member} />
          ))}
        </div>
      </div>
    </DashboardLayout>
    <InviteMemberModal
      open={inviteOpen}
      suggestions={personSuggestions}
      onClose={() => setInviteOpen(false)}
      onInvite={(person) => openConfirm([person])}
    />
    <InviteConfirmModal
      open={confirmInvitees !== null}
      initialSelected={confirmInvitees ?? []}
      candidates={personSuggestions}
      onClose={() => setConfirmInvitees(null)}
      onSend={sendInvites}
    />
    <Toast
      open={toast !== null}
      message={toast ?? ""}
      onClose={() => setToast(null)}
    />
    </>
  );
}

function SuggestionCard({
  person,
  onInvite,
}: {
  person: PersonSuggestion;
  onInvite: () => void;
}) {
  return (
    <div className="shrink-0 flex items-center gap-3 p-2 rounded-[28px] bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
      <button
        type="button"
        aria-label={`Invite ${person.name}`}
        onClick={onInvite}
        className="size-9 rounded-2xl bg-[var(--color-brand-8)] border border-[var(--color-border-brand)] hover:bg-[var(--color-brand-20)] text-[var(--color-brand)] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
      >
        <Plus size={16} />
      </button>
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-end gap-1 tracking-tight">
          <span className="text-base font-medium text-[var(--color-text-primary)] leading-none whitespace-nowrap">
            {person.name}
          </span>
          <span className="text-sm text-[var(--color-text-tertiary)] leading-none">
            •
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] leading-none w-[143px] truncate">
            {person.email}
          </span>
        </div>
        <span className="text-xs font-medium text-[var(--color-text-tertiary)] tracking-tight leading-none">
          {person.reason}
        </span>
      </div>
    </div>
  );
}

function TeamRow({ member }: { member: TeamMember }) {
  const statusClass =
    member.status === "Active"
      ? "text-[var(--color-text-success)]"
      : "text-[var(--color-text-tertiary)]";

  return (
    <>
      {/* Desktop row */}
      <div
        className={`hidden md:grid ${TEAM_GRID} gap-4 items-center px-3 h-[52px] border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center shrink-0">
            <span className="text-xs font-medium uppercase text-[var(--color-text-primary)] leading-none tracking-tight">
              {member.initials}
            </span>
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {member.name}
          </span>
        </div>

        <div className="text-sm text-[var(--color-text-primary)] truncate">
          {member.email}
        </div>

        <div className="text-sm text-[var(--color-text-primary)]">
          {member.role}
        </div>

        <div className="text-sm text-[var(--color-text-primary)]">
          {member.lastActive ?? (
            <span className="text-[var(--color-text-secondary)]">—</span>
          )}
        </div>

        <div className={`text-[13px] tracking-tight ${statusClass}`}>
          {member.status}
        </div>

        <div className="flex items-center justify-end">
          <TeamRowMenu member={member} />
        </div>
      </div>

      {/* Mobile row */}
      <div className="md:hidden w-full flex items-center gap-3 px-3 py-2 min-h-[52px] border-b border-[var(--color-border)] last:border-b-0">
        <div className="size-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center shrink-0">
          <span className="text-xs font-medium uppercase text-[var(--color-text-primary)] leading-none tracking-tight">
            {member.initials}
          </span>
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate leading-tight">
            {member.name}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)] truncate leading-tight">
            {member.email}
          </span>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <span className={`text-[13px] tracking-tight ${statusClass}`}>
            {member.status}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {member.role}
          </span>
        </div>
        <TeamRowMenu member={member} />
      </div>
    </>
  );
}

function TeamRowMenu({ member }: { member: TeamMember }) {
  return (
    <Popover
      align="end"
      panelClassName="w-[180px] p-2 flex flex-col"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-label={`Actions for ${member.name}`}
          aria-expanded={open}
          onClick={toggle}
          className={`size-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            open
              ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
              : "text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <MoreHorizontal size={20} />
        </button>
      )}
    >
      {(close) =>
        member.status === "Pending" ? (
          <>
            <TeamMenuItem onClick={close}>Resend invite</TeamMenuItem>
            <TeamMenuItem
              onClick={close}
              icon={<Copy size={20} className="text-[var(--color-icon-secondary)]" />}
            >
              Copy invite link
            </TeamMenuItem>
            <TeamMenuItem onClick={close}>Cancel invite</TeamMenuItem>
          </>
        ) : (
          <>
            <TeamMenuItem onClick={close}>Suspend access</TeamMenuItem>
            <TeamMenuItem onClick={close}>Delete from team</TeamMenuItem>
          </>
        )
      }
    </Popover>
  );
}

function TeamMenuItem({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-2 h-[42px] pl-4 pr-3 rounded-xl text-left hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer text-sm tracking-tight text-[var(--color-text-primary)]"
    >
      <span className="flex-1 min-w-0 truncate">{children}</span>
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-sm font-medium text-[var(--color-text-secondary)] flex items-center ${className}`}
    >
      {children}
    </div>
  );
}
