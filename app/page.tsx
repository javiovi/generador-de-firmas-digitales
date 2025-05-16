"use client"

import Image from "next/image"
import SignatureGenerator from "@/components/signature-generator"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      <Navbar />
      <main className="container mx-auto min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <motion.div
              className="flex justify-center mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src="/images/identymail-logo.png"
                alt="Identymail"
                width={250}
                height={70}
                priority
                className="h-auto w-auto"
              />
            </motion.div>
            <motion.p
              className="text-lg text-text/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              Crea firmas de email profesionales para tu empresa en minutos
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <SignatureGenerator />
          </motion.div>
        </div>
      </main>
    </>
  )
}
