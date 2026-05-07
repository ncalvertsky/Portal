export type ChangeType = "positive" | "negative" | "neutral";

export interface StatCardData {
  label: string;
  value: string;
  change: string;
  changeType: ChangeType;
}

export interface ChartBarData {
  label: string;
  primary: number;
  secondary: number;
  tertiary: number;
  cardPayments: string;
  payByBank: string;
  instantPayments: string;
  total: string;
}

export interface CustomerData {
  name: string;
  change: string;
  changeType: ChangeType;
  amount: string;
}

export interface LegendItem {
  color: string;
  label: string;
}

export const topStatCards: StatCardData[] = [
  { label: "Total Processed", value: "$50,495", change: "(+11% MoM)", changeType: "positive" },
  { label: "Fees this Month", value: "$616.89", change: "(+1.2% MoM)", changeType: "negative" },
  { label: "Total Payments", value: "142", change: "(+18% MoM)", changeType: "positive" },
  { label: "Average Ticket", value: "$355.60", change: "(+$22 MoM)", changeType: "positive" },
  { label: "Effective Rate", value: "1.22%", change: "(+5% MoM)", changeType: "positive" },
  { label: "Payout Speed", value: "1.2 days", change: "(+3% MoM)", changeType: "positive" },
  { label: "Safety Score", value: "98.3%", change: "(-0.2% MoM)", changeType: "neutral" },
  { label: "Chargebacks", value: "$0.00", change: "(0% MoM)", changeType: "positive" },
];

export const quickStats: StatCardData[] = [
  { label: "Payout Speed", value: "1.2 days", change: "(+3% MoM)", changeType: "positive" },
  { label: "Safety Score", value: "98.3%", change: "(-0.2% MoM)", changeType: "neutral" },
  { label: "Chargebacks", value: "$0.00", change: "(0% MoM)", changeType: "positive" },
  { label: "Instant pay vol.", value: "18.9%", change: "(+3% MoM)", changeType: "positive" },
];

// Amounts add up: card + bank + instant = total per month
// Sum of all totals = $50,495 (matches Total Processed stat card)
// primary/secondary/tertiary proportions match the dollar values
export const payoutActivityData: ChartBarData[] = [
  { label: "Jan", primary: 2180, secondary: 980, tertiary: 640, cardPayments: "$2,180", payByBank: "$980", instantPayments: "$640", total: "$3,800" },
  { label: "Feb", primary: 1950, secondary: 870, tertiary: 530, cardPayments: "$1,950", payByBank: "$870", instantPayments: "$530", total: "$3,350" },
  { label: "Mar", primary: 2410, secondary: 1120, tertiary: 720, cardPayments: "$2,410", payByBank: "$1,120", instantPayments: "$720", total: "$4,250" },
  { label: "Apr", primary: 1870, secondary: 810, tertiary: 490, cardPayments: "$1,870", payByBank: "$810", instantPayments: "$490", total: "$3,170" },
  { label: "May", primary: 2650, secondary: 1240, tertiary: 810, cardPayments: "$2,650", payByBank: "$1,240", instantPayments: "$810", total: "$4,700" },
  { label: "Jun", primary: 2340, secondary: 1060, tertiary: 680, cardPayments: "$2,340", payByBank: "$1,060", instantPayments: "$680", total: "$4,080" },
  { label: "Jul", primary: 2090, secondary: 940, tertiary: 570, cardPayments: "$2,090", payByBank: "$940", instantPayments: "$570", total: "$3,600" },
  { label: "Aug", primary: 2520, secondary: 1150, tertiary: 730, cardPayments: "$2,520", payByBank: "$1,150", instantPayments: "$730", total: "$4,400" },
  { label: "Sep", primary: 2280, secondary: 1030, tertiary: 640, cardPayments: "$2,280", payByBank: "$1,030", instantPayments: "$640", total: "$3,950" },
  { label: "Oct", primary: 2730, secondary: 1280, tertiary: 840, cardPayments: "$2,730", payByBank: "$1,280", instantPayments: "$840", total: "$4,850" },
  { label: "Nov", primary: 2890, secondary: 1350, tertiary: 905, cardPayments: "$2,890", payByBank: "$1,350", instantPayments: "$905", total: "$5,145" },
  { label: "Dec", primary: 3010, secondary: 1390, tertiary: 800, cardPayments: "$3,010", payByBank: "$1,390", instantPayments: "$800", total: "$5,200" },
];

