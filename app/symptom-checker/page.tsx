"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea"

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!symptoms.trim()) {
      alert("Please enter your symptoms first.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: symptoms }), // ✅ important
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResponse(data.text);
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI Symptom Checker</h1>

      <textarea
        className="w-full p-3 border rounded-md"
        rows={5}
        placeholder="Describe your symptoms here..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
      />

      <button
        onClick={handleCheck}
        disabled={loading}
        className="bg-fuchsia-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Checking..." : "Check Symptoms"}
      </button>

      {response && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  );
}
