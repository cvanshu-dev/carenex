"use client";

import { useState } from "react";
import { DoctorCard } from "../(main)/doctors/components/doctor-card";

 // adjust import path if different

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!symptoms.trim()) {
      alert("Please enter your symptoms first.");
      return;
    }

    setLoading(true);
    setResponse("");
    setDoctors([]);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: symptoms }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResponse(data.text);
      setDoctors(data.doctors || []);
    } catch (err: any) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">AI Symptom Checker</h1>

      <textarea
        className="w-full p-3 border rounded-md bg-gray-900 text-white border-fuchsia-900/40 focus:ring-fuchsia-500"
        rows={5}
        placeholder="Describe your symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      <button
        onClick={handleCheck}
        disabled={loading}
        className="bg-fuchsia-600 text-white px-4 py-2 rounded-md hover:bg-fuchsia-700 transition-all"
      >
        {loading ? "Analyzing..." : "Check Symptoms"}
      </button>

      {response && (
        <div className="mt-4 p-4 bg-gray-800 border border-fuchsia-900/30 rounded-md whitespace-pre-wrap text-gray-100">
          {response}
        </div>
      )}

      {doctors.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-white">Recommended Doctors</h2>
          <div className="grid gap-4">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
