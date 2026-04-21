"use client";

import { login } from "@/actions/auth";
import { FormButton } from "@/components/FormButton";
import Link from "next/link";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, formAction] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      return await login(formData);
    },
    undefined
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Sign in</h1>
        <form action={formAction} className="space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Username"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {state?.error && (
            <p className="text-red-600 text-sm">{state.error}</p>
          )}
          <FormButton>Sign in</FormButton>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500">
          No account?{" "}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
