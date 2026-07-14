import { Activity, ShieldCheck, Stethoscope, Pill } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / value panel (hidden on small screens) */}
      <div className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Optional background photo — drop an image at public/login-bg.jpg.
            If the file is absent, this layer is simply invisible and the
            solid sidebar colour + gradient below act as the fallback. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        {/* Dark teal overlay so the heading + text stay readable over any photo. */}
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
            One system for patient records and pharmacy.
          </h2>
          <p className="text-sidebar-foreground/70">
            Built for hospitals in Cameroon — register patients, run
            consultations, prescribe, dispense and track drug stock, all in one
            place.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Stethoscope className="text-primary h-5 w-5 shrink-0" />
              Electronic medical records &amp; consultation history
            </li>
            <li className="flex items-center gap-3">
              <Pill className="text-primary h-5 w-5 shrink-0" />
              Pharmacy dispensing with live stock control
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="text-primary h-5 w-5 shrink-0" />
              Role-based access for every member of staff
            </li>
          </ul>
        </div>

        <p className="text-sidebar-foreground/50 relative z-10 text-xs">
          © {new Date().getFullYear()} HospiCare · Internship project
        </p>

        {/* Decorative gradient glow */}
        <div className="bg-primary/20 pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary/10 pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
