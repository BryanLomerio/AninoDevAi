import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ApiKeyInputs from "@/components/ApiKeyInputs";
import ChatDisplay from "@/components/ChatDisplay";
import MessageInput from "@/components/MessageInput";
import { initSpeechRecognition } from "@/utils/speechRecognition";
import { loadVapiSDK, createVapiCall } from "@/utils/vapiHelper";
import {
  speakWithBrowserTTS,
  sendMessageToGemini,
  type Message,
} from "@/utils/aiHelpers";

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [vapiApiKey, setVapiApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const vapiInstance = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // ── Speech recognition setup ────────────────────────────────────────────────
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition(
      // only update when there's non-empty text
      (newText) => {
        const t = newText.trim();
        if (t) setTranscript(t);
      },
      (error) => {
        console.error("Speech recognition error", error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Speech recognition error: " + error.error,
          variant: "destructive",
        });
      }
    );

    if (!recognitionRef.current) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // ── Vapi SDK loader ────────────────────────────────────────────────────────
  useEffect(() => {
    if (vapiApiKey && typeof window !== "undefined") {
      loadVapiSDK(vapiApiKey)
        .then((sdk) => {
          vapiInstance.current = sdk;
        })
        .catch((err: any) => {
          console.error(err);
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        });
    }
  }, [vapiApiKey]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        toast({
          title: "Speech recognition not available",
          description: "Your browser doesn't support speech recognition",
          variant: "destructive",
        });
        return;
      }
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript("");
    }
  };

  const handleSendMessage = async () => {
    if (!transcript.trim()) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: transcript }],
    };
    setMessages((prev) => [...prev, userMessage]);
    setTranscript("");
    setLoading(true);

    try {
      const { assistantMessage, responseText } = await sendMessageToGemini(
        GEMINI_API_KEY,
        messages,
        userMessage
      );
      setMessages((prev) => [...prev, assistantMessage]);

      if (vapiInstance.current && vapiApiKey) {
        const success = await createVapiCall(
          vapiInstance.current,
          responseText
        );
        if (!success) speakWithBrowserTTS(responseText);
      } else {
        speakWithBrowserTTS(responseText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to communicate with Gemini API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>AninoDev</CardTitle>
          </CardHeader>

          <CardContent>
            <ApiKeyInputs
              vapiApiKey={vapiApiKey}
              onVapiKeyChange={setVapiApiKey}
            />

            <ChatDisplay messages={messages} loading={loading} />

            <MessageInput
              transcript={transcript}
              isListening={isListening}
              loading={loading}
              onTranscriptChange={setTranscript}
              onToggleListening={toggleListening}
              onSendMessage={handleSendMessage}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <p className="text-xs text-gray-500">
              {isListening ? "Listening..." : "Microphone off"}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
