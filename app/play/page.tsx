"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"

export default function PlayPage() {
  const [game, setGame] = useState(new Chess())
  const [skillLevel, setSkillLevel] = useState(5)
  const [userMove, setUserMove] = useState("")
  const [aiExplanation, setAiExplanation] = useState("")
  const [userAssessment, setUserAssessment] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  const makeMove = async () => {
    try {
      const move = game.move(userMove)
      if (!move) {
        setUserAssessment("Invalid move")
        return
      }

      setIsThinking(true)
      const response = await fetch("/api/stockfish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: game.fen(),
          skill_level: skillLevel,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      game.move(data.best_move)
      setGame(new Chess(game.fen()))
      setAiExplanation(data.explanation)
      setUserAssessment(data.assessment)
    } catch (error) {
      console.error("Move error:", error)
      setUserAssessment("Error processing move")
    } finally {
      setIsThinking(false)
      setUserMove("")
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Play Chess vs Stockfish</h1>

        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2">Stockfish Skill Level</h2>
          <Slider
            value={[skillLevel]}
            onValueChange={([value]) => setSkillLevel(value)}
            max={20}
            min={1}
            step={1}
            className="w-full max-w-xs"
          />
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
              <Chessboard position={game.fen()} boardWidth={600} />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">AI Move Explanation</h3>
              <p className="text-sm text-muted-foreground">{aiExplanation || "Make a move to see AI's explanation"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">User Move Assessment</h3>
              <p className="text-sm text-muted-foreground">{userAssessment || "Make a move to see assessment"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Input
            value={userMove}
            onChange={(e) => setUserMove(e.target.value)}
            placeholder="Your move (e.g., e2e4)"
            className="flex-1 max-w-xs"
            disabled={isThinking}
          />
          <Button onClick={makeMove} disabled={isThinking}>
            {isThinking ? "Thinking..." : "Make Move"}
          </Button>
        </div>
      </div>
    </div>
  )
}

