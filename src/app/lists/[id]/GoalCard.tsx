"use client";

import { updateGoalStatus, deleteGoal, logGoalProgress } from "@/actions/goals";
import { useState } from "react";

type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string | null;
    status: GoalStatus;
    recurrence: string;
    currentStreak: number;
    deadline: string | null;
    completedAt: string | null;
    isShared: boolean;
    targetMetric: number | null;
    currentMetric: number;
    unit: string | null;
  };
  isOwner: boolean;
}

const statusColors: Record<GoalStatus, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const nextStatus: Record<GoalStatus, GoalStatus> = {
  NOT_STARTED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: "NOT_STARTED",
};

const recurrenceLabels: Record<string, string> = {
  NONE: "",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export function GoalCard({ goal, isOwner }: GoalCardProps) {
  const [isLogging, setIsLogging] = useState(false);
  const [metricDelta, setMetricDelta] = useState<number>(1);
  const [note, setNote] = useState("");

  const isCompleted = goal.status === "COMPLETED";
  const hasStreak = goal.currentStreak > 0;
  const isMetricGoal = goal.targetMetric !== null;

  async function handleLogProgress(e: React.FormEvent) {
    e.preventDefault();
    await logGoalProgress(goal.id, metricDelta, note);
    setIsLogging(false);
    setNote("");
  }

  return (
    <div
      className={`flex flex-col border rounded-xl px-4 py-3 shadow-sm transition-all ${
        isCompleted
          ? "border-green-200 bg-green-50/50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {goal.isShared && (
              <span className="text-[9px] uppercase tracking-widest bg-orange-600 text-white px-1.5 py-0.5 rounded font-black">
                Shared
              </span>
            )}
            {goal.recurrence !== "NONE" && (
              <span className="text-[10px] uppercase tracking-tighter bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                {recurrenceLabels[goal.recurrence]}
              </span>
            )}
            {hasStreak && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                🔥 {goal.currentStreak}
              </span>
            )}
            <span
              className={`font-bold truncate ${isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}
            >
              {goal.title}
            </span>
          </div>
          
          {goal.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{goal.description}</p>
          )}
        </div>

        <div className="flex gap-2 ml-4 shrink-0">
          {goal.isShared && !isCompleted && (
            <button
              onClick={() => setIsLogging(true)}
              className="text-xs px-3 py-1.5 rounded-lg font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors cursor-pointer"
            >
              Log Progress
            </button>
          )}
          {isOwner && (
            <>
              {!isMetricGoal && (
                <button
                  onClick={() => updateGoalStatus(goal.id, nextStatus[goal.status])}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    isCompleted 
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  }`}
                >
                  {goal.status === "NOT_STARTED"
                    ? "Start"
                    : goal.status === "IN_PROGRESS"
                      ? "Complete"
                      : "Reset"}
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Delete this goal?")) deleteGoal(goal.id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete goal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {isMetricGoal && goal.targetMetric && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span>Progress: {goal.currentMetric} / {goal.targetMetric} {goal.unit}</span>
            <span className="text-indigo-600">{Math.round((goal.currentMetric / goal.targetMetric) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (goal.currentMetric / goal.targetMetric) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
        {goal.deadline && (
          <span className="flex items-center gap-1">
            🗓️ Due {new Date(goal.deadline).toLocaleDateString()}
          </span>
        )}
        {goal.completedAt && (
          <span className="flex items-center gap-1">
            ✅ Completed {new Date(goal.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {isLogging && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
          <form onSubmit={handleLogProgress} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount (+)</label>
                <input
                  type="number"
                  required
                  value={metricDelta}
                  onChange={(e) => setMetricDelta(parseInt(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-[2] space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Note</label>
                <input
                  type="text"
                  placeholder="What happened?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="text-[10px] font-black uppercase px-2 py-1 text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-[10px] font-black uppercase px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
