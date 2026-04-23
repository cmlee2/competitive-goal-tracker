"use client";

import { createGoal } from "@/actions/goals";
import { FormButton } from "@/components/FormButton";
import { useRef, useState } from "react";

export function AddGoalForm({ 
  goalListId, 
  potentialParents,
  allUserLists,
  defaultMode = "LONG_TERM"
}: { 
  goalListId?: string, 
  potentialParents: { id: string, title: string }[],
  allUserLists: { id: string, name: string }[],
  defaultMode?: "LONG_TERM" | "SHORT_TERM"
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isShared, setIsShared] = useState(false);
  const [mode, setMode] = useState(defaultMode);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => setMode("LONG_TERM")}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
            mode === "LONG_TERM" ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
          }`}
        >
          Long-Term Goal
        </button>
        <button 
          onClick={() => setMode("SHORT_TERM")}
          className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${
            mode === "SHORT_TERM" ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
          }`}
        >
          Short-Term Goal
        </button>
      </div>

      <form
        ref={formRef}
        action={async (formData: FormData) => {
          await createGoal(formData);
          formRef.current?.reset();
          setIsShared(false);
        }}
        className="border border-gray-100 rounded-[24px] p-6 space-y-5 shadow-xl shadow-gray-100/50 bg-white"
      >
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {mode === "LONG_TERM" ? "High-Level Vision" : "Quick Win / Task Title"}
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder={mode === "LONG_TERM" ? "e.g. Run a Marathon" : "e.g. 5km morning run"}
            className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 placeholder:text-gray-300 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Date (Optional)</label>
            <input
              name="deadline"
              type="date"
              className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 transition-all"
            />
          </div>
          {mode === "SHORT_TERM" && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link to Long-Term Goal (Optional)</label>
              <select 
                name="parentGoalId"
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 transition-all"
              >
                <option value="">No connection</option>
                {potentialParents.map((goal: any) => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </div>
          )}
          {mode === "LONG_TERM" && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recurrence</label>
              <select 
                name="recurrence"
                className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 transition-all"
              >
                <option value="NONE">One-time</option>
                <option value="DAILY">Daily Habit</option>
                <option value="WEEKLY">Weekly Habit</option>
                <option value="MONTHLY">Monthly Habit</option>
              </select>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-gray-50 pt-5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility & Circles</label>
          
          <div className="flex flex-wrap gap-2">
            {allUserLists.map((list: any) => (
              <label key={list.id} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-xl cursor-pointer transition-all border border-transparent hover:border-indigo-100">
                <input 
                  type="checkbox" 
                  name="goalListIds" 
                  value={list.id} 
                  defaultChecked={list.id === goalListId}
                  className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                {list.name}
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-black text-gray-700 cursor-pointer group">
              <input 
                type="checkbox" 
                name="isShared"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 transition-all group-hover:scale-110"
              />
              <span className="flex flex-col">
                <span>Shared Group Goal</span>
                <span className="text-[10px] text-gray-400 font-medium">Anyone in the selected circles can contribute</span>
              </span>
            </label>

            {isShared && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Target Value</label>
                  <input
                    name="targetMetric"
                    type="number"
                    placeholder="e.g. 100"
                    className="w-full bg-white border-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Unit</label>
                  <input
                    name="unit"
                    type="text"
                    placeholder="e.g. miles"
                    className="w-full bg-white border-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <FormButton>
          Create {mode === "LONG_TERM" ? "Long-Term" : "Short-Term"} Goal
        </FormButton>
      </form>
    </div>
  );
}
