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
    <nav className={cn(isCollapsed ? "w-16" : "w-64", "min-h-screen border-[#1e5850] border-r-4 rounded-lg bg-transparent transition-all")}>
      <div className={cn(isCollapsed ? "p-3" : "p-4")}>
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && <h2 className="text-lg font-semibold text-slate-200">Navigation</h2>}
          <button onClick={toggleCollapse} className={cn("group p-2 rounded hover:bg-muted transition-colors", isCollapsed ? "mx-auto" : "")}>
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-black" /> : <ChevronLeft className="w-4 h-4 text-slate-200 group-hover:text-black" />}
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
                  "group flex items-center gap-3 py-2 rounded-md text-sm text-slate-200 hover:bg-muted transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground border" : "", !isCollapsed ? "px-3":"justify-center"
                )}
              >
                <div className={cn("flex items-center min-w-6", isCollapsed ? "justify-center" : "")}>
                  <Icon className="w-4 h-4 text-slate-200 group-hover:text-black" />
                  {!isCollapsed && <span className="ml-3 text-slate-200 group-hover:text-black">{item.name}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
