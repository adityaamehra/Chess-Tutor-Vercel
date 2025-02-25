import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fen, skill_level } = await req.json();

    // Validate that skill_level (used as depth) is a number and is less than 16.
    if (typeof skill_level !== "number" || skill_level >= 16) {
      return NextResponse.json(
        { success: false, error: "Invalid skill_level; it must be a number less than 16." },
        { status: 400 }
      );
    }

    // Define the external API endpoint using an environment variable.
    const apiUrl = process.env.STOCKFISH_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, error: "STOCKFISH_API_URL is not defined." },
        { status: 500 }
      );
    }

    // Send a POST request to the external API with the required parameters.
    const externalResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, depth: skill_level })
    });

    // Parse the response from the external API.
    const apiData = await externalResponse.json();

    // Extract only the desired keys.
    const { bestmove, eval: evaluation } = apiData;

    // Return a new JSON object containing only best_move and evaluation.
    return NextResponse.json({ bestmove, evaluation });
  } catch (error) {
    console.error("Stockfish API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process move" },
      { status: 500 }
    );
  }
}
