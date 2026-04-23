import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Lazy Sync Logic: If user is in Clerk but not in Neon, create them.
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || clerkUser.username || "New User",
          email: clerkUser.emailAddresses[0]?.emailAddress,
          username: clerkUser.username,
        }
      });
    } else {
      throw new Error("Clerk user data not found during sync");
    }
  }

  return user as { id: string; name: string; email: string };
}
