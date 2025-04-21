"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const predefinedColors = [
  "#d32f2f", // Red
  "#c2185b", // Pink
  "#7b1fa2", // Purple
  "#512da8", // Deep Purple
  "#303f9f", // Indigo
  "#1976d2", // Blue
  "#0288d1", // Light Blue
  "#0097a7", // Cyan
  "#00796b", // Teal
  "#388e3c", // Green
  "#689f38", // Light Green
  "#afb42b", // Lime
  "#fbc02d", // Yellow
  "#ffa000", // Amber
  "#f57c00", // Orange
  "#e64a19", // Deep Orange
  "#5d4037", // Brown
  "#616161", // Grey
  "#455a64", // Blue Grey
  "#000000", // Black
]

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(color)

  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Validate if it's a valid hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      onChange(value)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div
          className="w-10 h-10 rounded-md border cursor-pointer"
          style={{ backgroundColor: color }}
          onClick={() => setIsOpen(true)}
        />
        <Input value={inputValue} onChange={handleInputChange} placeholder="#000000" />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Seleccionar Color
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((presetColor) => (
              <div
                key={presetColor}
                className="w-8 h-8 rounded-md cursor-pointer border hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setInputValue(presetColor)
                  setIsOpen(false)
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
