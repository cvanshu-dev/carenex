import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  let user = null;

  try {
    user = await currentUser();
  } catch (err) {
    console.error("❌ Clerk currentUser() failed:", err);
    // Clerk will fail here if running on https://<local-ip>
    return null;
  }

  if (!user) return null;

  try {
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
      include: {
        transactions: {
          where: {
            type: "CREDIT_PURCHASE",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (loggedInUser) return loggedInUser;

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || "Anonymous User",
        imageUrl: user.imageUrl,
        email: user.emailAddresses?.[0]?.emailAddress || "unknown@example.com",
        transactions: {
          create: {
            type: "CREDIT_PURCHASE",
            packageId: "free_user",
            amount: 0,
          },
        },
      },
    });

    return newUser;
  } catch (err) {
    console.error("❌ DB user check failed:", err);
    return null;
  }
};
