import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send, Sparkles, RefreshCw } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface MessageInputProps {
  transcript: string
  isListening: boolean
  loading: boolean
  onTranscriptChange: (text: string) => void
  onToggleListening: () => void
  onSendMessage: () => void
  suggestedPrompts?: string[]
}

const PROMPT_POOL = [
  "Tell me about artificial intelligence",
  "How can I improve my productivity?",
  "What's the weather like today?",
  "Give me a creative idea",
  "Write a short poem about nature",
  "Explain quantum computing",
  "Tell me a fun fact about space",
  "How do I learn a new language quickly?",
  "What are some healthy breakfast ideas?",
  "Tell me about the history of the internet",
  "What books should I read this year?",
  "Give me tips for better sleep",
  "How can I reduce my carbon footprint?",
  "Tell me a joke",
  "What's happening in technology news?",
  "How do I start meditation?",
  "Tell me about blockchain technology",
  "What are some good exercises for beginners?",
  "Give me travel recommendations",
  "How can I improve my public speaking?",
]

const getRandomItems = (array: string[], count: number): string[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const MessageInput: React.FC<MessageInputProps> = ({
  transcript,
  isListening,
  loading,
  onTranscriptChange,
  onToggleListening,
  onSendMessage,
  suggestedPrompts,
}) => {
  const isMobile = useIsMobile()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [randomPrompts, setRandomPrompts] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  // Generate random prompts
  useEffect(() => {
    const sourcePrompts = suggestedPrompts && suggestedPrompts.length > 0 ? suggestedPrompts : PROMPT_POOL
    setRandomPrompts(getRandomItems(sourcePrompts, 4))

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRandomPrompts(getRandomItems(sourcePrompts, 4))
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [suggestedPrompts, refreshKey])

  // Hide
  useEffect(() => {
    if (transcript.trim()) {
      setShowSuggestions(false)
    }
  }, [transcript])

  const refreshPrompts = () => {
    setRefreshKey((prev) => prev + 1)
  }

  //  clicking suggestions
  const handleSuggestionClick = (suggestion: string) => {
    onTranscriptChange(suggestion)
    setShowSuggestions(false)
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [transcript])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (transcript.trim() && !loading) {
        onSendMessage()
        setShowSuggestions(false)
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Suggested prompts  */}
      {showSuggestions && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-400">Try asking:</span>
            </div>
            <button
              onClick={refreshPrompts}
              className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-300 transition-colors"
              aria-label="Refresh suggestions"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">New ideas</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {randomPrompts.map((prompt, index) => (
              <button
                key={`${refreshKey}-${index}`}
                onClick={() => handleSuggestionClick(prompt)}
                className="text-left px-3 py-2 text-xs sm:text-sm text-white border border-slate-700 hover:border-slate-500 rounded-md transition-all hover:translate-y-[-2px] truncate"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          onClick={onToggleListening}
          className="flex-shrink-0"
          size={isMobile ? "icon" : "default"}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {!isMobile && <span className="ml-2">{isListening ? "Stop" : "Record"}</span>}
        </Button>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or speak your message..."
            className="w-full resize-none overflow-hidden rounded-md border border-slate-700 bg-[#1E1E1E] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-600 min-h-[40px] max-h-[120px]"
            rows={1}
          />
        </div>

        <Button
          onClick={onSendMessage}
          disabled={!transcript.trim() || loading}
          className="flex-shrink-0 bg-white text-black hover:bg-gray-300"
          size={isMobile ? "icon" : "default"}
        >
          <Send className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Send</span>}
        </Button>
      </div>
    </div>
  )
}

export default MessageInput
