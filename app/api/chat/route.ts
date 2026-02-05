import { NextResponse } from "next/server";
import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const chat_completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Use a valid Groq model
      messages: [
        {
          role: "system",
          content: "You are a top-tier chess coach with deep strategic and tactical mastery. Your task is to help users understand chess concepts, openings, and strategies.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({ response: chat_completion.choices[0].message.content });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}

