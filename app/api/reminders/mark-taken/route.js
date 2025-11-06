import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { computeNextRun } from "@/lib/reminderTime";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reminderId, markTaken } = await req.json();
    if (!reminderId) return NextResponse.json({ error: "Missing reminderId" }, { status: 400 });

    const reminder = await prisma.medicineReminder.findUnique({ where: { id: reminderId } });
    if (!reminder || reminder.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const nextRunAt = computeNextRun(reminder.timeOfDay, reminder.timezone, reminder.repeat, reminder.weekdays);

    const updated = await prisma.medicineReminder.update({
      where: { id: reminderId },
      data: { isTaken: markTaken, nextRunAt },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
