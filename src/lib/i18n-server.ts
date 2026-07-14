import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  makeT,
  type Locale,
} from "@/lib/i18n";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/** Server-side translator: `const { t } = await getT()`. */
export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}
