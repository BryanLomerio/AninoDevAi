import { Mic, MicOff, Send, ImageIcon, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"

interface MessageInputProps {
  transcript: string
  isListening: boolean
  loading: boolean
  thinkingMode: boolean
  onTranscriptChange: (value: string) => void
  onToggleListening: () => void
  onSendMessage: (isImageRequest: boolean) => void
  onToggleThinkingMode: () => void
}

const MessageInput = ({
  transcript,
  isListening,
  loading,
  thinkingMode,
  onTranscriptChange,
  onToggleListening,
  onSendMessage,
  onToggleThinkingMode,
}: MessageInputProps) => {
  const [isImageRequest, setIsImageRequest] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [transcript])

  const toggleImageRequest = () => {
    setIsImageRequest(!isImageRequest)
  }

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={isImageRequest ? "Describe the image you want..." : "Message AninoDevAI..."}
          className={`w-full min-h-[48px] max-h-[200px] rounded-2xl resize-none p-3 pr-[120px] border ${
            isImageRequest ? "border-purple-400" : "border-neutral-400"
          } shadow-sm overflow-hidden`}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if (!loading && transcript.trim()) {
                onSendMessage(isImageRequest)
              }
            }
          }}
        />

        <div className="absolute right-2 top-[50%] -translate-y-1/2 flex items-center gap-1">
          <Button
            onClick={onToggleThinkingMode}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${
              thinkingMode ? "text-yellow-500" : "text-neutral-400 hover:text-neutral-600"
            }`}
            type="button"
            title={thinkingMode ? "Turn off critical thinking" : "Turn on critical thinking"}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>

          <Button
            onClick={toggleImageRequest}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${
              isImageRequest ? "text-purple-500" : "text-neutral-400 hover:text-neutral-600"
            }`}
            type="button"
            title={isImageRequest ? "Turn off image generation" : "Turn on image generation"}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            onClick={onToggleListening}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${
              isListening ? "text-green-500" : "text-neutral-400 hover:text-neutral-600"
            }`}
            disabled={loading}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <Button
            onClick={() => onSendMessage(isImageRequest)}
            size="icon"
            className="h-8 w-8 rounded-full bg-purple-600 text-white hover:bg-purple-700"
            disabled={loading || transcript.trim() === ""}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {(isImageRequest || thinkingMode) && (
        <div className="mt-1 text-xs flex gap-2">
          {isImageRequest && <span className="text-purple-400">Image generation active</span>}
          {thinkingMode && <span className="text-yellow-400">Critical thinking active</span>}
        </div>
      )}
    </div>
  )
}

export default MessageInput
