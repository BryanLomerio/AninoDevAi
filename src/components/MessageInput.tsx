
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send } from "lucide-react";

interface MessageInputProps {
  transcript: string;
  isListening: boolean;
  loading: boolean;
  onTranscriptChange: (text: string) => void;
  onToggleListening: () => void;
  onSendMessage: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  transcript,
  isListening,
  loading,
  onTranscriptChange,
  onToggleListening,
  onSendMessage
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        onClick={onToggleListening}
        className="flex-shrink-0"
      >
        {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
        {isListening ? "Stop" : "Record"}
      </Button>
      
      <Input
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        placeholder="Type or speak your message..."
        className="flex-1"
      />
      
      <Button 
        onClick={onSendMessage} 
        disabled={!transcript.trim() || loading}
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4 mr-2" />
        Send
      </Button>
    </div>
  );
};

export default MessageInput;
