"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export async function createGoal(formData: FormData) {
  const user = await requireAuth();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const deadline = formData.get("deadline") as string;
  const goalListIds = formData.getAll("goalListIds") as string[];
  const parentGoalId = formData.get("parentGoalId") as string;
  const recurrence = (formData.get("recurrence") as RecurrenceType) || "NONE";

  if (!title || goalListIds.length === 0) {
    return { error: "Title and at least one group are required" };
  }

  // Verify user is a member of all selected lists
  const memberships = await prisma.goalListMember.findMany({
    where: { 
      userId: user.id,
      goalListId: { in: goalListIds }
    },
  });

  if (memberships.length !== goalListIds.length) {
    return { error: "Invalid group selection" };
  }

  await prisma.goal.create({
    data: {
      title,
      description: description || null,
      deadline: deadline ? new Date(deadline) : null,
      userId: user.id,
      parentGoalId: parentGoalId || null,
      recurrence,
      goalLists: {
        connect: goalListIds.map((id: any) => ({ id }))
      }
    },
  });

  goalListIds.forEach(id => {
    revalidatePath(`/lists/${id}`);
  });
}

export async function updateGoalStatus(goalId: string, status: GoalStatus) {
  const user = await requireAuth();

  const goal = await prisma.goal.findUnique({ 
    where: { id: goalId },
    include: { goalLists: true }
  });
  
  if (!goal || goal.userId !== user.id) {
    return { error: "Goal not found" };
  }

  // Handle Recurring Goals
  if (goal.recurrence !== "NONE") {
    const now = new Date();
    const lastCompleted = goal.completedAt ? new Date(goal.completedAt) : null;
    
    // Check if we are completing it for the first time in the current window
    if (status === "COMPLETED") {
      let shouldIncrementStreak = true;

      if (lastCompleted) {
        const isSameDay = lastCompleted.toDateString() === now.toDateString();
        const isSameWeek = getWeekNumber(lastCompleted) === getWeekNumber(now) && lastCompleted.getFullYear() === now.getFullYear();
        const isSameMonth = lastCompleted.getMonth() === now.getMonth() && lastCompleted.getFullYear() === now.getFullYear();

        if (goal.recurrence === "DAILY" && isSameDay) shouldIncrementStreak = false;
        if (goal.recurrence === "WEEKLY" && isSameWeek) shouldIncrementStreak = false;
        if (goal.recurrence === "MONTHLY" && isSameMonth) shouldIncrementStreak = false;
      }

      if (shouldIncrementStreak) {
        await prisma.$transaction([
          prisma.goalCompletion.create({
            data: { goalId, userId: user.id }
          }),
          prisma.goal.update({
            where: { id: goalId },
            data: {
              currentStreak: { increment: 1 },
              completedAt: now,
              status: "COMPLETED"
            }
          })
        ]);
      }
    } else {
      // If moving back from COMPLETED to something else, just update status
      await prisma.goal.update({
        where: { id: goalId },
        data: { status }
      });
    }
  } else {
    // Standard non-recurring goal behavior
    await prisma.goal.update({
      where: { id: goalId },
      data: {
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });
  }

  goal.goalLists.forEach((list: { id: string }) => {
    revalidatePath(`/lists/${list.id}`);
  });
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export async function deleteGoal(goalId: string) {
  const user = await requireAuth();

  const goal = await prisma.goal.findUnique({ 
    where: { id: goalId },
    include: { goalLists: true }
  });
  
  if (!goal || goal.userId !== user.id) {
    return { error: "Goal not found" };
  }

  await prisma.goal.delete({ where: { id: goalId } });

  goal.goalLists.forEach((list: { id: string }) => {
    revalidatePath(`/lists/${list.id}`);
  });
}
