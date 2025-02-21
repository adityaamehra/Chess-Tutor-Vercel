import { NextResponse } from "next/server";
import stockfish from "stockfish";
import dotenv from 'dotenv';
dotenv.config();

const engine = stockfish();
engine.onmessage = (event) => console.log(event);

export async function POST(req: Request) {
  try {
    const { fen, skill_level } = await req.json();

    engine.postMessage(`setoption name Skill Level value ${skill_level}`);
    engine.postMessage(`position fen ${fen}`);
    engine.postMessage("go movetime 1000");

    const best_move = await new Promise((resolve) => {
      engine.onmessage = (event) => {
        if (event.includes("bestmove")) {
          resolve(event.split(" ")[1]);
        }
      };
    });

    const evaluation = await new Promise((resolve) => {
      engine.onmessage = (event) => {
        if (event.includes("info depth")) {
          resolve(event);
        }
      };
    });

    return NextResponse.json({ best_move, evaluation });
  } catch (error) {
    console.error("Stockfish API Error:", error);
    return NextResponse.json({ error: "Failed to process move" }, { status: 500 });
  }
}