import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} else {
  console.warn("⚠️ Warning: GROQ_API_KEY is not defined in backend .env");
}

export async function askAI(prompt) {
  if (!groq) {
    console.error("❌ Groq API client is not initialized due to missing API Key.");
    throw new Error("AI Service is temporarily unavailable.");
  }
  
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });
    const text = completion.choices[0]?.message?.content || "";
    console.log("🤖 AI raw:", text);
    return text;
  } catch (err) {
    console.error("Groq API Call Error:", err.message);
    throw err;
  }
}