import { Activity, ShieldCheck, Stethoscope, Pill } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { LocaleProvider } from "@/components/locale-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { getT } from "@/lib/i18n-server";

export default async function LoginPage() {
  const { locale, t } = await getT();

  return (
    <LocaleProvider locale={locale}>
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand / value panel (hidden on small screens) */}
        <div className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.jpg')" }}
          />
          <div
            aria-hidden
            className="from-sidebar/95 via-sidebar/85 to-sidebar/95 absolute inset-0 bg-gradient-to-br"
          />
          <div className="relative z-10 flex items-center gap-2 text-lg font-semibold">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            HospiCare
          </div>

          <div className="relative z-10 max-w-md space-y-6">
            <h2 className="text-3xl font-semibold leading-tight">
              {t("login.heading")}
            </h2>
            <p className="text-sidebar-foreground/70">{t("login.tagline")}</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Stethoscope className="text-primary h-5 w-5 shrink-0" />
                {t("login.feature1")}
              </li>
              <li className="flex items-center gap-3">
                <Pill className="text-primary h-5 w-5 shrink-0" />
                {t("login.feature2")}
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="text-primary h-5 w-5 shrink-0" />
                {t("login.feature3")}
              </li>
            </ul>
          </div>

          <p className="text-sidebar-foreground/50 relative z-10 text-xs">
            © {new Date().getFullYear()} HospiCare · {t("login.footer")}
          </p>
        </div>

        {/* Form panel */}
        <div className="relative flex items-center justify-center p-6 lg:p-12">
          <div className="absolute right-6 top-6">
            <LanguageToggle />
          </div>
          <LoginForm />
        </div>
      </div>
    </LocaleProvider>
  );
}