export const payoutActivityLegend: LegendItem[] = [
  { color: "var(--color-brand)", label: "Card Payments" },
  { color: "var(--color-brand-50)", label: "Pay by bank" },
  { color: "var(--color-brand-20)", label: "Instant payments" },
];

export const receivablesData = [
  { label: "31%", height: 89, color: "var(--color-brand)" },
  { label: "27%", height: 70, color: "var(--color-brand-50)" },
  { label: "42%", height: 100, color: "var(--color-brand-20)" },
];

export const receivablesLegend: LegendItem[] = [
  { color: "var(--color-brand)", label: "Current" },
  { color: "var(--color-brand-50)", label: "1-30 Days" },
  { color: "var(--color-brand-20)", label: "14+ Days" },
];

export const topCustomers: CustomerData[] = [
  { name: "Redi-Mix Co", change: "(-7%)", changeType: "negative", amount: "$8,950.00" },
  { name: "Cemex USA", change: "(+11%)", changeType: "positive", amount: "$22,640.75" },
  { name: "Quikrete LLC", change: "(+2%)", changeType: "positive", amount: "$14,375.80" },
  { name: "Boral Cement", change: "(+34%)", changeType: "positive", amount: "$47,819.15" },
];

export const payoutSpeedLegend: LegendItem[] = [
  { color: "var(--color-brand)", label: "0-7 Days" },
  { color: "var(--color-brand-50)", label: "8-30 Days" },
  { color: "var(--color-brand-20)", label: "31+ Days" },
];

export const payoutSpeedSegments = [
  { width: "73.5%", color: "var(--color-brand)" },
  { width: "13.25%", color: "var(--color-brand-50)" },
  { width: "13.25%", color: "var(--color-brand-20)" },
];

export type NavIconName =
  | "LayoutDashboard"
  | "Users"
  | "ArrowLeftRight"
  | "MapPin"
  | "ClipboardList"
  | "Users2"
  | "BarChart3"
  | "Settings"
  | "CreditCard"
  | "FileText";

export type PageId = "payments" | "agreements" | "settings" | "team" | "support";

/**
 * Canonical merchant directory. Anything that displays a merchant's contact
 * info (RequestDetailPage's Supplier card, the Support page's merchant list,
 * etc.) should look the merchant up here by `name` so a single edit
 * propagates everywhere.
 */
export interface Merchant {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  /** Optional Google Maps link for the "See on map" affordance. */
  mapUrl?: string;
}

export const merchants: Merchant[] = [
  {
    id: "ozinga",
    name: "Ozinga",
    phone: "+1 (555) 123-4567",
    email: "support@ozinga.com",
    address: "123 W Main St, Nashville, TN 40142",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=123+W+Main+St,+Nashville,+TN+40142",
  },
  {
    id: "knights-redi-mix",
    name: "Knight's Redi Mix",
    phone: "+1 (555) 123-4567",
    email: "support@knightsredimix.com",
    address: "245 W 38th St, Suite 1201, New York, NY 10018",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=245+W+38th+St,+Suite+1201,+New+York,+NY+10018",
  },
  {
    id: "sunshine-ready-mix",
    name: "Sunshine Ready Mix",
    phone: "+1 (555) 123-4567",
    email: "support@sunshinereadymix.com",
    address: "245 W 38th St, Suite 1201, New York, NY 10018",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=245+W+38th+St,+Suite+1201,+New+York,+NY+10018",
  },
];

export function getMerchant(name: string): Merchant | undefined {
  return merchants.find((m) => m.name === name);
}

/** Outpave's own support contact — surfaced on the Support page. */
export const outpaveSupport = {
  phone: "+1 (855) 935-0100",
  email: "support@outpave.com",
};

export interface NavItem {
  label: string;
  icon: NavIconName;
  active?: boolean;
  pageId?: PageId;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "LayoutDashboard", active: true },
  { label: "Customers", icon: "Users" },
  { label: "Transactions", icon: "ArrowLeftRight" },
  { label: "Sites", icon: "MapPin" },
  { label: "Orders", icon: "ClipboardList" },
  { label: "Staff", icon: "Users2" },
  { label: "Analytics", icon: "BarChart3" },
  { label: "Settings", icon: "Settings" },
];

