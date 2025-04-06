import type React from "react"
import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import ApiKeyInputs from "@/components/ApiKeyInputs"
import ChatDisplay from "@/components/ChatDisplay"
import MessageInput from "@/components/MessageInput"
import { initSpeechRecognition } from "@/utils/speechRecognition"
import { loadVapiSDK, createVapiCall } from "@/utils/vapiHelper"
import { sendMessageToGemini, type Message } from "@/utils/aiHelpers"
import { stripMarkdown } from "@/utils/textProcessing"
import { Headphones, Mic } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

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

const VoiceSelector: React.FC<{ onVoiceSelect: (voice: SpeechSynthesisVoice) => void }> = ({ onVoiceSelect }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState("")
  const isMobile = useIsMobile()

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(availableVoices[0].name)
        onVoiceSelect(availableVoices[0])
      }
    }

    loadVoices()

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [onVoiceSelect, selectedVoiceName])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = event.target.value
    setSelectedVoiceName(voiceName)
    const voice = voices.find((v) => v.name === voiceName)
    if (voice) {
      onVoiceSelect(voice)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Headphones className="h-4 w-4 text-white opacity-70" />
      <label htmlFor="voice-select" className="text-white text-xs whitespace-nowrap">
        {isMobile ? "Voice:" : "Voice:"}
      </label>
      <select
        id="voice-select"
        value={selectedVoiceName}
        onChange={handleChange}
        className="flex-1 p-1 text-xs rounded-md border border-slate-700 bg-slate-800 text-white focus:ring-1 focus:ring-slate-600 focus:outline-none"
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name} className="bg-slate-800 text-white">
            {isMobile ? voice.name : `${voice.name} (${voice.lang})`}
          </option>
        ))}
      </select>
    </div>
  )
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const Index = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [vapiApiKey, setVapiApiKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [shouldSpeak, setShouldSpeak] = useState(true)
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 p-2 sm:p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-md">
          <div className="border-b border-slate-800 bg-slate-900 p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-medium text-white flex items-center gap-2">
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-800 flex items-center justify-center">
                <Mic className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
              </div>
              AninoDev Voice Assistant
            </div>
          </div>
          <div className="p-3 sm:p-5 space-y-3 sm:space-y-5">
            <div className="bg-slate-800 rounded-md p-2 border border-slate-700 overflow-hidden w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ApiKeyInputs vapiApiKey={vapiApiKey} onVapiKeyChange={setVapiApiKey} />
                <VoiceSelector onVoiceSelect={handleVoiceSelect} />
              </div>
            </div>

            <div>
              <ChatDisplay messages={messages} loading={loading} />
            </div>

            <MessageInput
              transcript={transcript}
              isListening={isListening}
              loading={loading}
              onTranscriptChange={setTranscript}
              onToggleListening={toggleListening}
              onSendMessage={handleSendMessage}
            />

            {/* Enable/disable voice output */}
            <div className="flex items-center gap-2">
              <label className="text-white text-xs sm:text-sm" htmlFor="toggle-voice">
                {isMobile ? "Voice:" : "Voice Answer:"}
              </label>
              <input
                type="checkbox"
                id="toggle-voice"
                checked={shouldSpeak}
                onChange={(e) => setShouldSpeak(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800"
              />
              {/* Stop Voice Button */}
              <button
                className="ml-2 sm:ml-4 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs sm:text-sm"
                onClick={stopSpeech}
              >
                {isMobile ? "Stop" : "Stop Voice"}
              </button>
            </div>
          </div>
          <div className="flex justify-between border-t border-slate-800 p-2 sm:p-4 bg-slate-900">
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
  )
}

export default Index

