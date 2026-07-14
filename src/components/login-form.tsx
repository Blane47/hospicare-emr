"use client";

import { useActionState, useState } from "react";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import { authenticate, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEMO_ACCOUNTS = [
  { role: "Administrator", email: "admin@hospital.cm" },
  { role: "Doctor", email: "doctor@hospital.cm" },
  { role: "Pharmacist", email: "pharmacist@hospital.cm" },
  { role: "Receptionist", email: "reception@hospital.cm" },
];

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    authenticate,
    undefined,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to access the hospital management system.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@hospital.cm"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" /> Sign in
            </>
          )}
        </Button>
      </form>

      {/* Demo helper — one-click fill for the panel demonstration. */}
      <div className="mt-8">
        <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
          Demo accounts (password: password123)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => {
                setEmail(acc.email);
                setPassword("password123");
              }}
              className="border-border hover:border-primary hover:bg-accent/50 rounded-md border px-3 py-2 text-left text-xs transition-colors"
            >
              <div className="font-medium">{acc.role}</div>
              <div className="text-muted-foreground truncate">{acc.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
