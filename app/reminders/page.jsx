"use client";
import { useState, useEffect } from "react";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RemindersClient() {
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [medicine, setMedicine] = useState("");
  const [time, setTime] = useState("");

  const fetchReminders = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/reminders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load reminders");
      const data = await res.json();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reminders");
    }
  };

  const addReminder = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicine, time }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMedicine("");
      setTime("");
      toast.success("Reminder added!");
      fetchReminders();
    } catch (err) {
      console.error(err);
      toast.error("Could not add reminder");
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  return (
    <>
      <SignedIn>
        <div className="p-8 max-w-lg mx-auto space-y-6">
          <h2 className="text-2xl font-semibold">Medicine Reminders</h2>

          <div className="space-y-2">
            <input
              className="w-full rounded p-2 bg-muted"
              placeholder="Medicine name"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full rounded p-2 bg-muted"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Button onClick={addReminder}>Add Reminder</Button>
          </div>

          <div className="space-y-3">
            {reminders.length === 0 && (
              <p className="text-gray-500">No reminders yet.</p>
            )}
            {reminders.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p>{r.medicineName}</p>
                    <p className="text-xs text-gray-400">
                      Time: {r.timeOfDay}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="p-8 text-center">
          Please{" "}
          <Link href="/sign-in" className="text-fuchsia-600">
            sign in
          </Link>{" "}
          to view your reminders.
        </div>
      </SignedOut>
    </>
  );
}
