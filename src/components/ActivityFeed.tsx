"use client";

import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "UPDATE" | "COMPLETION";
  user: { name: string };
  goal: { title: string, unit: string | null };
  note: string | null;
  metricDelta?: number | null;
  createdAt: Date;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm font-medium">No activity yet. Start tracking!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black border border-indigo-100">
            {activity.user.name.substring(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-900 leading-snug">
              <span className="font-bold">{activity.user.name}</span>
              {activity.type === "COMPLETION" ? (
                <span className="text-green-600 font-bold"> completed </span>
              ) : (
                <span className="text-gray-500"> logged </span>
              )}
              {activity.metricDelta && (
                <span className="font-black text-indigo-600">+{activity.metricDelta} {activity.goal.unit} </span>
              )}
              <span className="text-gray-500">on </span>
              <span className="font-bold">"{activity.goal.title}"</span>
            </p>
            {activity.note && (
              <p className="mt-1 text-xs text-gray-500 italic bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                "{activity.note}"
              </p>
            )}
            <p className="mt-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
