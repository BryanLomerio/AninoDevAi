import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, MicOff, Send, ImageIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface MessageInputProps {
  transcript: string
  isListening: boolean
  loading: boolean
  onTranscriptChange: (value: string) => void
  onToggleListening: () => void
  onSendMessage: (isImageRequest: boolean) => void
}

const MessageInput = ({
  transcript,
  isListening,
  loading,
  onTranscriptChange,
  onToggleListening,
  onSendMessage,
}: MessageInputProps) => {
  const [isImageRequest, setIsImageRequest] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [transcript])

  // image request
  useEffect(() => {
    if (transcript) {
      const isImagePrompt = isImageGenerationRequest(transcript)
      if (isImagePrompt && !isImageRequest) {
        setIsImageRequest(true)
      }
    }
  }, [transcript, isImageRequest])

  // toggle function
  const toggleImageRequest = () => {
    setIsImageRequest(!isImageRequest)
  }

  // aiHelpers
  const isImageGenerationRequest = (text: string): boolean => {
    const lowerCaseText = text.toLowerCase()
    return (
      lowerCaseText.includes("generate an image") ||
      lowerCaseText.includes("create an image") ||
      lowerCaseText.includes("draw an image") ||
      lowerCaseText.includes("generate me image") ||
      lowerCaseText.includes("generate me a picture") ||
      lowerCaseText.includes("generate image") ||
      lowerCaseText.includes("make an image") ||
      lowerCaseText.includes("show me an image")
    )
  }

  return (
    <div className="relative">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={isImageRequest ? "Describe the image you want..." : "Type or speak your message..."}
            className={`resize-none bg-[#1e1e1e] border-gray-700 focus:border-blue-500 text-gray-200 pr-10 ${
              isImageRequest ? "border-purple-500 border-2" : ""
            }`}
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

          <Button
            onClick={toggleImageRequest}
            variant="ghost"
            size="icon"
            className={`absolute right-2 bottom-2 p-1 rounded-full ${
              isImageRequest ? "text-purple-400 bg-purple-900/20" : "text-gray-400 hover:text-white"
            }`}
            type="button"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={onToggleListening}
            variant="outline"
            size="icon"
            className={`rounded-full ${
              isListening
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-[#1e1e1e] text-gray-400 hover:text-white hover:bg-[#333333]"
            }`}
            disabled={loading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => onSendMessage(isImageRequest)}
            variant="outline"
            size="icon"
            className={`rounded-full ${
              isImageRequest
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={loading || transcript.trim() === ""}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isImageRequest && (
        <div className="mt-1 text-xs text-purple-400">
          Image generation mode active. Your message will be used to create an image.
        </div>
      )}
    </div>
  )
}

export default MessageInput
