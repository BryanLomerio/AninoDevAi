import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send } from "lucide-react";

interface MessageInputProps {
  transcript: string;
  isListening: boolean;
  loading: boolean;
  onTranscriptChange: (value: string) => void;
  onToggleListening: () => void;
  onSendMessage: () => void;
}

const MessageInput = ({
  transcript,
  isListening,
  loading,
  onTranscriptChange,
  onToggleListening,
  onSendMessage,
}: MessageInputProps) => {
  return (
    <div className="flex items-end gap-2">
      <Textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        placeholder="Type or speak your message..."
        className="resize-none bg-[#1e1e1e] border-gray-700 focus:border-blue-500 text-gray-200"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
      />
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
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={onSendMessage}
          variant="outline"
          size="icon"
          className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading || transcript.trim() === ""}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