export const paymentsNavItems: NavItem[] = [
  { label: "Payments", icon: "CreditCard", active: true, pageId: "payments" },
  { label: "Agreements", icon: "FileText", pageId: "agreements" },
  { label: "Team", icon: "Users2", pageId: "team" },
];

export const agreementsNavItems: NavItem[] = [
  { label: "Payments", icon: "CreditCard", pageId: "payments" },
  { label: "Agreements", icon: "FileText", active: true, pageId: "agreements" },
  { label: "Team", icon: "Users2", pageId: "team" },
];

export const settingsNavItems: NavItem[] = [
  { label: "Payments", icon: "CreditCard", pageId: "payments" },
  { label: "Agreements", icon: "FileText", pageId: "agreements" },
  { label: "Team", icon: "Users2", pageId: "team" },
];

export const teamNavItems: NavItem[] = [
  { label: "Payments", icon: "CreditCard", pageId: "payments" },
  { label: "Agreements", icon: "FileText", pageId: "agreements" },
  { label: "Team", icon: "Users2", active: true, pageId: "team" },
];

export const supportNavItems: NavItem[] = [
  { label: "Payments", icon: "CreditCard", pageId: "payments" },
  { label: "Agreements", icon: "FileText", pageId: "agreements" },
  { label: "Team", icon: "Users2", pageId: "team" },
];

export type TeamSummaryFilter = "all" | "active" | "pending";

export interface TeamSummaryCard {
  id: TeamSummaryFilter;
  label: string;
  count: string;
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "Admin" | "Member";
  lastActive: string | null;
  status: "Active" | "Pending";
}

export const teamMembers: TeamMember[] = [
  { id: "ks", name: "Katy Shultz", initials: "KS", email: "katy@clarkconcrete.com", role: "Admin", lastActive: "Just now", status: "Active" },
  { id: "mc", name: "Marcus Chen", initials: "MC", email: "marcus.chen@clarkconcrete.com", role: "Member", lastActive: "2 hours ago", status: "Active" },
  { id: "jp", name: "Jordan Patel", initials: "JP", email: "jordan@clarkconcrete.com", role: "Member", lastActive: "Yesterday", status: "Active" },
  { id: "sw", name: "Sarah Williams", initials: "SW", email: "s.williams@clarkconcrete.com", role: "Member", lastActive: "3 days ago", status: "Active" },
  { id: "dr", name: "David Rodriguez", initials: "DR", email: "drodriguez@clarkconcrete.com", role: "Member", lastActive: "1 week ago", status: "Active" },
  { id: "ef", name: "Emily Foster", initials: "EF", email: "emily.f@clarkconcrete.com", role: "Member", lastActive: "2 weeks ago", status: "Active" },
  { id: "tb", name: "Tom Becker", initials: "TB", email: "tom.becker@clarkconcrete.com", role: "Member", lastActive: null, status: "Pending" },
  { id: "rk", name: "Rachel Kim", initials: "RK", email: "rachel@clarkconcrete.com", role: "Member", lastActive: null, status: "Pending" },
];

export interface PersonSuggestion {
  id: string;
  name: string;
  email: string;
  reason: string;
}

export const personSuggestions: PersonSuggestion[] = [
  { id: "da", name: "Diego Alvarez", email: "diego@clarkconcrete.com", reason: "Same domain" },
  { id: "pn", name: "Priya Nair", email: "priya@clarkconcrete.com", reason: "From your company on SkyOS" },
  { id: "mh", name: "Marcus Holloway", email: "marcus@clarkconcrete.com", reason: "Same domain" },
  { id: "ao", name: "Aisha Okafor", email: "aisha@clarkconcrete.com", reason: "Same domain" },
  { id: "lt", name: "Liam Tanaka", email: "liam@clarkconcrete.com", reason: "Same domain" },
  { id: "rb", name: "Rosa Barnes", email: "rosa@clarkconcrete.com", reason: "From your company on SkyOS" },
  { id: "ev", name: "Elena Vargas", email: "elena@clarkconcrete.com", reason: "Same domain" },
  { id: "jh", name: "Jamal Hayes", email: "jamal@clarkconcrete.com", reason: "Same domain" },
  { id: "sk", name: "Sven Kowalski", email: "sven@clarkconcrete.com", reason: "From your company on SkyOS" },
];

export const teamSummaryCards: TeamSummaryCard[] = [
  { id: "all", label: "Total members", count: String(teamMembers.length) },
  { id: "active", label: "Active", count: String(teamMembers.filter((m) => m.status === "Active").length) },
  { id: "pending", label: "Pending", count: String(teamMembers.filter((m) => m.status === "Pending").length) },
];

