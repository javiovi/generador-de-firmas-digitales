"use client"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Smartphone, Tablet, Monitor } from "lucide-react"

type PreviewDevice = "desktop" | "tablet" | "mobile"

interface PreviewModeToggleProps {
  darkMode: boolean
  onDarkModeChange: (darkMode: boolean) => void
  device?: PreviewDevice
  onDeviceChange?: (device: PreviewDevice) => void
  showDeviceToggle?: boolean
}

export function PreviewModeToggle({
  darkMode,
  onDarkModeChange,
  device = "desktop",
  onDeviceChange,
  showDeviceToggle = false,
}: PreviewModeToggleProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-1">
        <Button
          variant={darkMode ? "outline" : "default"}
          size="sm"
          onClick={() => onDarkModeChange(false)}
          className="h-8 px-2"
        >
          <Sun size={16} className="mr-1" />
          <span className="text-xs">Claro</span>
        </Button>
        <Button
          variant={darkMode ? "default" : "outline"}
          size="sm"
          onClick={() => onDarkModeChange(true)}
          className="h-8 px-2"
        >
          <Moon size={16} className="mr-1" />
          <span className="text-xs">Oscuro</span>
        </Button>
      </div>

      {showDeviceToggle && onDeviceChange && (
        <div className="flex items-center space-x-1">
          <Button
            variant={device === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => onDeviceChange("desktop")}
            className="h-8 w-8 p-0"
            title="Vista de escritorio"
          >
            <Monitor size={14} />
          </Button>
          <Button
            variant={device === "tablet" ? "default" : "outline"}
            size="sm"
            onClick={() => onDeviceChange("tablet")}
            className="h-8 w-8 p-0"
            title="Vista de tablet"
          >
            <Tablet size={14} />
          </Button>
          <Button
            variant={device === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => onDeviceChange("mobile")}
            className="h-8 w-8 p-0"
            title="Vista de móvil"
          >
            <Smartphone size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
