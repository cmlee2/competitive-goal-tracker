"use client";

import { createGoal } from "@/actions/goals";
import { FormButton } from "@/components/FormButton";
import { useRef } from "react";

export function AddGoalForm({ 
  goalListId, 
  potentialParents,
  allUserLists
}: { 
  goalListId: string, 
  potentialParents: { id: string, title: string }[],
  allUserLists: { id: string, name: string }[]
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await createGoal(formData);
        formRef.current?.reset();
      }}
      className="border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm bg-white"
    >
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Goal Title</label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. Drink 2L water"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
          <input
            name="description"
            type="text"
            placeholder="Why this goal?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</label>
          <input
            name="deadline"
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recurrence</label>
          <select 
            name="recurrence"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="NONE">None</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Goal</label>
          <select 
            name="parentGoalId"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None (High-level goal)</option>
            {potentialParents.map(goal => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share with Groups</label>
        <div className="flex flex-wrap gap-2 py-1">
          {allUserLists.map(list => (
            <label key={list.id} className="flex items-center gap-2 text-xs font-medium bg-gray-50 hover:bg-indigo-50 border border-gray-200 px-2 py-1.5 rounded-lg cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                name="goalListIds" 
                value={list.id} 
                defaultChecked={list.id === goalListId}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {list.name}
            </label>
          ))}
        </div>
      </div>

      <FormButton>Add Goal</FormButton>
    </form>
  );
}
