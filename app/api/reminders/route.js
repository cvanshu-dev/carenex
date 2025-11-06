import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// /app/api/reminders/route.js (GET function)

export async function GET(req) {
  console.log("➡️ GET /api/reminders hit");
  try {
    const { userId: clerkUserId } = getAuth(req); // 💡 Rename for clarity

    if (!clerkUserId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // ➡️ Find the user's internal DB UUID using the Clerk ID
    const user = await db.user.findUnique({
      where: { clerkUserId: clerkUserId },
      select: { id: true },
    });

    // Handle case where user exists in Clerk but not yet in your DB
    if (!user) {
      console.warn("User not found in DB for Clerk ID:", clerkUserId);
      return NextResponse.json([]); 
    }

    const reminders = await db.medicineReminder.findMany({
      where: { userId: user.id }, // 💡 USE THE DB'S UUID (user.id)
      orderBy: { nextRunAt: "asc" },
    });

    return NextResponse.json(reminders);
  } catch (err) {
    // ...
  }
}

// /app/api/reminders/route.js (POST function)

// /app/api/reminders/route.js (POST function)

export async function POST(req) {
  console.log("➡️ POST /api/reminders hit");
  try {
    const { userId: clerkUserId } = getAuth(req); // 💡 Rename for clarity
    
    if (!clerkUserId)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // ➡️ Find the user's internal DB UUID using the Clerk ID
    const user = await db.user.findUnique({
      where: { clerkUserId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      console.error("User profile missing in DB for Clerk ID:", clerkUserId);
      return NextResponse.json({ error: "User profile setup incomplete" }, { status: 404 });
    }

    const body = await req.json();
    const { medicine, time } = body;
    if (!medicine || !time)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const nextRunAt = new Date(time);
    if (isNaN(nextRunAt.getTime()))
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });

    const newReminder = await db.medicineReminder.create({
      data: {
        userId: user.id, // 💡 USE THE DB'S UUID (user.id)
        medicine, 
        timeOfDay: nextRunAt.toISOString().slice(11, 16),
        timezone: "UTC",
        repeat: "daily",
        nextRunAt,
      },
    });

    // ... (rest of the code)
    return NextResponse.json(newReminder);
  } catch (err) {
    // ...
  }
}