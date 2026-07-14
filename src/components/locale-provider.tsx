"use client";

import { createContext, useContext } from "react";
import { makeT, type Locale, type TFunction } from "@/lib/i18n";

const LocaleContext = createContext<{ locale: Locale; t: TFunction }>({
  locale: "en",
  t: makeT("en"),
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: makeT(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Client-side translator: `const { t } = useT()`. */
export function useT() {
  return useContext(LocaleContext);
}