export type AgreementSummaryFilter = "awaiting-signature" | "overdue" | "due-soon";

export interface AgreementSummaryCard {
  id: AgreementSummaryFilter;
  label: string;
  count: string;
}

export type AgreementType =
  | "Customer Agreement"
  | "Service Contract"
  | "Sales Contract"
  | "Liability Waiver"
  | "Service Agreement"
  | "Terms of Service";

export type AgreementStatus = "to-sign" | "signed" | "due-soon" | "overdue";

export interface AgreementRow {
  id: string;
  type: AgreementType;
  customer: string;
  orderType: string | null;
  issueDate: string;
  dueDate: string | null;
  signingDate: string | null;
  amount: string | null;
  /** Amount already paid against `amount` for partial-payment invoices. When
   * set, the table renders "paidAmount / amount" — mirrors how `PaymentRow`
   * uses `amount`/`totalAmount` for the same case. */
  paidAmount?: string;
  status: AgreementStatus;
  statusLabel: string;
  action: "sign" | "sign-pay" | "view";
}

export const agreementRows: AgreementRow[] = [
  { id: "a1", type: "Service Agreement", customer: "Sunshine Ready Mix", orderType: null, issueDate: "08-19-25", dueDate: null, signingDate: null, amount: null, status: "to-sign", statusLabel: "To sign", action: "sign" },
  { id: "a2", type: "Customer Agreement", customer: "Ozinga", orderType: null, issueDate: "08-18-25", dueDate: null, signingDate: null, amount: null, status: "to-sign", statusLabel: "To sign", action: "sign" },
  { id: "a3", type: "Terms of Service", customer: "Knight's Redi Mix", orderType: null, issueDate: "08-17-25", dueDate: null, signingDate: null, amount: null, status: "to-sign", statusLabel: "To sign", action: "sign" },
  { id: "a4", type: "Service Contract", customer: "Ozinga", orderType: "Invoice #617297329", issueDate: "08-16-25", dueDate: "08-20-25", signingDate: null, amount: "$14,100.00", status: "due-soon", statusLabel: "Due soon", action: "sign-pay" },
  { id: "a5", type: "Sales Contract", customer: "Knight's Redi Mix", orderType: "Estimate EST-7319", issueDate: "08-14-25", dueDate: "08-14-25", signingDate: "08-14-25", amount: "$24,800.00", status: "signed", statusLabel: "Signed", action: "view" },
  { id: "a6", type: "Liability Waiver", customer: "Ozinga", orderType: "Invoice #615028471", issueDate: "06-02-25", dueDate: "06-02-25", signingDate: "06-02-25", amount: "$42,500.00", status: "signed", statusLabel: "Signed", action: "view" },
  { id: "a7", type: "Service Agreement", customer: "Knight's Redi Mix", orderType: "Invoice (partial) #615082918", issueDate: "06-02-25", dueDate: "06-02-25", signingDate: null, amount: "$4,300.00", paidAmount: "$2,150.00", status: "overdue", statusLabel: "Overdue", action: "sign-pay" },
  { id: "a8", type: "Service Agreement", customer: "Ozinga", orderType: null, issueDate: "06-01-25", dueDate: null, signingDate: "06-01-25", amount: null, status: "signed", statusLabel: "Signed", action: "view" },
  { id: "a9", type: "Customer Agreement", customer: "Sunshine Ready Mix", orderType: "Invoice #614782103", issueDate: "05-18-25", dueDate: "05-18-25", signingDate: "05-18-25", amount: "$8,950.00", status: "signed", statusLabel: "Signed", action: "view" },
  { id: "a10", type: "Terms of Service", customer: "Ozinga", orderType: null, issueDate: "04-10-25", dueDate: null, signingDate: "04-10-25", amount: null, status: "signed", statusLabel: "Signed", action: "view" },
  { id: "a11", type: "Service Contract", customer: "Knight's Redi Mix", orderType: "Invoice (partial) #613245987", issueDate: "03-22-25", dueDate: "03-22-25", signingDate: "03-22-25", amount: "$16,200.00", paidAmount: "$4,050.00", status: "signed", statusLabel: "Signed", action: "view" },
];

