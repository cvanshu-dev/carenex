import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) throw new Error("Missing GEMINI_API_KEY in environment");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    // --- Step 1: AI Diagnosis ---
    const systemPrompt = `
You are a medical symptom checker.
Respond with:
**Possible Diseases (Top 3):**
1. Disease – Probability%
2. Disease – Probability%
3. Disease – Probability%

**Primary Diagnosis:** One concise line  
**Recommended Next Step:** One sentence  
**Urgency Level:** Low / Moderate / High

At the end, also output this line in JSON:
{"keywords": ["disease or body part or specialty relevant terms"]}
`;

    const fullPrompt = `${systemPrompt}\n\nUser symptoms: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    // --- Step 2: Try to parse keywords JSON ---
    const keywordMatch = text.match(/\{[^}]*\}/g);
    let keywords: string[] = [];
    if (keywordMatch) {
      try {
        const parsed = JSON.parse(keywordMatch[keywordMatch.length - 1]);
        keywords = parsed.keywords || [];
      } catch {
        console.warn("Failed to parse keywords from AI output");
      }
    }

    // --- Step 3: Find doctors by specialty ---
    let doctors = [];
    if (keywords.length > 0) {
      doctors = await prisma.user.findMany({
        where: {
          role: "DOCTOR",
          verificationStatus: "VERIFIED",
          OR: keywords.map((kw) => ({
            specialty: { contains: kw, mode: "insensitive" },
          })),
        },
        select: {
          id: true,
          name: true,
          email: true,
          specialty: true,
          experience: true,
          description: true,
          imageUrl: true,
        },
        take: 5,
      });
    }

    // ✅ Must be inside the POST function — nowhere else
    return NextResponse.json({ text, doctors });
  } catch (error: any) {
    console.error("Gemini/Doctor Suggestion Error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
