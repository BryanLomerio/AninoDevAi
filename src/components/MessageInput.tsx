import { Mic, MicOff, ImageIcon, Lightbulb, Send } from "lucide-react"
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

  // Auto-resize textarea with improved scrolling behavior
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto"

      // Calculate new height (capped at max height)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200)
      textareaRef.current.style.height = `${newHeight}px`

      // Show scrollbar only when content exceeds max height
      if (textareaRef.current.scrollHeight > 200) {
        textareaRef.current.classList.add("overflow-y-auto")
        textareaRef.current.classList.remove("overflow-hidden")
      } else {
        textareaRef.current.classList.remove("overflow-y-auto")
        textareaRef.current.classList.add("overflow-hidden")
      }
    }
  }, [transcript])

  const toggleImageRequest = () => {
    setIsImageRequest(!isImageRequest)
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!loading && transcript.trim()) {
            onSendMessage(isImageRequest)
          }
        }}
        className="relative w-full"
      >
        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={isImageRequest ? "Describe the image you want..." : "Message AninoDevAI..."}
            className="w-full min-h-[52px] max-h-[200px] bg-[#40414f] text-white rounded-xl resize-none py-3 pl-3 pr-3 pb-12 border-0 focus:ring-0 focus:outline-none shadow-sm overflow-hidden scrollbar-thin align-top"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (!loading && transcript.trim()) {
                  onSendMessage(isImageRequest)
                }
              }
            }}
            style={{ verticalAlign: "top" }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between">
            {/* Left icons */}
            <div className="flex items-center space-x-1 pl-3">
              <button
                type="button"
                onClick={toggleImageRequest}
                className={`p-1.5 rounded-md transition-colors ${
                  isImageRequest ? "text-purple-400" : "text-gray-400 hover:text-gray-200"
                }`}
                title={isImageRequest ? "Turn off image generation" : "Turn on image generation"}
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onToggleThinkingMode}
                className={`p-1.5 rounded-md transition-colors ${
                  thinkingMode ? "text-yellow-400" : "text-gray-400 hover:text-gray-200"
                }`}
                title={thinkingMode ? "Turn off critical thinking" : "Turn on critical thinking"}
              >
                <Lightbulb className="h-4 w-4" />
              </button>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-1 pr-3">
              <button
                type="button"
                onClick={onToggleListening}
                className={`p-1.5 rounded-md transition-colors ${
                  isListening ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                }`}
                disabled={loading}
                title={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                type="submit"
                className={`p-1.5 rounded-md transition-colors ${
                  transcript.trim() && !loading ? "text-white" : "text-gray-400 opacity-50 cursor-not-allowed"
                }`}
                disabled={loading || transcript.trim() === ""}
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="text-xs text-center text-gray-500 mt-2">
        AninoDevAI can make mistakes. Consider checking important information.
      </div>
    </div>
  )
}

export default MessageInput
