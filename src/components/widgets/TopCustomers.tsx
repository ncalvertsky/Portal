import TransactionRow from "../shared/TransactionRow";
import { topCustomers } from "../../data/mockData";

export default function TopCustomers() {
  return (
    <div className="bg-[var(--stat-card-bg)] border border-[var(--stat-card-stroke)] rounded-2xl p-4 xl:p-6 flex flex-col overflow-hidden min-h-[240px] h-full">
      {/* Header */}
      <div className="flex flex-col gap-2 shrink-0">
        <span className="text-[var(--stat-card-value)] text-xl font-semibold leading-tight">
          Top Customers
        </span>
        <span className="text-[var(--stat-card-label)] text-sm font-medium">
          Largest customers by volume this month
        </span>
      </div>

      {/* Customer list */}
      <div className="flex flex-col justify-evenly flex-1 min-h-0">
        {topCustomers.map((customer) => (
          <TransactionRow key={customer.name} customer={customer} />
        ))}
      </div>
    </div>
  );
}
