import type React from "react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface MessageInputProps {
  transcript: string
  isListening: boolean
  loading: boolean
  onTranscriptChange: (text: string) => void
  onToggleListening: () => void
  onSendMessage: () => void
}

const MessageInput: React.FC<MessageInputProps> = ({
  transcript,
  isListening,
  loading,
  onTranscriptChange,
  onToggleListening,
  onSendMessage,
}) => {
  const isMobile = useIsMobile()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      }
    }
  }

  return (
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
          className="w-full resize-none overflow-hidden rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-slate-600 min-h-[40px] max-h-[120px]"
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
  )
}

export default MessageInput

