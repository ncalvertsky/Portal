interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange?: (id: string) => void;
}

export default function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div className="flex items-center border-b border-[var(--color-border)]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange?.(tab.id)}
            className={`relative px-5 pb-3 text-base font-medium tracking-tight transition-colors cursor-pointer ${
              isActive
                ? "text-[var(--color-brand)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--color-brand)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
