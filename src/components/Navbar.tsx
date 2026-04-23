import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
          GoalTracker
        </Link>
        {session?.user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.name}</span>
            <button
              onClick={async () => {
                const { signOut } = await import("next-auth/react");
                await signOut({ callbackUrl: "/login" });
              }}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
