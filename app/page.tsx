"use client"

import SafeImage from "@/components/ui/safe-image"
import SignatureGenerator from "@/components/signature-generator"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n/language-context"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setIsLoaded(true)
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      console.log("isLoggedIn en home:", isLoggedIn)
      if (isLoggedIn !== "true") {
        window.location.href = "/login"
      }
    }
  }, [])

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const editor = document.getElementById("editor")
    if (editor) {
      editor.scrollIntoView({ behavior: "smooth" })
    }
    setShowGenerator(true)
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <motion.p
              className="text-3xl md:text-4xl font-bold text-text/90 pt-12 pb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              {t("createManageSignature")}
            </motion.p>
            <a
              href="#editor"
              onClick={handleCtaClick}
              className="inline-block mt-6 px-8 py-4 text-lg font-bold rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors duration-200"
              style={{ scrollBehavior: 'smooth' }}
            >
              {t("ctaCreateFirstSignature")}
            </a>
          </header>

          <motion.div
            initial={false}
            animate={showGenerator ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <SignatureGenerator />
          </motion.div>
        </div>
      </main>
    </>
  )
}
