import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

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
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
