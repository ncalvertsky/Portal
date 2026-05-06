import { createContext, useContext, useState, type ReactNode } from "react";
import type { CardBrand } from "./components/shared/CardBrandBadge";

export interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  /** For cards: "MM/YY". For bank: account type label. */
  detail: string;
  isDefault?: boolean;
  expired?: boolean;
}

interface PaymentMethodsContextValue {
  methods: PaymentMethod[];
  setDefault: (id: string) => void;
  remove: (id: string) => void;
  add: (method: Omit<PaymentMethod, "id">) => string;
}

const initialMethods: PaymentMethod[] = [
  { id: "pm1", brand: "visa", last4: "7890", detail: "01/27", isDefault: true },
  { id: "pm2", brand: "mastercard", last4: "2180", detail: "02/25", expired: true },
  { id: "pm3", brand: "mastercard", last4: "1280", detail: "06/26" },
];

const PaymentMethodsContext = createContext<PaymentMethodsContextValue>({
  methods: initialMethods,
  setDefault: () => {},
  remove: () => {},
  add: () => "",
});

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const remove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const add = (method: Omit<PaymentMethod, "id">) => {
    const id = `pm${Date.now()}`;
    setMethods((prev) => {
      const next = method.isDefault
        ? prev.map((m) => ({ ...m, isDefault: false }))
        : prev;
      return [...next, { ...method, id }];
    });
    return id;
  };

  return (
    <PaymentMethodsContext.Provider value={{ methods, setDefault, remove, add }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  return useContext(PaymentMethodsContext);
}
