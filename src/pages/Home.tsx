import { useState, useRef, useEffect } from "react"
import { Toast } from "@/components/ui/toast"

import ChatDisplay from "@/components/ChatDisplay"
import MessageInput from "@/components/MessageInput"
import SettingsPanel from "@/components/SettingsPanel"
import { initSpeechRecognition } from "@/utils/speechRecognition"
import { loadVapiSDK, createVapiCall } from "@/utils/vapiHelper"
import { Link } from "react-router-dom"
import {
  sendMessageToGemini,
  generateImageFromGemini,
  speakWithBrowserTTS,
  type Message,
  isImageGenerationRequest,
  extractImagePrompt,
} from "@/utils/aiHelpers"
import { stripMarkdown } from "@/utils/textProcessing"
import { Settings } from "lucide-react"
import { useIsMobile } from "@/lib/use-mobile"
import Alogo from "@/assets/brain.png"
import { generateThinkingProcess } from "@/utils/thinkingProcess"

const stopSpeech = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel()
  }
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const Home = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [vapiApiKey, setVapiApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [thoughts, setThoughts] = useState<string[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [shouldSpeak, setShouldSpeak] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({})
  const isMobile = useIsMobile()

  const vapiInstance = useRef<any>(null)
  const recognitionRef = useRef<any>(null)
  const thinkingTimerRef = useRef<number | null>(null)

  // Speech recognition setup
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition(
      (newText) => {
        const t = newText.trim()
        if (t) setTranscript(t)
      },
      (error) => {
        console.error("Speech recognition error", error)
        setIsListening(false)
        toast({
          title: "Error",
          description: "Speech recognition error: " + error.error,
          variant: "destructive",
        })
      }
    )

    if (!recognitionRef.current) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      })
    }

    return () => {
      recognitionRef.current?.stop()
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current)
      }
    }
  }, [])

  // Vapi SDK loader
  useEffect(() => {
    if (vapiApiKey && typeof window !== "undefined") {
      loadVapiSDK(vapiApiKey)
        .then((sdk) => {
          vapiInstance.current = sdk
        })
        .catch((err: any) => {
          console.error(err)
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          })
        })
    }
  }, [vapiApiKey])

  // Toggle mic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      if (!recognitionRef.current) {
        toast({
          title: "Speech recognition not available",
          description: "Your browser doesn't support speech recognition",
          variant: "destructive",
        })
        return
      }
      recognitionRef.current.start()
      setIsListening(true)
      setTranscript("")
    }
  }

  const handleVoiceSelect = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice)
  }

  // Show AI thinking process, returns Promise resolving after all thoughts displayed
  const showThinkingProcess = (userPrompt: string): Promise<void> => {
    setThinking(true)
    setThoughts([])

    return new Promise((resolve) => {
      const steps = generateThinkingProcess(userPrompt)
      const thoughtTexts = steps.map((s) => s.thought)
      let idx = 0

      const display = () => {
        if (idx < thoughtTexts.length) {
          setThoughts((prev) => [...prev, thoughtTexts[idx]])
          idx++
          thinkingTimerRef.current = window.setTimeout(display, 800)
        } else {
          thinkingTimerRef.current = window.setTimeout(() => {
            setThinking(false)
            setThoughts([])
            resolve()
          }, 1000)
        }
      }

      display()
    })
  }

  // Handle user send
  const handleSendMessage = async (isImageRequestFromButton = false) => {
    if (!transcript.trim()) return

    const userMessage: Message = {
      role: "user",
      parts: [{ text: transcript }],
    }
    setMessages((prev) => [...prev, userMessage])
    setTranscript("")
    setLoading(true)

    // Wait for thinking to finish
    await showThinkingProcess(userMessage.parts[0].text)

    try {
      const isTextImage = isImageGenerationRequest(userMessage.parts[0].text)
      const shouldGenerateImage = isImageRequestFromButton || isTextImage

      if (isTextImage && !isImageRequestFromButton) {
        const fallback: Message = {
          role: "assistant",
          parts: [{ text: "Please activate image generation to generate an image like that." }],
        }
        setMessages((prev) => [...prev, fallback])
        if (shouldSpeak) speakWithBrowserTTS(fallback.parts[0].text, selectedVoice || undefined)
        setLoading(false)
        return
      }

      if (shouldGenerateImage) {
        const prompt = isImageRequestFromButton
          ? userMessage.parts[0].text
          : extractImagePrompt(userMessage.parts[0].text)
        const { text, imageSrc } = await generateImageFromGemini(GEMINI_API_KEY, prompt)
        const respText = text || `Here's the image I generated based on: "${prompt}"`
        const assistantMsg: Message = { role: "assistant", parts: [{ text: respText }] }
        setMessages((prev) => [...prev, assistantMsg])

        if (imageSrc) {
          setGeneratedImages((prev) => ({ ...prev, [messages.length + 1]: imageSrc }))
        }

        if (shouldSpeak) speakWithBrowserTTS(respText, selectedVoice || undefined)
      } else {
        const { assistantMessage, responseText } = await sendMessageToGemini(
          GEMINI_API_KEY,
          messages,
          userMessage
        )
        setMessages((prev) => [...prev, assistantMessage])

        if (shouldSpeak) {
          if (vapiInstance.current && vapiApiKey) {
            const clean = stripMarkdown(responseText)
            const ok = await createVapiCall(vapiInstance.current, clean)
            if (!ok) speakWithBrowserTTS(responseText, selectedVoice || undefined)
          } else {
            speakWithBrowserTTS(responseText, selectedVoice || undefined)
          }
        }
      }
    } catch (err) {
      console.error("Error processing message:", err)
      toast({ title: "Error", description: "Failed to process your request", variant: "destructive" })
      const errorMsg: Message = {
        role: "assistant",
        parts: [{ text: "I'm sorry, I encountered an error processing your request. Please try again." }],
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex justify-center font-poppins">
      <div className="w-full max-w-4xl flex flex-col h-screen relative">
        {/* Header */}
        <div className="bg-[#1e1e1e] p-3 sm:p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="text-lg text-gray-400 sm:text-xl font-medium flex items-center gap-2">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-800 flex items-center justify-center">
              <img src={Alogo} alt="AI Logo" className="w-full h-full object-contain" />
            </div>
            <Link to="/">
              <h1 className="hover:text-white transition-colors">AninoDevAI</h1>
            </Link>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* SettingsPanel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          vapiApiKey={vapiApiKey}
          onVapiKeyChange={setVapiApiKey}
          onVoiceSelect={handleVoiceSelect}
          shouldSpeak={shouldSpeak}
          onSpeakToggle={setShouldSpeak}
          onStopSpeech={stopSpeech}
        />

        {/* Chat */}
        <div className="flex-1 overflow-y-auto pb-32">
          <ChatDisplay
            messages={messages}
            loading={loading}
            generatedImages={generatedImages}
            thinking={thinking}
            thoughts={thoughts}
          />
        </div>

        {/* Input */}
        <div className="bg-[#272727] rounded-tl-md rounded-tr-md p-3 sm:p-4 fixed bottom-0 left-0 right-0 max-w-4xl mx-auto z-10">
          <MessageInput
            transcript={transcript}
            isListening={isListening}
            loading={loading}
            onTranscriptChange={setTranscript}
            onToggleListening={toggleListening}
            onSendMessage={handleSendMessage}
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              {isListening ? (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Listening...
                </>
              ) : (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-600" /> Microphone off
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
