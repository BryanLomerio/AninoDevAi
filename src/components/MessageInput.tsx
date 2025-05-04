
import { Mic, MicOff, ImageIcon, Lightbulb, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageInputProps {
  transcript: string;
  isListening: boolean;
  loading: boolean;
  thinkingMode: boolean;
  onTranscriptChange: (value: string) => void;
  onToggleListening: () => void;
  onSendMessage: (isImageRequest: boolean) => void;
  onToggleThinkingMode: () => void;
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
  const [isImageRequest, setIsImageRequest] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with improved scrolling behavior
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";

      // Calculate new height (capped at max height)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;

      // Show scrollbar only when content exceeds max height
      if (textareaRef.current.scrollHeight > 200) {
        textareaRef.current.classList.add("overflow-y-auto");
        textareaRef.current.classList.remove("overflow-hidden");
      } else {
        textareaRef.current.classList.remove("overflow-y-auto");
        textareaRef.current.classList.add("overflow-hidden");
      }
    }
  }, [transcript]);

  const toggleImageRequest = () => {
    setIsImageRequest(!isImageRequest);
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading && transcript.trim()) {
            onSendMessage(isImageRequest);
          }
        }}
        className="relative w-full"
      >
        <div className="relative w-full bg-[#303030] rounded-xl border border-gray-700 shadow-lg transition-all">
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder={isImageRequest ? "Describe the image you want..." : "Message AninoDevAI..."}
            className="w-full min-h-[52px] max-h-[200px] bg-transparent text-white rounded-xl resize-none py-3 pl-4 pr-4 pb-12 border-0 focus:ring-0 focus:outline-none overflow-hidden scrollbar-thin align-top"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!loading && transcript.trim()) {
                  onSendMessage(isImageRequest);
                }
              }
            }}
            style={{ verticalAlign: "top" }}
          />

          <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-2">
            {/* Left icons */}
            <div className="flex items-center space-x-1 pl-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleImageRequest}
                      className={`p-2 rounded-md transition-colors hover:bg-gray-700 ${
                        isImageRequest ? "text-purple-400 bg-purple-900/20" : "text-gray-400"
                      }`}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                    {isImageRequest ? "Turn off image generation" : "Turn on image generation"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onToggleThinkingMode}
                      className={`p-2 rounded-md transition-colors hover:bg-gray-700 ${
                        thinkingMode ? "text-yellow-400 bg-yellow-900/20" : "text-gray-400"
                      }`}
                    >
                      <Lightbulb className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                    {thinkingMode ? "Turn off critical thinking" : "Turn on critical thinking"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-1 pr-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onToggleListening}
                      className={`p-2 rounded-md transition-colors hover:bg-gray-700 ${
                        isListening ? "text-green-400 bg-green-900/20" : "text-gray-400"
                      }`}
                      disabled={loading}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                    {isListening ? "Stop listening" : "Start listening"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      className={`p-2 rounded-md transition-colors ${
                        transcript.trim() && !loading
                          ? "text-white bg-blue-900/30 hover:bg-blue-800/40"
                          : "text-gray-500 bg-gray-800/30 cursor-not-allowed"
                      }`}
                      disabled={loading || transcript.trim() === ""}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                    Send message
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </form>

      <div className="text-xs text-center text-gray-500 mt-2 opacity-80">
        AninoDevAI can make mistakes. Consider checking important information.
      </div>
    </div>
  );
};

export default MessageInput;
