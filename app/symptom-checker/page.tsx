"use client";
import { useState } from "react";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResults([]);

    const symptoms = input.split(",").map(s => s.trim());
    const res = await fetch("/api/symptom-checker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });

    const data = await res.json();
    setLoading(false);
    if (data.results) setResults(data.results);
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 border rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">🩺 Symptom Checker</h1>
      <p className="text-gray-500 mb-2">Enter symptoms separated by commas (e.g. fever, cough, headache)</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Checking..." : "Check"}
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Possible Diseases:</h2>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className="p-2 border rounded flex justify-between">
                <span>{r.disease}</span>
                <span className="text-gray-600">{r.probability}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
