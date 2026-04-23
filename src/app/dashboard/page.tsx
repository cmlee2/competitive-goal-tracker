import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { joinList } from "@/actions/lists";
import { GoalCard } from "../lists/[id]/GoalCard";
import { AddGoalForm } from "../lists/[id]/AddGoalForm";

export default async function DashboardPage() {
  const user = await requireAuth();

  const memberships = await prisma.goalListMember.findMany({
    where: { userId: user.id },
    include: {
      goalList: {
        include: {
          members: { include: { user: true } },
          goals: {
            include: { subGoals: true }
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const userLists = await prisma.goalList.findMany({
    where: { members: { some: { userId: user.id } } },
    select: { id: true, name: true }
  });

  const myGoals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { subGoals: true, goalLists: true },
    orderBy: { createdAt: "desc" },
  });

  // Private goals are those with NO associated goal lists
  const privateGoals = myGoals.filter(g => g.goalLists.length === 0);
  
  // Potential parents are any goals that don't have a parent themselves
  const userHighLevelGoals = myGoals
    .filter((g: any) => g.parentGoalId === null)
    .map((g: any) => ({ id: g.id, title: g.title }));

  const completed = myGoals.filter((g: any) => g.status === "COMPLETED").length;
  const inProgress = myGoals.filter((g: any) => g.status === "IN_PROGRESS").length;
  const totalStreak = myGoals.reduce((acc: number, g: { currentStreak: number }) => acc + g.currentStreak, 0);

  async function handleJoinAction(formData: FormData) {
    "use server";
    const code = formData.get("code") as string;
    if (code) {
      await joinList(code);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Hey {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
              You've got some serious momentum going.
            </p>
          </div>
          <Link
            href="/lists/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span className="text-xl">＋</span> New Goal List
          </Link>
        </div>

        {/* Create New Goal */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Add a New Goal
          </h2>
          <AddGoalForm 
            potentialParents={userHighLevelGoals} 
            allUserLists={userLists} 
          />
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Completed</div>
            <div className="text-3xl font-black text-gray-900">{completed}</div>
            <div className="w-full bg-green-100 h-1 rounded-full mt-3">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: `${myGoals.length > 0 ? (completed / myGoals.length) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">In Progress</div>
            <div className="text-3xl font-black text-gray-900">{inProgress}</div>
            <div className="w-full bg-blue-100 h-1 rounded-full mt-3">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${myGoals.length > 0 ? (inProgress / myGoals.length) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Goals</div>
            <div className="text-3xl font-black text-gray-900">{myGoals.length}</div>
            <div className="text-[10px] font-bold text-indigo-500 mt-3 uppercase tracking-tighter">Keep it up!</div>
          </div>
          <div className="bg-indigo-600 p-5 rounded-3xl shadow-lg shadow-indigo-100 border border-indigo-500">
            <div className="text-indigo-200 font-black text-[10px] uppercase tracking-widest mb-1">Total Streak</div>
            <div className="text-3xl font-black text-white flex items-center gap-2">
              <span>🔥</span> {totalStreak}
            </div>
            <div className="text-[10px] font-bold text-indigo-200 mt-3 uppercase tracking-tighter">Record breaker</div>
          </div>
        </div>

        {/* Private Goals Section */}
        {privateGoals.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
              Private Goals
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {privateGoals.map((goal: any) => (
                <GoalCard
                  key={goal.id}
                  goal={{
                    ...goal,
                    deadline: goal.deadline?.toISOString() ?? null,
                    completedAt: goal.completedAt?.toISOString() ?? null,
                  }}
                  isOwner={true}
                />
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
          Your Circles
        </h2>

        {memberships.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center shadow-sm">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No goal lists yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-6 text-sm">
              Create a private circle for yourself or join one with your friends to start competing.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {memberships.map(({ goalList }: any) => {
              const allGoals = [...goalList.goals, ...goalList.goals.flatMap((g: any) => g.subGoals)];
              const totalGoals = allGoals.length;
              const completedGoals = allGoals.filter(
                (g: any) => g.status === "COMPLETED"
              ).length;
              const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

              return (
                <Link
                  key={goalList.id}
                  href={`/lists/${goalList.id}`}
                  className="group relative bg-white border border-gray-100 rounded-[32px] p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                      {goalList.members.length} Members
                    </div>
                    <div className="text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
                      View Circle &rarr;
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{goalList.name}</h3>
                  {goalList.description && (
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {goalList.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      <span>Circle Progress</span>
                      <span className="text-indigo-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 group-hover:bg-indigo-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {goalList.members.slice(0, 4).map(({ user: member }: any) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black border-2 border-white ring-1 ring-gray-50"
                            title={member.name}
                          >
                            {member.name.substring(0, 1).toUpperCase()}
                          </div>
                        ))}
                        {goalList.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-black border-2 border-white">
                            +{goalList.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Active now</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12 p-8 bg-gray-900 rounded-[32px] text-center shadow-2xl shadow-gray-200">
          <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-3">Join a Friend's Circle</p>
          <h4 className="text-white text-xl font-bold mb-6">Have an invite code?</h4>
          <form
            action={handleJoinAction}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              name="code"
              type="text"
              required
              placeholder="e.g. 5a2f8c1e"
              className="bg-gray-800 border-none text-white rounded-2xl px-5 py-3.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500 font-mono text-center sm:text-left"
            />
            <button
              type="submit"
              className="bg-white text-gray-900 px-8 py-3.5 rounded-2xl text-sm font-black hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Join Group
            </button>
          </form>
        </div>
      </main>
    </>
  );
}