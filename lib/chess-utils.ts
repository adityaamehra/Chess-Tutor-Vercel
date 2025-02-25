import type { Chess, Square } from "chess.js"

export async function getStockfishMove(fen: string, depth = 15) {
  const url = "https://stockfish.online/api/s/v2.php"
  const params = new URLSearchParams({ fen, depth: depth.toString() })

  const response = await fetch(`${url}?${params}`)
  const data = await response.json()

  if (!data.success) {
    throw new Error(`Stockfish API Error: ${data.data || "Unknown error"}`)
  }

  if (!data.bestmove) {
    throw new Error("No best move returned from Stockfish")
  }

  return {
    bestMove: data.bestmove.split(" ")[1],
    evaluation: data.evaluation,
    mate: data.mate,
  }
}

export function getMoveDescription(board: Chess, move: string) {
  const from = move.substring(0, 2)
  const to = move.substring(2, 4)

  const piece = board.get(from as Square)
  const targetPiece = board.get(to as Square)

  if (!piece) return "Unknown move"

  const pieceType = piece.type.toUpperCase()

  // Check for castling
  if ((move === "e1g1" || move === "e1c1" || move === "e8g8" || move === "e8c8") && pieceType === "K") {
    return `Castling with the KING`
  }

  // Check for capture
  if (targetPiece) {
    return `Capturing the ${targetPiece.type.toUpperCase()} with ${pieceType}`
  }

  return `Move the piece ${pieceType}`
}

export function getEvaluationString(evaluation: number, mate: number | null) {
  if (mate !== null) {
    const side = mate > 0 ? "White" : "Black"
    return `Mate in ${Math.abs(mate)} moves for ${side}`
  }

  const side = evaluation >= 0 ? "white" : "black"
  return `${Math.abs(evaluation)} pawn advantage for ${side}`
}

export async function analyzeMoveWithAI(fen: string, move: string, evaluation: string) {
  const response = await fetch("/api/chess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "analyze",
      fen,
      move,
      evaluation,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze move")
  }

  return response.json()
}

export async function userMoveAssessment(fen: string, move: string, evaluation: string) {
  const response = await fetch("/api/chess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "assessment user",
      fen,
      move,
      evaluation,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze move")
  }

  return response.json()
}