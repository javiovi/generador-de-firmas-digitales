import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Footer from "@/components/footer"
import { LanguageProvider } from "@/lib/i18n/language-context"
import favicon from "@/public/rubrica-iso.png"

// Cargar la fuente Inter
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://rubrica.ar"),
  title: "Rubrica",
  description: "crea y gestiona tu firma profesional en segundos",
  icons: { icon: favicon.src },
  openGraph: {
    title: "Rubrica",
    description: "crea y gestiona tu firma profesional en segundos",
    images: [{ url: "/rubrica-logo.png" }],
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href={favicon.src} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
