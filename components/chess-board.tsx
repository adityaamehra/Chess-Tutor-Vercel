"use client"

import { useEffect, useState } from "react"
import { Chessboard } from "react-chessboard"
import { Chess } from "chess.js"

interface ChessBoardProps {
  position?: string
  onMove?: (move: { from: string; to: string }) => void
  orientation?: "white" | "black"
  draggable?: boolean
}

export function ChessBoard({ position = "start", onMove, orientation = "white", draggable = true }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess(position))

  useEffect(() => {
    setGame(new Chess(position))
  }, [position])

  function makeMove(move: { from: string; to: string }) {
    try {
      const result = game.move({
        from: move.from,
        to: move.to,
        promotion: "q", // Always promote to queen for simplicity
      })

      if (result) {
        setGame(new Chess(game.fen()))
        if (onMove) onMove(move)
        return true
      }
    } catch (error) {
      console.error("Invalid move:", error)
    }
    return false
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Chessboard
        position={game.fen()}
        onPieceDrop={(from, to) => makeMove({ from, to })}
        boardOrientation={orientation}
        arePiecesDraggable={draggable}
      />
    </div>
  )
}

