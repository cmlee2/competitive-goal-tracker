"use client";

import { useFormStatus } from "react-dom";

export function FormButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium cursor-pointer"
      }
    >
      {pending ? "..." : children}
    </button>
  );
}
