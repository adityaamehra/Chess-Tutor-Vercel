"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, PuzzleIcon as PuzzlePiece, Swords, ChevronLeft, ChevronRight } from "lucide-react"

const navigation = [
  {
    name: "AI Chatbot",
    href: "/",
    icon: MessageSquare,
  },
  {
    name: "Puzzles",
    href: "/puzzles",
    icon: PuzzlePiece,
  },
  {
    name: "Play Chess",
    href: "/play",
    icon: Swords,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <nav className={cn(isCollapsed ? "w-24" : "w-64", "min-h-screen border-r bg-muted/30 transition-all")}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && <h2 className="text-lg font-semibold">Navigation</h2>}
          <button onClick={toggleCollapse} className="p-2 rounded hover:bg-muted transition-colors">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
