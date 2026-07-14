"use client";

import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n";
import { useT } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const router = useRouter();
  const { locale } = useT();

  function setLocale(l: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center rounded-md border p-0.5 text-xs font-medium">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded px-2 py-0.5 uppercase transition-colors",
            locale === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
