"use server";

import { hash, verify } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, clearSession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import type { FormState } from "../form";

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try {
    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return { error: "An account with that email already exists" };
    const user = await db.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hash(parsed.data.password), emoji: String(fd.get("emoji") || "🌟") }
    });
    await createSession(user.id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create your account" };
  }
  redirect("/");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verify(user.passwordHash, parsed.data.password))) return { error: "Email or password is incorrect" };
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
