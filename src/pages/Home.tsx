import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import ChatDisplay from "@/components/ChatDisplay"
import MessageInput from "@/components/MessageInput"
import SettingsPanel from "@/components/SettingsPanel"
import { initSpeechRecognition } from "@/utils/speechRecognition"
import { loadVapiSDK, createVapiCall } from "@/utils/vapiHelper"
import { sendMessageToGemini, type Message } from "@/utils/aiHelpers"
import { stripMarkdown } from "@/utils/textProcessing"
import { Mic, Settings } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import Alogo from "/officialLogo.png"

const speakWithBrowserTTS = (text: string, voice?: SpeechSynthesisVoice) => {
  if ("speechSynthesis" in window) {
    const cleanText = stripMarkdown(text)
    const utterance = new SpeechSynthesisUtterance(cleanText)

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event)
    }

    if (voice) {
      utterance.voice = voice
    } else {
      const voices = window.speechSynthesis.getVoices()
      const defaultVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("male") ||
            /david|mark|fred|alex|paul|zarvox|bruce/.test(v.name.toLowerCase()),
        ) || voices[0]
      utterance.voice = defaultVoice
    }

    utterance.rate = 1.2
    utterance.pitch = 1
    utterance.volume = 3

    window.speechSynthesis.speak(utterance)
  }
}

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
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [shouldSpeak, setShouldSpeak] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const isMobile = useIsMobile()

  const vapiInstance = useRef<any>(null)
  const recognitionRef = useRef<any>(null)

  // ── Speech recognition setup ─────────────────────────────────────────────
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
      },
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
    }
  }, [])

  // ── Vapi SDK loader ────────────────────────────────────────────────────────
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

  // ── Controls ───────────────────────────────────────────────────────────────
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

  const handleSendMessage = async () => {
    if (!transcript.trim()) return

    const userMessage: Message = {
      role: "user",
      parts: [{ text: transcript }],
    }
    setMessages((prev) => [...prev, userMessage])
    setTranscript("")
    setLoading(true)

    try {
      const { assistantMessage, responseText } = await sendMessageToGemini(GEMINI_API_KEY, messages, userMessage)
      setMessages((prev) => [...prev, assistantMessage])

      if (shouldSpeak) {
        if (vapiInstance.current && vapiApiKey) {
          // Vapi
          const cleanText = stripMarkdown(responseText)
          const success = await createVapiCall(vapiInstance.current, cleanText)
          if (!success) {
            speakWithBrowserTTS(responseText, selectedVoice || undefined)
          }
        } else {
          speakWithBrowserTTS(responseText, selectedVoice || undefined)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to communicate with Gemini API",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ── Render
  return (
    <div className="h-screen bg-[#1e1e1e] flex flex-col items-center font-poppins">
      <div className="w-full max-w-4xl h-full flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden  bg-[#1e1e1e] rounded-lg">
          {/* Header */}
          <div className=" bg-[#1e1e1e] p-3 sm:p-4 flex justify-between items-center">
            <div className="text-lg text-gray-400 sm:text-xl font-medium flex items-center gap-2">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-800 flex items-center justify-center">
{/* Logooooo */}
              <img
          src={Alogo}
          alt="AI Logo"
          className="bg-white w-full p-1 h-auto object-contain rounded-lg shadow-lg transition-transform transform hover:scale-105"
        />
                <Mic className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400" />
              </div>
              AninoDevAI
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          {/* Settings Panel */}
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

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatDisplay messages={messages} loading={loading} />
          </div>

          {/* Input Area */}
          <div className="bg-[#272727] rounded-md p-3 sm:p-4">
            <MessageInput
              transcript={transcript}
              isListening={isListening}
              loading={loading}
              onTranscriptChange={setTranscript}
              onToggleListening={toggleListening}
              onSendMessage={handleSendMessage}
            />

            {/* Status indicator */}
            <div className="mt-2 flex justify-between items-center">
              <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                {isListening ? (
                  <>
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    {isMobile ? "Listening" : "Listening..."}
                  </>
                ) : (
                  <>
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-600"></span>
                    {isMobile ? "Mic off" : "Microphone off"}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

