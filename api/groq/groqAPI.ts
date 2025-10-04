import Constants from "expo-constants";

const GROQ_API_KEY = Constants.expoConfig?.extra?.GROQ_API_KEY as string;

export const generateProfileSummary = async (
  name: string,
  skills: string,
  tone: string = "professional",
  focus: string = "resume"
): Promise<string> => {
  // --- Build the prompt dynamically ---
  const systemPrompt = `
You are an expert profile writer and AI prompt engineer. Your goal is to generate first-person professional summaries (650–750 characters) that sound confident, natural, and tailored to the user’s skills and goals.
  `;

  const userPrompt = `
Write a concise professional profile summary about myself in first-person point of view, around 500–600 characters long. 
My name is ${name} and my skills include ${skills}. The tone should be ${tone}, suitable for ${focus} purposes. 
Highlight my strengths, work ethic, and personality naturally — avoid robotic or generic phrasing. 
Keep it positive, confident, and authentic.
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      throw new Error(data?.error?.message || "Groq API request failed");
    }

    return data.choices?.[0]?.message?.content?.trim() || "No response from Groq API.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Error generating profile summary.";
  }
};