// Counts are derived from `agreementRows` so they stay in sync with the data.
// "Awaiting signature" includes any row that still needs a signature — that's
// any non-`signed` status, which covers both plain "to-sign" and the
// "due-soon"/"overdue" rows that still require a sign-and-pay action. Those
// latter two also feed their dedicated cards, so a single row can intentionally
// contribute to multiple buckets.
export const agreementSummaryCards: AgreementSummaryCard[] = [
  {
    id: "awaiting-signature",
    label: "Outstanding",
    count: String(agreementRows.filter((r) => r.status !== "signed").length),
  },
  {
    id: "overdue",
    label: "Overdue",
    count: String(agreementRows.filter((r) => r.status === "overdue").length),
  },
  {
    id: "due-soon",
    label: "Due soon",
    count: String(agreementRows.filter((r) => r.status === "due-soon").length),
  },
];

export type PaymentSummaryFilter = "outstanding" | "overdue" | "due-soon";

export interface PaymentSummaryCard {
  id: PaymentSummaryFilter;
  label: string;
  count: string;
  total: string;
}

export const paymentSummaryCards: PaymentSummaryCard[] = [
  { id: "outstanding", label: "Outstanding", count: "4", total: "$23,480.00 total" },
  { id: "overdue", label: "Overdue", count: "1", total: "$4,300.00 total" },
  { id: "due-soon", label: "Due this week", count: "1", total: "$14,200.00 total" },
];

export type PaymentType =
  | "Invoice"
  | "Invoice (partial)"
  | "Payment request"
  | "Payment request (partial)"
  | "Estimate";

export type PaymentStatus = "due-soon" | "pending" | "overdue" | "paid";

export interface PaymentRow {
  type: PaymentType;
  customer: string;
  reference: string;
  issueDate: string;
  dueDate: string | null;
  amount: string;
  totalAmount?: string;
  status: PaymentStatus;
  statusLabel: string;
  action: "sign-pay" | "pay" | "view";
}

export const paymentRows: PaymentRow[] = [
  { type: "Invoice", customer: "Ozinga", reference: "#617297329", issueDate: "08-16-25", dueDate: "08-20-25", amount: "$14,100.00", status: "due-soon", statusLabel: "Due soon", action: "sign-pay" },
  { type: "Payment request", customer: "Ozinga", reference: "#PR-2048", issueDate: "08-14-25", dueDate: null, amount: "$3,200.00", status: "pending", statusLabel: "Pending", action: "pay" },
  { type: "Invoice (partial)", customer: "Knight's Redi Mix", reference: "#615082918", issueDate: "06-02-25", dueDate: "06-02-25", amount: "$2,150.00", totalAmount: "$4,300.00", status: "overdue", statusLabel: "Overdue", action: "sign-pay" },
  { type: "Payment request", customer: "Sunshine Ready Mix", reference: "#PR-1987", issueDate: "05-28-25", dueDate: null, amount: "$1,880.00", status: "pending", statusLabel: "Pending", action: "pay" },
  { type: "Invoice", customer: "Sunshine Ready Mix", reference: "#614782103", issueDate: "05-18-25", dueDate: "05-18-25", amount: "$8,950.00", status: "paid", statusLabel: "Paid", action: "view" },
  { type: "Estimate", customer: "Ozinga", reference: "#EST-2837", issueDate: "06-02-25", dueDate: "06-02-25", amount: "$42,500.00", status: "paid", statusLabel: "Paid", action: "view" },
  { type: "Invoice (partial)", customer: "Knight's Redi Mix", reference: "#613245987", issueDate: "03-22-25", dueDate: "03-22-25", amount: "$4,050.00", totalAmount: "$16,200.00", status: "paid", statusLabel: "Paid", action: "view" },
  { type: "Payment request", customer: "Knight's Redi Mix", reference: "#PR-1842", issueDate: "02-14-25", dueDate: null, amount: "$750.00", status: "paid", statusLabel: "Paid", action: "view" },
  { type: "Invoice", customer: "Sunshine Ready Mix", reference: "#612408571", issueDate: "01-28-25", dueDate: "01-28-25", amount: "$22,300.00", status: "paid", statusLabel: "Paid", action: "view" },
  { type: "Payment request (partial)", customer: "Knight's Redi Mix", reference: "#PR-1654", issueDate: "12-19-24", dueDate: null, amount: "$1,850.00", status: "paid", statusLabel: "Paid", action: "view" },
];
