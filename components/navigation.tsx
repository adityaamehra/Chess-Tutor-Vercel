"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageSquare, PuzzleIcon as PuzzlePiece, Swords } from "lucide-react"

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

  return (
    <nav className="w-64 min-h-screen border-r bg-muted/30">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

