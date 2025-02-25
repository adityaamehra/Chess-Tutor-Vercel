// import { NextResponse } from "next/server"
// import { Chess } from "chess.js"

// // In-memory cache for puzzles
// const puzzleCache: {
//   [key: string]: any[]
// } = {}

// async function loadPuzzles(difficulty: string) {
//   if (puzzleCache[difficulty]) {
//     return puzzleCache[difficulty]
//   }

//   const fileMap = {
//     easy: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/easy.csv",
//     medium: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/medium.csv",
//     hard: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/hard.csv",
//   }

//   const url = fileMap[difficulty as keyof typeof fileMap]
//   const response = await fetch(url)
//   const text = await response.text()

//   // Parse CSV
//   const rows = text.split("\n").slice(1) // Skip header
//   const puzzles = rows.map((row) => {
//     const [fen, moves, rating] = row.split(",")
//     return {
//       fen: fen.trim(),
//       moves: moves.trim().split(" "),
//       rating: Number.parseInt(rating.trim()),
//     }
//   })

//   puzzleCache[difficulty] = puzzles
//   return puzzles
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const difficulty = searchParams.get("difficulty")?.toLowerCase() || "easy"

//     const puzzles = await loadPuzzles(difficulty)
//     const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)]

//     // Initialize chess board with puzzle position
//     const board = new Chess(puzzle.fen)

//     // Make the first move to set up the puzzle
//     if (puzzle.moves.length > 0) {
//       board.move(puzzle.moves[0])
//     }

//     return NextResponse.json({
//       fen: board.fen(),
//       rating: puzzle.rating,
//       moves: puzzle.moves.slice(1), // Remove the first move as it's already played
//     })
//   } catch (error) {
//     console.error("Puzzle API Error:", error)
//     return NextResponse.json({ error: "Failed to load puzzle" }, { status: 500 })
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const { fen, move, solution } = await req.json()

//     if (!fen || !move || !solution) {
//       return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
//     }

//     const board = new Chess(fen)
//     const isLegal = board.moves({ verbose: true }).some((m) => m.from + m.to === move)
//     const isCorrect = solution === move

//     return NextResponse.json({
//       isLegal,
//       isCorrect,
//     })
//   } catch (error) {
//     console.error("Puzzle verification error:", error)
//     return NextResponse.json({ error: "Failed to verify move" }, { status: 500 })
//   }
// }



import { NextResponse } from "next/server";
import { Chess } from "chess.js";

// In-memory cache for puzzles
const puzzleCache: {
    [key: string]: any[]
} = {}

/**
 * Loads puzzles from a remote CSV file according to the specified difficulty.
 * Caches the puzzles to obviate repeated network requests.
 */
async function loadPuzzles(difficulty: string) {
  if (puzzleCache[difficulty]) {
    return puzzleCache[difficulty];
  }

  const fileMap = {
    easy: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/easy.csv",
    medium: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/medium.csv",
    hard: "https://media.githubusercontent.com/media/adityaamehra/Chess-tutor/refs/heads/main/hard.csv",
  };

  const url = fileMap[difficulty as keyof typeof fileMap];
  const response = await fetch(url);
  const text = await response.text();

  // Parse CSV: skip header and process each row
  const rows = text.split("\n").slice(1);
  const puzzles = rows.map((row) => {
    const [fen, moves, rating] = row.split(",");
    return {
      fen: fen.trim(),
      // 'moves' is expected to be a space-separated string of moves.
      moves: moves.trim().split(" "),
      rating: parseInt(rating.trim(), 10),
    };
  });

  puzzleCache[difficulty] = puzzles;
  return puzzles;
}

/**
 * GET endpoint initializes a puzzle.
 * It applies the bot's first move from the solution array and returns:
 * - The updated FEN,
 * - The puzzle rating, and
 * - The remaining moves (i.e., expected user and bot moves).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty")?.toLowerCase() || "easy";

    const puzzles = await loadPuzzles(difficulty);
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

    // Initialize the chess board with the puzzle's FEN.
    const board = new Chess(puzzle.fen);

    // Apply the bot's first move to set up the puzzle.
    if (puzzle.moves.length > 0) {
      board.move(puzzle.moves[0]);
    }

    // Return the updated board FEN, puzzle rating, and the remaining moves.
    return NextResponse.json({
      fen: board.fen(),
      rating: puzzle.rating,
      // The first move is already played; the remaining moves are expected.
      remainingSolution: puzzle.moves.slice(1),
    });
  } catch (error) {
    console.error("Puzzle API Error:", error);
    return NextResponse.json(
      { error: "Failed to load puzzle" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint validates the user's move and automatically applies the subsequent bot move.
 * Expected input payload:
 * {
 *   fen: string,              // The current board position in FEN notation.
 *   move: string,             // The user's move in UCI format (e.g., "e2e4").
 *   remainingSolution: string[]  // Array of remaining moves (alternating: user's then bot's).
 * }
 *
 * On successful validation:
 * - Applies the user's move,
 * - If available, applies the next move (bot's move),
 * - Returns the updated board FEN along with booleans indicating move validity and correctness,
 * - And the updated remaining solution array.
 */
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
    console.error("Puzzle verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify move" },
      { status: 500 }
    );
  }
}
