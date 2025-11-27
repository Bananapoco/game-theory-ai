"use client"

import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, Send, Cpu, Gamepad2, Tv, Sparkles, RotateCw } from "lucide-react"

interface MatrixStream {
  id: number
  side: 'left' | 'right'
  direction: 'top' | 'bottom'
  xPercent: number
  speed: number
  content: string
  opacity: number
  fontSize: number
}


export default function Home() {
  const [input, setInput] = useState("")
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastQuestion, setLastQuestion] = useState<string>("")
  const [matrixStreams, setMatrixStreams] = useState<MatrixStream[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Matrix Rain Effect Generator
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const spawnStreams = () => {
      // 1 to 3 streams per interval
      const count = Math.floor(Math.random() * 3) + 1 
      const newStreams: MatrixStream[] = []

      for (let i = 0; i < count; i++) {
        const id = Date.now() + i
        const side = Math.random() > 0.5 ? 'left' : 'right'
        // Random direction: top or bottom
        const direction = Math.random() > 0.5 ? 'top' : 'bottom'
        // Random position within the side panel (0-100%)
        const xPercent = Math.random() * 80 + 10 
        // Duration: 4s to 6s (lower max speed)
        const speed = Math.random() * 2 + 4 
        // Length of the stream
        // Spaced out binary content
        const length = Math.floor(Math.random() * 10) + 8 
        const content = Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('\n')
        
        // Subtle opacity: visible but ghostly (lower max opacity)
        const opacity = Math.random() * 0.3 + 0.3 
        
        // Varied font size
        const fontSize = Math.floor(Math.random() * 6) + 12 // 12px to 18px

        newStreams.push({ id, side, direction, xPercent, speed, content, opacity, fontSize })

        // Cleanup after animation
        setTimeout(() => {
          setMatrixStreams(prev => prev.filter(s => s.id !== id))
        }, speed * 1000)
      }

      setMatrixStreams(prev => [...prev, ...newStreams])

      // Continuous spawning every 1.5 seconds (shorter, consistent interval)
      timeoutId = setTimeout(spawnStreams, 1500)
    }

    // Start immediately
    timeoutId = setTimeout(spawnStreams, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  // Scroll to bottom on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayedText, isLoading])

  // Function to handle API call with streaming
  async function fetchResponse(question: string) {
    setIsLoading(true)
    setDisplayedText("") // Clear previous response immediately
    
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || res.statusText)
      }

      if (!res.body) throw new Error("No response body")

      setIsLoading(false)
      setIsTyping(true)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setDisplayedText((prev) => prev + chunk)
      }
      
    } catch (error) {
      console.error("Error details:", error)
      setDisplayedText(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  // Handle pressing Enter
  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading && !isTyping) {
        const question = input.trim()
        setLastQuestion(question)
        setInput("") // Clear input immediately for better UX
        await fetchResponse(question)
      }
    }
  }

  // Handle regenerate
  async function handleRegenerate() {
    if (lastQuestion && !isLoading && !isTyping) {
      await fetchResponse(lastQuestion)
    }
  }

  const exampleQuestions = [
    { icon: <Gamepad2 className="w-4 h-4" />, text: "Why does Mario collect coins?" },
    { icon: <Tv className="w-4 h-4" />, text: "What is the timeline of Zelda?" },
    { icon: <Cpu className="w-4 h-4" />, text: "Is Minecraft a simulation?" },
    { icon: <Sparkles className="w-4 h-4" />, text: "The lore behind FNAF?" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="scanlines" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Matrix Rain Side Containers */}
      <div className="fixed inset-y-0 left-0 w-[15vw] overflow-hidden pointer-events-none z-40">
        <AnimatePresence>
          {matrixStreams.filter(s => s.side === 'left').map(s => {
            const styleObj: React.CSSProperties = { 
              left: `${s.xPercent}%`, 
              fontSize: `${s.fontSize}px`,
            }
            if (s.direction === 'top') {
              styleObj.top = 0
            } else {
              styleObj.bottom = 0
            }
            return (
              <motion.div
                key={s.id}
                initial={{ 
                  y: s.direction === 'top' ? -500 : "120vh", 
                  opacity: 0 
                }}
                animate={{ 
                  y: s.direction === 'top' ? "120vh" : -500, 
                  opacity: [0, s.opacity, s.opacity * 0.8, 0] 
                }}
                transition={{ duration: s.speed, ease: "linear", times: [0, 0.2, 0.8, 1] }}
                style={styleObj}
                className="absolute text-primary font-mono font-medium leading-[1.8] whitespace-pre text-center drop-shadow-[0_0_3px_rgba(0,255,0,0.4)]"
              >
                {s.content}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      <div className="fixed inset-y-0 right-0 w-[15vw] overflow-hidden pointer-events-none z-40">
         <AnimatePresence>
          {matrixStreams.filter(s => s.side === 'right').map(s => {
            const styleObj: React.CSSProperties = { 
              left: `${s.xPercent}%`, 
              fontSize: `${s.fontSize}px`,
            }
            if (s.direction === 'top') {
              styleObj.top = 0
            } else {
              styleObj.bottom = 0
            }
            return (
              <motion.div
                key={s.id}
                initial={{ 
                  y: s.direction === 'top' ? -500 : "120vh", 
                  opacity: 0 
                }}
                animate={{ 
                  y: s.direction === 'top' ? "120vh" : -500, 
                  opacity: [0, s.opacity, s.opacity * 0.8, 0] 
                }}
                transition={{ duration: s.speed, ease: "linear", times: [0, 0.2, 0.8, 1] }}
                style={styleObj}
                className="absolute text-primary font-mono font-medium leading-[1.8] whitespace-pre text-center drop-shadow-[0_0_3px_rgba(0,255,0,0.4)]"
              >
                {s.content}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-start gap-8 max-w-5xl">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center gap-6 mt-8"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
            <img 
              src="/logo.png" 
              alt="Game Theory" 
              className="w-64 h-auto relative drop-shadow-[0_0_15px_rgba(0,255,0,0.3)]"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
              Game <span className="text-primary text-glow">Theory</span> AI
            </h1>
            <p className="text-muted-foreground font-mono text-sm md:text-base">
              // TERMINAL ACCESS: GRANTED <br/>
              // ASK MATPAT ANYTHING
            </p>
          </div>
        </motion.header>

        {/* Main Interface */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          
          {/* Terminal / Chat Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Output Display */}
            <div className="relative min-h-[300px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden group">
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
              
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>OUTPUT_STREAM_V2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isLoading || isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  <span>{isLoading ? 'PROCESSING...' : isTyping ? 'RECEIVING STREAM...' : 'READY'}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6 font-mono relative z-10">
                {!displayedText && !isLoading && !isTyping && (
                  <div className="text-muted-foreground/50 text-center py-10">
                    AWAITING INPUT... <br/>
                    INITIALIZE QUERY BELOW
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-primary/20 rounded w-3/4" />
                    <div className="h-4 bg-primary/10 rounded w-full" />
                    <div className="h-4 bg-primary/10 rounded w-5/6" />
                  </div>
                )}

                {displayedText && (
                  <div className="prose prose-invert prose-p:text-green-50/90 prose-headings:text-primary max-w-none">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {displayedText}
                      {isTyping && <span className="inline-block w-3 h-5 ml-1 bg-primary animate-pulse align-middle" />}
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
                
                {/* Regenerate Button - Bottom Right of Output */}
                {displayedText && !isLoading && !isTyping && lastQuestion && (
                  <div className="pt-4 mt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-300 group font-mono text-sm"
                      title="Regenerate response"
                    >
                      <RotateCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>REGENERATE OUTPUT</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur" />
              <div className="relative bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 p-2 flex gap-4 items-end transition-all focus-within:ring-1 focus-within:ring-primary/50">
                <Textarea
                  placeholder="Insert query regarding lore, theories, or timeline discrepancies..."
                  disabled={isLoading || isTyping}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-0 focus-visible:ring-0 min-h-[60px] text-lg font-medium resize-none py-3 px-4"
                />
                <button 
                  onClick={() => handleKeyDown({ key: 'Enter', preventDefault: () => {} } as any)}
                  disabled={!input.trim() || isLoading || isTyping}
                  className="mb-2 mr-2 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Sidebar / Info */}
          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            {/* About Card */}
            <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl p-6">
              <h3 className="text-primary font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4" /> System Info
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Welcome to the Theory Generator. This system utilizes advanced pattern recognition to synthesize theories from pop culture data.
              </p>
              <div className="text-xs font-mono text-primary/60 border-t border-white/5 pt-4">
                SYS.VER.2.0.4 <br/>
                UPTIME: 99.9%
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl p-6">
              <h3 className="text-primary font-bold uppercase tracking-wider text-sm mb-4">
                Suggested Queries
              </h3>
              <div className="flex flex-col gap-2">
                {exampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q.text)}
                    disabled={isLoading || isTyping}
                    className="flex items-center gap-3 w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-primary/30 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                      {q.icon}
                    </div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground">
                      {q.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

        </div>
      </main>
    </div>
  )
}
