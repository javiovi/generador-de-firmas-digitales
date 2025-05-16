"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface RippleProps {
  x: number
  y: number
  size: number
}

export function ButtonRipple({
  children,
  className,
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<RippleProps[]>([])

  useEffect(() => {
    // Limpia los ripples después de que se completen las animaciones
    const timeout = setTimeout(() => {
      if (ripples.length > 0) {
        setRipples([])
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [ripples])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = e.currentTarget
    const rect = button.getBoundingClientRect()

    // Calcula la posición del click relativa al botón
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calcula el tamaño del ripple (debe ser mayor que el botón)
    const size = Math.max(rect.width, rect.height) * 2

    // Añade un nuevo ripple
    setRipples([...ripples, { x, y, size }])

    // Ejecuta el onClick original si existe
    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <button
      className={cn("relative overflow-hidden", disabled && "opacity-50 cursor-not-allowed", className)}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {ripples.map((ripple, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
      {children}
    </button>
  )
}
