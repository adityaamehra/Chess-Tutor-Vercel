import { NextResponse } from "next/server"
import { Chess } from "chess.js"

// In-memory cache for puzzles
const puzzleCache: {
  [key: string]: any[]
} = {}

async function loadPuzzles(difficulty: string) {
  if (puzzleCache[difficulty]) {
    return puzzleCache[difficulty]
  }

  const fileMap = {
    easy: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/easy.csv",
    medium: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/medium.csv",
    hard: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/hard.csv",
  }

  const url = fileMap[difficulty as keyof typeof fileMap]
  const response = await fetch(url)
  const text = await response.text()

  // Parse CSV
  const rows = text.split("\n").slice(1) // Skip header
  const puzzles = rows.map((row) => {
    const [fen, moves, rating] = row.split(",")
    return {
      fen: fen.trim(),
      moves: moves.trim().split(" "),
      rating: Number.parseInt(rating.trim()),
    }
  })

  puzzleCache[difficulty] = puzzles
  return puzzles
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get("difficulty")?.toLowerCase() || "easy"

    const puzzles = await loadPuzzles(difficulty)
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)]

    // Initialize chess board with puzzle position
    const board = new Chess(puzzle.fen)

    // Make the first move to set up the puzzle
    if (puzzle.moves.length > 0) {
      board.move(puzzle.moves[0])
    }

    return NextResponse.json({
      fen: board.fen(),
      rating: puzzle.rating,
      remainingSolution: puzzle.moves.slice(1), // Remove the first move as it's already played
    });
  } catch (error) {
    console.error("Puzzle API Error:", error);
    return NextResponse.json({ error: "Failed to load puzzle" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { fen, move, remainingSolution } = await req.json();

    if (!fen || !move || !remainingSolution || !Array.isArray(remainingSolution)) {
      return NextResponse.json(
        { error: "Missing or invalid required parameters" },
        { status: 400 }
      );
    }
    const board = new Chess(fen);
    // Determine whether the user's move is legal.
    const legalMoves = board.moves({ verbose: true });
    const isLegal = legalMoves.some((m) => m.from + m.to === move);

    // The expected user move is the first element in the remaining solution array.
    const expectedUserMove = remainingSolution[0];
    const isCorrect = move === expectedUserMove;

    if (isLegal && isCorrect) {
      // Apply the user's move.
      board.move(move);
      // Remove the user's move from the solution array.
      remainingSolution.shift();

      // If a subsequent bot move exists, apply it automatically.
      if (remainingSolution.length > 0) {
        const botMove = remainingSolution[0];
        board.move(botMove);
        // Remove the bot move from the solution array.
        remainingSolution.shift();
      }
    }

    return NextResponse.json({
      fen: board.fen(),
      isLegal,
      isCorrect,
      remainingSolution,
    });
  } catch (error) {
    console.error("Puzzle verification error:", error)
    return NextResponse.json({ error: "Failed to verify move" }, { status: 500 })
  }
}
