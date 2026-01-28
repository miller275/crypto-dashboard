import React, { createContext, useContext, useMemo, useState } from "react";
import type { Currency, FxRate } from "@/lib/types";
import { fxRates } from "@/data/renovData";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: FxRate[];
  convertFromEur: (value: number) => number;
  format: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export const CurrencyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem("currency");
    if (stored === "EUR" || stored === "USD" || stored === "MDL" || stored === "RON") {
      return stored;
    }
    return "EUR";
  });

  const setCurrency = (value: Currency) => {
    setCurrencyState(value);
    localStorage.setItem("currency", value);
  };

  const convertFromEur = (value: number) => {
    const rate = fxRates.find((item) => item.currency === currency)?.rateToEur ?? 1;
    return value * rate;
  };

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
    [currency]
  );

  const format = (value: number) => formatter.format(convertFromEur(value));

  const value = useMemo(
    () => ({ currency, setCurrency, rates: fxRates, convertFromEur, format }),
    [currency, formatter]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
