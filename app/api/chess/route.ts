import { NextResponse } from "next/server"
import Groq from 'groq-sdk';
import { Chess, Square } from "chess.js"

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// Helper function to clean LLM response
function clean(response: string) {
  return response.replace(/<think>[\s\S]*?<\/think>/g, "");
}


// Helper function to get move info from Stockfish API
async function getStockfishInfo(fen: string, depth = 15) {
  const url = "https://stockfish.online/api/s/v2.php"
  const params = new URLSearchParams({ fen, depth: depth.toString() })

  const response = await fetch(`${url}?${params}`)
  const data = await response.json()

  if (!data.success) {
    throw new Error(`API Error: ${data.data || "Unknown error"}`)
  }

  return {
    bestMove: data.bestmove.split(" ")[1],
    evaluation: data.evaluation,
    mate: data.mate,
    continuation: data.continuation,
  }
}

// Helper function to get evaluation string
function getEvalString(evaluation: number, mate: number | null) {
  if (mate !== null) {
    const side = mate > 0 ? "White" : "Black"
    return `Mate in ${Math.abs(mate)} moves for ${side}`
  } else {
    const side = evaluation >= 0 ? "white" : "black"
    return `${Math.abs(evaluation)} pawn advantage for ${side}`
  }
}

// Helper function to get move type
function getMoveType(fen: string, moveUci: string) {
  const board = new Chess(fen)
  const move = {
    from: moveUci.substring(0, 2),
    to: moveUci.substring(2, 4),
  }

  const piece = board.get(move.from as Square)
  const targetPiece = board.get(move.to as Square)

  if (!piece) return "Unknown move"

  const pieceType = piece.type.toUpperCase()

  if (moveUci === "e1g1" || moveUci === "e1c1" || moveUci === "e8g8" || moveUci === "e8c8") {
    if (pieceType === "K") return `Castling with the KING`
  }

  if (targetPiece) {
    return `Capturing the ${targetPiece.type.toUpperCase()} with ${pieceType}`
  }

  return `Move the piece ${pieceType}`
}

export async function POST(req: Request) {
  try {
    const { type, fen, move } = await req.json()

    switch (type) {
      case "analyze": {
        const info = await getStockfishInfo(fen)
        const moveType = getMoveType(fen, info.bestMove)
        const evaluation = getEvalString(info.evaluation, info.mate)

        const completion = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a top-tier chess coach. Analyze the given move concisely in 2-3 sentences. Use clear language and focus on key tactical and strategic elements. DO NOT USE MARKDOWN, tell why the move was played and if it was thinkable by a normal man or not.",
            },
            {
              role: "user",
              content: `Analyze this chess position where ${moveType} (${info.bestMove}) with evaluation: ${evaluation}`,
            },
          ],
          model: "deepseek-r1-distill-llama-70b",
        })

        return NextResponse.json({
          analysis: clean(completion.choices[0].message.content ?? ""),
          bestMove: info.bestMove,
          evaluation,
        })
      }

      case "chat": {
        const completion = await client.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a chess coach. Answer questions about chess clearly and concisely. INCLUDE ALL THE THINGS WHICH ARE DEEMED NECESSARY FOR A BEGINNER TO KNOW, IF THE THING IS NOT IN THE CHESS DOMAIN then DO NOT GIVE ANY RESPONSE.",
            },
            {
              role: "user",
              content: move,
            },
          ],
          model: "deepseek-r1-distill-llama-70b",
        })

        return NextResponse.json({
          response: clean(completion.choices[0].message.content ?? ""),
        })
      }

      default:
        return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Chess API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

