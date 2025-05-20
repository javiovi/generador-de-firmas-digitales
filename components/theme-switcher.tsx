"use client"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop } from "lucide-react"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-2 items-center">
      <button
        className={`p-2 rounded ${theme === "light" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100"}`}
        onClick={() => setTheme("light")}
        aria-label="Modo claro"
      >
        <Sun size={18} />
      </button>
      <button
        className={`p-2 rounded ${theme === "dark" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100"}`}
        onClick={() => setTheme("dark")}
        aria-label="Modo oscuro"
      >
        <Moon size={18} />
      </button>
      <button
        className={`p-2 rounded ${theme === "system" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100"}`}
        onClick={() => setTheme("system")}
        aria-label="Usar tema del sistema"
      >
        <Laptop size={18} />
      </button>
    </div>
  )
}
