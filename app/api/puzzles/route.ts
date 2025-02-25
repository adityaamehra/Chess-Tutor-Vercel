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
      moves: puzzle.moves.slice(1), // Remove the first move as it's already played
    })
  } catch (error) {
    console.error("Puzzle API Error:", error)
    return NextResponse.json({ error: "Failed to load puzzle" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { fen, move, solution } = await req.json()

    if (!fen || !move || !solution) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const board = new Chess(fen)
    const isLegal = board.moves({ verbose: true }).some((m) => m.from + m.to === move)
    const isCorrect = solution === move

    return NextResponse.json({
      isLegal,
      isCorrect,
    })
  } catch (error) {
    console.error("Puzzle verification error:", error)
    return NextResponse.json({ error: "Failed to verify move" }, { status: 500 })
  }
}

