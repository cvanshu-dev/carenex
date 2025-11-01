import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();
    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "data", "Symptom2Disease.csv");
    const file = fs.readFileSync(filePath, "utf8");

    const { data } = Papa.parse(file, { header: true });
    
    // Score diseases based on symptom match count
    const scores: Record<string, number> = {};
    for (const row of data) {
      const disease = row.Disease?.trim();
      if (!disease) continue;

      const diseaseSymptoms = Object.values(row)
        .map(v => (v ? v.toString().toLowerCase().trim() : ""))
        .filter(v => v && v !== disease.toLowerCase());

      let matchCount = 0;
      for (const symptom of symptoms) {
        if (diseaseSymptoms.includes(symptom.toLowerCase())) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        scores[disease] = (scores[disease] || 0) + matchCount;
      }
    }

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const probabilities = Object.entries(scores)
      .map(([disease, score]) => ({
        disease,
        probability: ((score / total) * 100).toFixed(2),
      }))
      .sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability))
      .slice(0, 5); // top 5 probable diseases

    return NextResponse.json({ results: probabilities });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
