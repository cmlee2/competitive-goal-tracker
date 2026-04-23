import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export async function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
          GoalTracker
        </Link>
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
