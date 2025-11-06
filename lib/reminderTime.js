// lib/reminderTime.js
import { DateTime } from "luxon";

/**
 * Given timeOfDay "HH:mm", timezone string, repeat, weekdays CSV (optional),
 * compute the next run Date (in UTC) strictly after "now".
 */
export function computeNextRun(timeOfDay, timezone = "UTC", repeat = "daily", weekdaysCsv) {
  const [hh, mm] = timeOfDay.split(":").map(Number);
  const nowTz = DateTime.now().setZone(timezone);

  // candidate today at hh:mm in user's timezone
  let candidate = nowTz.set({ hour: hh, minute: mm, second: 0, millisecond: 0 });

  if (repeat === "daily") {
    if (candidate <= nowTz) candidate = candidate.plus({ days: 1 });
    return candidate.toUTC().toJSDate();
  }

  if (repeat === "weekly") {
    if (!weekdaysCsv) throw new Error("weekdays required for weekly repeat");
    const weekdays = weekdaysCsv.split(",").map(d => d.trim().toLowerCase()); // e.g., ["mon","wed"]

    // map luxon weekday numbers: mon=1..sun=7
    const nameToNum = { mon:1,tue:2,wed:3,thu:4,fri:5,sat:6,sun:7 };

    // find next occurrence among allowed weekdays
    for (let add = 0; add < 14; add++) {
      const cand = candidate.plus({ days: add });
      const candName = Object.keys(nameToNum).find(k => nameToNum[k] === cand.weekday);
      if (weekdays.includes(candName)) {
        if (cand > nowTz) return cand.toUTC().toJSDate();
        // if equal or <= now continue searching
      }
    }
    // fallback: next week same day
    return candidate.plus({ days: 7 }).toUTC().toJSDate();
  }

  // CUSTOM: for now fallback to daily
  if (candidate <= nowTz) candidate = candidate.plus({ days: 1 });
  return candidate.toUTC().toJSDate();
}
