"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const username = (formData.get("username") as string)?.toLowerCase();
  const password = formData.get("password") as string;

  console.log(`[Signup] Attempt for username: ${username}`);

  if (!name || !username || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    console.log("[Signup] Checking existing user...");
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log("[Signup] Username taken");
      return { error: "Username already taken" };
    }

    console.log("[Signup] Hashing password...");
    const passwordHash = await hash(password, 12);

    console.log("[Signup] Creating user in database...");
    const user = await prisma.user.create({
      data: { name, username, passwordHash },
    });
    console.log(`[Signup] User created with ID: ${user.id}`);
  } catch (error: any) {
    console.error("[Signup] Database/Hash error:", error);
    return { error: `Database error: ${error.message || "Unknown error"}` };
  }

  try {
    console.log("[Signup] Attempting automatic sign-in...");
    const credentials = Object.fromEntries(formData);
    // Ensure we don't pass 'name' to credentials provider if it doesn't expect it
    // but NextAuth usually just ignores extra fields.
    await signIn("credentials", { ...credentials, redirectTo: "/dashboard" });
    console.log("[Signup] Sign-in call completed (should have redirected)");
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      console.log("[Signup] Redirecting to dashboard...");
      throw error;
    }
    console.error("[Signup] Sign-in error:", error);
    // If sign in fails after account creation, redirect to login
    redirect("/login?message=Account created! Please sign in manually.");
  }
}

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/dashboard" });
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "Invalid username or password" };
  }
}
