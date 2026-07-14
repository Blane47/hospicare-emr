"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { userSchema } from "@/lib/schemas";

export async function createUser(input: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole(["ADMIN"]);

  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, role, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "A user with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, role, passwordHash } });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireRole(["ADMIN"]);
  // Prevent an admin from disabling their own account.
  if (userId === admin.id) return;
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}
