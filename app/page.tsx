"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setInput("")

    try {
      const response = await fetch("/api/chess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          move: userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-8 h-8 text-slate-200" />
          <h1 className="text-2xl font-bold text-slate-200">Chess Tutor AI</h1>
        </div>

        <Card className="mb-4 min-h-[400px]">
          <CardContent className="p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 border text-slate-200 border-slate-200 bg-transparent`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="text-slate-200 border-slate-200 border bg-transparent rounded-lg px-4 py-2">
                  <ReactMarkdown>Thinking...</ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about chess openings, strategies, or analyze positions..."
            disabled={isLoading}
            className="flex-1"
          />
          <span className="border-slate-200 border rounded-md">
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </span>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Try these commands:</p>
          <ul className="list-disc list-inside mt-2">
            <li>
              <code>FEN &lt;position&gt;</code> - Analyze a specific position
            </li>
            <li>
              <code>Opening &lt;name&gt;</code> - Learn about an opening
            </li>
            <li>Or ask any chess-related question!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
