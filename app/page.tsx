"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"

export default function Home() {

  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  // Typing animation effect
  useEffect(() => {
    if (response && isTyping) {
      let currentIndex = 0
      const textToType = response
      
      const typingInterval = setInterval(() => {
        if (currentIndex < textToType.length) {
          setDisplayedText(textToType.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(typingInterval)
        }
      }, 40) // Adjust speed here (lower = faster)

      return () => clearInterval(typingInterval)
    }
  }, [response, isTyping])

  // Handle pressing Enter
  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && input.trim() && !isLoading) {
      e.preventDefault()
      setIsLoading(true)

      try {
        // Send input to your API route
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: input }),
        })

        const data = await res.json()
        
        if (data.error) {
          setResponse(`Error: ${data.error}`)
        } else {
          setResponse(data.answer)
        }
        
        setDisplayedText("")
        setIsTyping(true)
        setInput("") // clear input after sending
      } catch (error) {
        console.error("Error details:", error)
        setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
        setDisplayedText("")
        setIsTyping(true)
        setInput("")
      } finally {
        setIsLoading(false)
      }
    }
  }
  
  // Render
  return (
    <div
      className="relative min-h-screen animate-scroll-diagonal"
      style={{
        backgroundImage: "url('https://i.redd.it/rpn5p72i4q3c1.png')",
        backgroundSize: "2000px" ,
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" />

      {/* Foreground content */}
      <div className="relative w-full max-w-4xl mx-auto px-4 py-8 z-10">
        {/* Header Section */}
        <div className="relative bg-white/10 w-full max-w-4xl h-full flex flex-col justify-center items-center z-10 gap-3 min-h-screen">
          <img src="https://logos-world.net/wp-content/uploads/2025/01/Game-Theory-Logo.png" alt="" className= "w-160 h-auto"/>
          
          {/* Skeleton loading state */}
          {isLoading && !displayedText && (
            <div className="w-full max-w-3xl px-6 py-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="space-y-4">
                {/* First paragraph skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                {/* Second paragraph skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Signature line skeleton */}
                <div className="pt-2">
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          )}

          {/* Ghostly typing effect display */}
          {displayedText && (
            <div className="w-full max-w-3xl px-6 py-4 bg-black/30 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-white/90 text-lg leading-relaxed font-mono ghostly-text">
                {displayedText}
                {isTyping && (
                  <span className="animate-pulse text-white/60">|</span>
                )}
              </p>
            </div>
          )}

          <div className="w-full max-w-3xl relative">
            <Textarea
              placeholder={isLoading ? "MatPat is thinking..." : "Ask MatPat a theory!"}
              disabled={isLoading}
              className="placeholder:text-gray-400 w-full px-6 py-4 text-lg text-white bg-gray-700/50 backdrop-blur-sm border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-hidden"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="absolute right-4 bottom-4 text-gray-400 text-sm">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  Thinking...
                </div>
              ) : (
                "Press Enter to submit"
              )}
            </div>
          </div>
        </div>

        {/* Additional Content Section for Scrolling */}
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 py-8 md:py-16">
          <div className="w-full max-w-3xl px-4 md:px-6 py-6 md:py-8 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">Welcome to Game Theory!</h2>
            <p className="text-white/80 text-center leading-relaxed">
              Ask MatPat any question and watch as he develops an incredible theory! 
              From video games to movies, from science to pop culture - no topic is too strange 
              for a Game Theory analysis. Scroll down to see more content and try asking 
              questions like "Why does Mario collect coins?" or "What's the real story behind FNAF?"
            </p>
          </div>

          <div className="w-full max-w-3xl px-4 md:px-6 py-6 md:py-8 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 text-center">How to Use</h3>
            <ul className="text-white/80 space-y-2">
              <li>• Type your question in the input field above</li>
              <li>• Press Enter to submit</li>
              <li>• Watch MatPat's theory appear with the ghostly typing effect</li>
              <li>• Scroll up and down to see all content</li>
            </ul>
          </div>

          <div className="w-full max-w-3xl px-4 md:px-6 py-6 md:py-8 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
            <h3 className="text-lg md:text-xl font-bold text-white mb-4 text-center">Example Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
              <div>
                <p className="font-semibold mb-2">Gaming Theories:</p>
                <ul className="space-y-1 text-sm">
                  <li>• Why does Link never speak?</li>
                  <li>• What's the real timeline of Zelda?</li>
                  <li>• Is Mario actually evil?</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Pop Culture:</p>
                <ul className="space-y-1 text-sm">
                  <li>• What's the real story of FNAF?</li>
                  <li>• Why is Pikachu so popular?</li>
                  <li>• Is Minecraft a simulation?</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}