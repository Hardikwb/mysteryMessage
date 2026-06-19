import config from "@/lib/config";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextResponse } from "next/server";

const groq = createGroq({
  apiKey: config.GROQ_API_KEY,
});

export const runtime = "edge";

export async function GET() {
  try {
    const systemPrompt =
      "You are a helpful assistant that generates engaging, open-ended questions for an anonymous social messaging platform. Your output must be a single string containing exactly three questions separated by '||', with no other text, numbering, or conversational filler.";
    const userPrompt =
      "Create a list of three open-ended and engaging questions suitable for a diverse audience. Focus on universal themes that encourage friendly interaction and avoid personal or sensitive topics. Example format: 'Question 1||Question 2||Question 3'.";

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    if (error instanceof Error && "status" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as { status?: number }).status ?? 500 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
