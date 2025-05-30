"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ChessBoard } from "@/components/chess-board"
import { Chess } from "chess.js"

export default function PuzzlesPage() {
  const [difficulty, setDifficulty] = useState("easy")
  const [game, setGame] = useState(new Chess())
  const [puzzleRating, setPuzzleRating] = useState(0)
  const [userMove, setUserMove] = useState("")
  const [message, setMessage] = useState("")
  const [solution, setSolution] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  // Track board orientation; default to white
  const [orientation, setOrientation] = useState<"white" | "black">("white")

  const loadPuzzle = useCallback(async () => {
    try {
      const response = await fetch(`/api/puzzles?difficulty=${difficulty}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const newGame = new Chess()
      newGame.load(data.fen)
      setGame(newGame)
      setPuzzleRating(data.rating)
      setSolution(data.moves)
      setCurrentMoveIndex(0)
      setMessage("")
      // Update board orientation based on whose turn it is
      setOrientation(newGame.turn() === "w" ? "white" : "black")
    } catch (error) {
      console.error("Failed to load puzzle:", error)
      setMessage("Failed to load puzzle. Please try again.")
    }
  }, [difficulty])

  useEffect(() => {
    loadPuzzle()
  }, [loadPuzzle])

  const handleMove = async (moveString: string) => {
    try {
      // Try applying the move string to the current game state
      const move = game.move(moveString)
      if (!move) {
        setMessage("Invalid move")
        return
      }

      const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: game.fen(),
          move: moveString,
          solution: solution[currentMoveIndex],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.isCorrect) {
        if (currentMoveIndex === solution.length - 1) {
          setMessage("Puzzle solved! Loading next puzzle...")
          setTimeout(loadPuzzle, 1500)
        } else {
          // Increase the index by 2 (user move + opponent move)
          setCurrentMoveIndex(currentMoveIndex + 2)
          const opponentMove = solution[currentMoveIndex + 1]
          game.move(opponentMove)
          setGame(new Chess(game.fen()))
          setMessage("Correct move! Continue solving.")
        }
      } else {
        setMessage("Incorrect move. Try again!")
        game.undo()
        setGame(new Chess(game.fen()))
      }
      // Update board orientation after move
      // setOrientation(game.turn() === "w" ? "white" : "black")
    } catch (error) {
      console.error("Move verification error:", error)
      setMessage(`Error verifying move: ${
        error instanceof Error ? error.message : "Unknown error"
      }`)
    }
    setUserMove("")
  }

  const giveHint = () => {
    if (solution[currentMoveIndex]) {
      setMessage(`Hint: ${solution[currentMoveIndex]}`)
    } else {
      setMessage("No more hints available.")
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl font-bold text-white">♙</span>
          <h1 className="text-2xl font-bold text-slate-200">Chess Puzzle Solver</h1>
        </div>

        <div className="flex justify-between">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-slate-200">Select Difficulty</h2>
            <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex gap-4">
              <div className="flex items-center space-x-2 text-slate-200">
                <RadioGroupItem value="easy" id="easy" className="text-slate-200 border-slate-200" />
                <Label htmlFor="easy" className="text-slate-200">Easy</Label>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <RadioGroupItem value="medium" id="medium" className="text-slate-200 border-slate-200" />
                <Label htmlFor="medium" className="text-slate-200">Medium</Label>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <RadioGroupItem value="hard" id="hard" className="text-slate-200 border-slate-200" />
                <Label htmlFor="hard" className="text-slate-200">Hard</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="mb-4 text-right">
              <h3 className="text-lg font-semibold text-slate-200">Puzzle Rating: {puzzleRating}</h3>
              <h3 className="text-xl font-bold text-slate-200">{game.turn() === "w" ? "White to move" : "Black to move"}</h3>
            </div>
        </div>
        <Card className="mb-6">
          <CardContent className="p-4">
            
            <ChessBoard
              position={game.fen()}
              orientation={orientation}
              onMove={(move) => {
                setUserMove(`${move.from}${move.to}`)
                handleMove(`${move.from}${move.to}`)
              }}
            />
          </CardContent>
        </Card>

        {message && (
          <div
            className={`mb-4 p-2 rounded ${
              message.includes("Correct") || message.includes("solved")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={userMove}
            onChange={(e) => setUserMove(e.target.value)}
            placeholder="Enter your move (e.g., e2e4)"
            className="flex-1"
          />
          <span className="border-white border rounded-md">
            <Button onClick={() => handleMove(userMove)}>Submit Move</Button>
          </span>
          <Button variant="outline" onClick={giveHint}>
            Give Hint
          </Button>
          <Button variant="outline" onClick={loadPuzzle}>
            Next Puzzle
          </Button>
        </div>
      </div>
    </div>
  )
}
