"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

function generateInviteCode(): string {
  return randomBytes(4).toString("hex");
}

export async function createList(formData: FormData) {
  const user = await requireAuth();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    throw new Error("Name is required");
  }

  const list = await prisma.goalList.create({
    data: {
      name,
      description: description || null,
      inviteCode: generateInviteCode(),
      createdBy: user.id,
      members: {
        create: { userId: user.id },
      },
    },
  });

  redirect(`/lists/${list.id}`);
}

export async function joinList(inviteCode: string) {
  const user = await requireAuth();

  const list = await prisma.goalList.findUnique({
    where: { inviteCode },
  });

  if (!list) {
    throw new Error("Invalid invite code");
  }

  const existing = await prisma.goalListMember.findUnique({
    where: { userId_goalListId: { userId: user.id, goalListId: list.id } },
  });

  if (!existing) {
    await prisma.goalListMember.create({
      data: { userId: user.id, goalListId: list.id },
    });
  }

  redirect(`/lists/${list.id}`);
}

export async function leaveList(listId: string) {
  const user = await requireAuth();

  await prisma.goalListMember.delete({
    where: { userId_goalListId: { userId: user.id, goalListId: listId } },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
