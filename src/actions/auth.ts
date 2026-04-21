"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const username = (formData.get("username") as string)?.toLowerCase();
  const password = formData.get("password") as string;

  if (!name || !username || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "Username already taken" };
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: { name, username, passwordHash },
  });

  await signIn("credentials", {
    username,
    password,
    redirect: false,
  });

  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
  } catch {
    return { error: "Invalid username or password" };
  }

  redirect("/dashboard");
}
