"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck() {
    if (!symptoms.trim()) {
      setError("Please enter your symptoms first.");
      return;
    }
    if (symptoms.length > 1000) {
      setError("Please keep it under 1000 characters.");
      return;
    }

    setError("");
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: symptoms }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Unknown error");
      setResponse(data.text);
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">AI Symptom Checker</h1>

      <Textarea
        rows={5}
        placeholder="Describe your symptoms here..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        onClick={handleCheck}
        disabled={loading}
        className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" /> Checking...
          </>
        ) : (
          "Check Symptoms"
        )}
      </Button>

      {response && (
        <div className="mt-4 p-3 bg-gray-900 border border-gray-700 rounded-md whitespace-pre-wrap max-h-64 overflow-y-auto">
          {response}
        </div>
      )}
    </div>
  );
}
