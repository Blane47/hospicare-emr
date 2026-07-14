"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | undefined;

export async function authenticate(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    // Auth.js signals a successful sign-in by throwing a redirect, which we
    // must let bubble up. Only genuine auth errors are handled here.
    if (error instanceof AuthError) {
      // Returns a translation key; the form resolves it with t().
      return { error: "login.invalid" };
    }
    throw error;
  }
  return undefined;
}
