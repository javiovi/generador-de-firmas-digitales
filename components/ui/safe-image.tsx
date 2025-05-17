"use client"

import { useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface SafeImageProps {
  src: string
  alt: string
  width: number
  height: number
  fallbackSrc?: string
  className?: string
  priority?: boolean
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = "/images/default-logo.png",
  className = "",
  priority = false,
}: SafeImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Determinar la fuente final de la imagen
  const imageSrc = error ? fallbackSrc : src

  return (
    <div className="relative">
      {isLoading && <Skeleton className="absolute inset-0" style={{ width: `${width}px`, height: `${height}px` }} />}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"}`}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
