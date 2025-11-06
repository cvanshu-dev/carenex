import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reminderId, minutes } = await req.json();
    if (!reminderId || !minutes)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const reminder = await prisma.medicineReminder.findUnique({ where: { id: reminderId } });
    if (!reminder || reminder.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const snoozedUntil = new Date(Date.now() + minutes * 60 * 1000);

    const updated = await prisma.medicineReminder.update({
      where: { id: reminderId },
      data: { snoozedUntil },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
