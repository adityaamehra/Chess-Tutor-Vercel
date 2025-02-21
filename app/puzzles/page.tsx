"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"

export default function PuzzlesPage() {
  const [difficulty, setDifficulty] = useState("easy")
  const [game, setGame] = useState(new Chess())
  const [puzzleRating, setPuzzleRating] = useState(0)
  const [userMove, setUserMove] = useState("")
  const [message, setMessage] = useState("")

  const loadPuzzle = useCallback(async () => {
    try {
      const response = await fetch(`/api/puzzles?difficulty=${difficulty}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const newGame = new Chess()
      newGame.load(data.fen)
      setGame(newGame)
      setPuzzleRating(data.rating)
      setMessage("")
    } catch (error) {
      console.error("Failed to load puzzle:", error)
      setMessage("Failed to load puzzle. Please try again.")
    }
  }, [difficulty])

  useEffect(() => {
    loadPuzzle()
  }, [loadPuzzle])

  const handleMove = async () => {
    try {
      const move = game.move(userMove)
      if (!move) {
        setMessage("Invalid move")
        return
      }

      const response = await fetch("/api/puzzles/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: game.fen(),
          move: userMove,
          difficulty,
        }),
      })

      const data = await response.json()
      if (data.correct) {
        setMessage("Correct move!")
        setTimeout(loadPuzzle, 1500)
      } else {
        setMessage("Incorrect move. Try again!")
        game.undo()
        setGame(new Chess(game.fen()))
      }
    } catch (error) {
      console.error("Move verification error:", error)
      setMessage("Error verifying move")
    }
    setUserMove("")
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">♟️</span>
          <h1 className="text-2xl font-bold">Chess Puzzle Solver</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Select Difficulty</h2>
          <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy">Easy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard">Hard</Label>
            </div>
          </RadioGroup>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Puzzle Rating: {puzzleRating}</h3>
            </div>
            <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
              <Chessboard position={game.fen()} boardWidth={600} />
            </div>
          </CardContent>
        </Card>

        {message && (
          <div
            className={`mb-4 p-2 rounded ${
              message.includes("Correct") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
          <Button onClick={handleMove}>Submit Move</Button>
          <Button variant="outline" onClick={loadPuzzle}>
            Next Puzzle
          </Button>
        </div>
      </div>
    </div>
  )
}

