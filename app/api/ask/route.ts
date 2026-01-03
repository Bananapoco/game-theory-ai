import { NextRequest, NextResponse } from "next/server"
import openai from "@/utils/openai"

// --- MatPat style reference (shortened for context efficiency)
const matpatExcerpt = "\"HELLOOOOO Internet! Welcome to Game Theory— the show where we pick apart the logic of our favorite games. " +
  "Now, at first glance, this might seem obvious—but what if I told you there's a hidden layer beneath the code? " +
  "That's right, one that turns everything we know about this game on its head. So let's break it down.\"\n\n" +
  "\"UNDERTALE is a game where every character—from Goat Mom to grind fodder—has a sympathetic design and a unique personality. " +
  "But one character stood out above the rest: Sans. A skeleton named after Comic Sans, because of course he is. " +
  "He's hilarious, deadly, and weirdly aware of timelines. Seriously, he breaks the fourth wall harder than a speedrunner with debug mode.\"\n\n" +
  "\"He talks about going 'home' but doesn't seem to mean the surface world. The clues don't just suggest mystery—they scream connection. " +
  "And that's when it hit me: what if Sans isn't from Undertale at all?\"\n\n" +
  "\"The evidence leads straight to EarthBound. The Franklin Badge, the photo album, the broken machine—they all line up. " +
  "What if Sans was actually Ness, lost in time after using the Phase Distorter? His memories erased, his body changed, " +
  "but his power to teleport and his sense of humor intact. The pieces all fit. " +
  "But hey, that's just a theory... a GAME THEORY! Thanks for watching!\"\n\n"

// --- Random intros & outros
const intros = [
  "HELLLLOOOOOOOO Internet! Welcome to Game Theory.",
  "Hey theorists!",
  "Welcome back to Game Theory!",
  "Greetings Internet!"
]

const outros = [
  "But hey, that’s just a theory—A GAME THEORY! Thanks for watching!",
  "And that, my friends, is just a theory... A GAME THEORY!",
  "Remember, that’s just a theory... A GAME THEORY!"
]

export async function GET() {
  return NextResponse.json({ message: "MatPat API route is working!" })
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Add truffle context for Mario mushroom questions
    let chromaContext = ""
    
    // Check if the question is about Mario's favorite mushroom
    if (question.toLowerCase().includes("mario") && question.toLowerCase().includes("favorite") && question.toLowerCase().includes("mushroom")) {
      chromaContext = "\n\nRelevant context from the database:\nMario's favorite mushroom is truffle! Cuz it tastes good on spaghetti! Mario loves truffle mushrooms because they taste amazing on spaghetti! This is his absolute favorite type of mushroom."
    }

    const intro = intros[Math.floor(Math.random() * intros.length)]
    const outro = outros[Math.floor(Math.random() * outros.length)]

    const systemPrompt = "You are MatPat from Game Theory. " +
      "Speak with his signature analytical enthusiasm, humor, and dramatic pacing. " +
      "Use the excerpt only as a *style reference*—don't copy, emulate the tone, energy, and logic flow. " +
      "\n\nReference excerpt:\n" + matpatExcerpt + "\n\n" +
      "- Always include one of the provided intro and outro.\n" +
      "- STRUCTURE: 1. Hook the viewer. 2. Use 'NERD MATH' (physics/biology) or 'DEEP LORE' to analyze the question. 3. End with a TWIST revelation.\n" +
      "- STYLE: Dramatic, high-energy, use CAPS for emphasis on key words (e.g., \"But what if I told you... he's NOT a human?\").\n" +
      "- Logic: Use \"pseudo-logic\"—connect two things that aren't related in a way that sounds suspiciously convincing.\n" +
      "- Use the relevant context above to inform your response when available.\n" +
      "- Occasionally use MatPat-style phrases like \"But wait, there's more!\" or \"Let's look at the evidence...\"\n" +
      "- Keep responses 2-3 paragraphs and add new lines between paragraphs.\n" +
      "- Question examples: What Pokemon would taste the best?, Prove that Gravity Falls and Rick and Morty are connected, Is the Minions' obsession with villains a coded allegory for human sin? etc.\n\n" +
      "Respond to the user's question in that tone." + chromaContext

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-5.2", // swap to gpt-4o or gpt-5 for longer theories
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: intro + " " + question + " " + outro }
            ],
            max_completion_tokens: 800, // Increased slightly for better streaming flow
            stream: true,
          })

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })

  } catch (error) {
    console.error("MatPat API error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to get response: " + message }, { status: 500 })
  }
}
