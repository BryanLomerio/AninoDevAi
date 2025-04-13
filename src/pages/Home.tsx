import { useState, useRef, useEffect } from "react"
import { toast } from "@/lib/use-toast"
import ChatDisplay from "@/components/ChatDisplay"
import MessageInput from "@/components/MessageInput"
import SettingsPanel from "@/components/SettingsPanel"
import { initSpeechRecognition } from "@/utils/speechRecognition"
import { loadVapiSDK, createVapiCall } from "@/utils/vapiHelper"
import { FaGithub } from "react-icons/fa";
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
import Alogo from "/brain.png"

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
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({})
  const isMobile = useIsMobile()

  const vapiInstance = useRef<any>(null)
  const recognitionRef = useRef<any>(null)

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

  // Controls
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

  const handleSendMessage = async (isImageRequestFromButton = false) => {
    if (!transcript.trim()) return

    const userMessage: Message = {
      role: "user",
      parts: [{ text: transcript }],
    }

    setMessages((prev) => [...prev, userMessage])
    setTranscript("")
    setLoading(true)

    try {
      const isTextBasedImageRequest = isImageGenerationRequest(userMessage.parts[0].text)
      const shouldGenerateImage = isImageRequestFromButton || isTextBasedImageRequest

      if (isTextBasedImageRequest && !isImageRequestFromButton) {
        const fallbackMessage: Message = {
          role: "assistant",
          parts: [{ text: "Please activate image generation to generate an image like that." }],
        }
        setMessages((prev) => [...prev, fallbackMessage])
        if (shouldSpeak) {
          speakWithBrowserTTS(fallbackMessage.parts[0].text, selectedVoice || undefined)
        }
        setLoading(false)
        return
      }

      if (shouldGenerateImage) {
        const imagePrompt = isImageRequestFromButton
          ? userMessage.parts[0].text
          : extractImagePrompt(userMessage.parts[0].text)
        console.log("Generating image for prompt:", imagePrompt)

        try {
          const { text, imageSrc } = await generateImageFromGemini(GEMINI_API_KEY, imagePrompt)
          const responseText = text || `Here's the image I generated based on: "${imagePrompt}"`
          const assistantMessage: Message = {
            role: "assistant",
            parts: [{ text: responseText }],
          }

          setMessages((prev) => [...prev, assistantMessage])

          if (imageSrc) {
            setGeneratedImages((prev) => ({
              ...prev,
              [messages.length + 1]: imageSrc,
            }))
            console.log("Image generated successfully")
          } else {
            console.warn("No image was generated, showing text response only.")
          }

          if (shouldSpeak) {
            speakWithBrowserTTS(responseText, selectedVoice || undefined)
          }
        } catch (imageError) {
          console.error("Image generation error:", imageError)
          const fallbackMessage: Message = {
            role: "assistant",
            parts: [{
              text: "I couldn't generate that image. This might be due to content policy restrictions or a technical issue. Let me try to answer with text instead.",
            }],
          }

          setMessages((prev) => [...prev, fallbackMessage])

          const { assistantMessage, responseText } = await sendMessageToGemini(GEMINI_API_KEY, messages, userMessage)
          setMessages((prev) => [...prev, assistantMessage])

          if (shouldSpeak) {
            speakWithBrowserTTS(responseText, selectedVoice || undefined)
          }
        }
      } else {
        const { assistantMessage, responseText } = await sendMessageToGemini(GEMINI_API_KEY, messages, userMessage)
        setMessages((prev) => [...prev, assistantMessage])

        if (shouldSpeak) {
          if (vapiInstance.current && vapiApiKey) {
            const cleanText = stripMarkdown(responseText)
            const success = await createVapiCall(vapiInstance.current, cleanText)
            if (!success) {
              speakWithBrowserTTS(responseText, selectedVoice || undefined)
            }
          } else {
            speakWithBrowserTTS(responseText, selectedVoice || undefined)
          }
        }
      }
    } catch (error) {
      console.error("Error processing message:", error)
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      })

      // Fallback error message
      const errorMessage: Message = {
        role: "assistant",
        parts: [{ text: "I'm sorry, I encountered an error processing your request. Please try again." }],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex justify-center font-poppins">
      <div className="w-full max-w-4xl flex flex-col h-screen relative">
        {/* Header - Fixed at top */}
        <div className="bg-[#1e1e1e] p-3 sm:p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="text-lg text-gray-400 sm:text-xl font-medium flex items-center gap-2">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-800 flex items-center justify-center">
              <img
                src={Alogo || "/placeholder.svg"}
                alt="AI Logo"
                className="w-full h-full object-contain transition-transform transform hover:scale-105"
              />
            </div>
            AninoDevAI
          </div>

          <div className="flex items-center gap-3">
              <a href="https://github.com/BryanLomerio/AninoDevAi" target="_blank" className="text-slate-400 hover:text-white">
                <FaGithub className="h-5 w-5" />
              </a>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
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

        {/* Chat Display */}
        <div className="flex-1 overflow-y-auto pb-32">
          <ChatDisplay messages={messages} loading={loading} generatedImages={generatedImages} />
        </div>

        {/* Input Area */}
        <div className="bg-[#272727] rounded-tl-md rounded-tr-md p-3 sm:p-4 fixed bottom-0 left-0 right-0 max-w-4xl mx-auto z-10">
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
  )
}

export default Home
