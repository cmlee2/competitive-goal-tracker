"use client";

import { updateGoalStatus, deleteGoal } from "@/actions/goals";

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
  const isCompleted = goal.status === "COMPLETED";
  const hasStreak = goal.currentStreak > 0;

  return (
    <div
      className={`flex items-center justify-between border rounded-lg px-4 py-3 shadow-sm transition-all ${
        isCompleted
          ? "border-green-200 bg-green-50/50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
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
            className={`font-medium truncate ${isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}
          >
            {goal.title}
          </span>
        </div>
        
        {goal.description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{goal.description}</p>
        )}
        
        <div className="flex gap-3 mt-1.5 text-[11px] font-medium text-gray-400">
          {goal.deadline && (
            <span className="flex items-center gap-1">
              🗓️ Due {new Date(goal.deadline).toLocaleDateString()}
            </span>
          )}
          {goal.completedAt && (
            <span className="flex items-center gap-1">
              ✅ {new Date(goal.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex gap-2 ml-4 shrink-0">
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
          <button
            onClick={() => {
              if (confirm("Delete this goal?")) deleteGoal(goal.id);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete goal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
