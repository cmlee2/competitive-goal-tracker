import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import { AddGoalForm } from "./AddGoalForm";
import { GoalCard } from "./GoalCard";
import Link from "next/link";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();

  const list = await prisma.goalList.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      goals: {
        where: { parentGoalId: null },
        include: { 
          user: true,
          subGoals: {
            include: { user: true },
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!list) notFound();

  const isMember = list.members.some((m: any) => m.userId === user.id);
  if (!isMember) notFound();

  // Validate and reset streaks/status for recurring goals
  const now = new Date();
  const goalsToUpdate = list.goals.flatMap((g: any) => [g, ...g.subGoals]).filter((goal: any) => {
    if (goal.recurrence === "NONE") return false;
    
    const lastCompleted = goal.completedAt ? new Date(goal.completedAt) : null;
    if (!lastCompleted) return false;

    const isSameDay = lastCompleted.toDateString() === now.toDateString();
    const isSameWeek = getWeekNumber(lastCompleted) === getWeekNumber(now) && lastCompleted.getFullYear() === now.getFullYear();
    const isSameMonth = lastCompleted.getMonth() === now.getMonth() && lastCompleted.getFullYear() === now.getFullYear();

    let shouldResetStatus = false;
    let shouldResetStreak = false;

    if (goal.recurrence === "DAILY" && !isSameDay) {
      shouldResetStatus = true;
      const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
      if (lastCompleted.toDateString() !== yesterday.toDateString()) shouldResetStreak = true;
    }
    if (goal.recurrence === "WEEKLY" && !isSameWeek) {
      shouldResetStatus = true;
      const lastWeek = getWeekNumber(now) - 1; // Simplistic week check
      if (getWeekNumber(lastCompleted) !== lastWeek) shouldResetStreak = true;
    }
    if (goal.recurrence === "MONTHLY" && !isSameMonth) {
      shouldResetStatus = true;
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      if (lastCompleted.getMonth() !== lastMonth) shouldResetStreak = true;
    }

    if (shouldResetStatus || shouldResetStreak) {
      // Return true so we can trigger the update in the next step
      return true;
    }
    return false;
  });

  // Perform bulk updates if needed (async, non-blocking for this request ideally, but we'll await for consistency)
  if (goalsToUpdate.length > 0) {
    await Promise.all(goalsToUpdate.map(async (goal: any) => {
      const isDaily = goal.recurrence === "DAILY";
      const lastCompleted = goal.completedAt ? new Date(goal.completedAt) : null;
      let shouldResetStreak = false;
      
      if (lastCompleted) {
        if (isDaily) {
          const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
          if (lastCompleted.toDateString() !== yesterday.toDateString()) shouldResetStreak = true;
        }
        // ... (similar logic for weekly/monthly)
      }

      await prisma.goal.update({
        where: { id: goal.id },
        data: {
          status: "NOT_STARTED",
          currentStreak: shouldResetStreak ? 0 : goal.currentStreak
        }
      });
    }));
    
    // Refresh the list data after updates
    return ListDetailPage({ params: Promise.resolve({ id }) });
  }

  const userHighLevelGoals = list.goals
    .filter((g: any) => g.userId === user.id)
    .map((g: any) => ({ id: g.id, title: g.title }));

  // Helper for week numbers
  function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Build leaderboard (count all goals including subgoals)
  const leaderboard = list.members
    .map(({ user: member }: any) => {
      const memberGoals = list.goals.filter((g: any) => g.userId === member.id);
      const memberSubGoals = list.goals.flatMap((g: any) => g.subGoals).filter((g: any) => g.userId === member.id);
      const allGoals = [...memberGoals, ...memberSubGoals];
      const completed = allGoals.filter(
        (g: any) => g.status === "COMPLETED"
      ).length;
      const total = allGoals.length;
      return { member, completed, total };
    })
    .sort((a: any, b: any) => b.completed - a.completed);

  const userLists = await prisma.goalList.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { id: true, name: true }
  });

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* ... (header) */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-2 inline-block"
            >
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{list.name}</h1>
            {list.description && (
              <p className="text-gray-500 mt-2 max-w-2xl">{list.description}</p>
            )}
          </div>
          <div className="text-right bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invite Code</p>
            <code className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-100">
              {list.inviteCode}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Add goal */}
            <section>
              <h2 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white p-1 rounded-lg text-sm">＋</span>
                Track a New Goal
              </h2>
              <AddGoalForm 
                goalListId={list.id} 
                potentialParents={userHighLevelGoals} 
                allUserLists={userLists}
              />
            </section>

            {/* Goals by member */}
            <section>
              <h2 className="font-bold text-xl text-gray-800 mb-4">Group Progress</h2>
              {list.members.map(({ user: member }: any) => {
                const memberHighLevelGoals = list.goals.filter((g: any) => g.userId === member.id);
                if (memberHighLevelGoals.length === 0) return null;

                return (
                  <div key={member.id} className="mb-8 last:mb-0">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                        {member.name.substring(0, 2)}
                      </div>
                      {member.name}
                      {member.id === user.id && (
                        <span className="text-indigo-500 text-[10px] font-black uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded">You</span>
                      )}
                    </h3>
                    
                    <div className="space-y-4">
                      {memberHighLevelGoals.map((goal: any) => (
                        <div key={goal.id} className="space-y-2">
                          <GoalCard
                            goal={{
                              ...goal,
                              deadline: goal.deadline?.toISOString() ?? null,
                              completedAt: goal.completedAt?.toISOString() ?? null,
                            }}
                            isOwner={goal.userId === user.id}
                          />
                          {/* Render Sub-goals */}
                          {goal.subGoals.length > 0 && (
                            <div className="ml-8 border-l-2 border-gray-100 pl-4 space-y-2">
                              {goal.subGoals.map((subGoal: any) => (
                                <GoalCard
                                  key={subGoal.id}
                                  goal={{
                                    ...subGoal,
                                    deadline: subGoal.deadline?.toISOString() ?? null,
                                    completedAt: subGoal.completedAt?.toISOString() ?? null,
                                  }}
                                  isOwner={subGoal.userId === user.id}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-900">Leaderboard</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {leaderboard.map(({ member, completed, total }: any, i: number) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between px-4 py-4 transition-colors ${
                      member.id === user.id ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          i === 0
                            ? "bg-yellow-400 text-white shadow-sm"
                            : i === 1
                              ? "bg-gray-400 text-white"
                              : i === 2
                                ? "bg-orange-400 text-white"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-bold text-gray-800 text-sm">
                        {member.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-gray-900">
                        {completed} / {total}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
