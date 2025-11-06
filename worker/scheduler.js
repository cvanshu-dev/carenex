import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { computeNextRun } from "../lib/reminderTime.js";

const prisma = new PrismaClient();

async function sendReminder(reminder) {
  console.log(`🔔 Reminder: Take ${reminder.medicineName}`);
  // TODO: integrate Vonage SMS or Email logic
}

async function checkReminders() {
  const now = new Date();
  const due = await prisma.medicineReminder.findMany({
    where: {
      OR: [
        { nextRunAt: { lte: now } },
        { snoozedUntil: { lte: now } },
      ],
    },
  });

  for (const r of due) {
    await sendReminder(r);
    const next = computeNextRun(r.timeOfDay, r.timezone, r.repeat, r.weekdays);
    await prisma.medicineReminder.update({
      where: { id: r.id },
      data: { nextRunAt: next, snoozedUntil: null, isTaken: false },
    });
  }
}

// run every minute
cron.schedule("* * * * *", checkReminders);
console.log("⏱️ Reminder scheduler running every minute...");
