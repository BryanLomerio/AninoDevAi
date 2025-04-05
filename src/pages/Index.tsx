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
import { sendMessageToGemini, type Message } from "@/utils/aiHelpers";

const speakWithBrowserTTS = (text: string, voice?: SpeechSynthesisVoice) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
    };

    if (voice) {
      utterance.voice = voice;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const defaultVoice =
        voices.find((v) =>
          v.name.toLowerCase().includes("male") ||
          /david|mark|fred|alex|paul|zarvox|bruce/.test(v.name.toLowerCase())
        ) || voices[0];
      utterance.voice = defaultVoice;
    }

    utterance.rate = 1.2;
    utterance.pitch = 1;
    utterance.volume = 3;

    window.speechSynthesis.speak(utterance);
  }
};

const VoiceSelector: React.FC<{ onVoiceSelect: (voice: SpeechSynthesisVoice) => void }> = ({ onVoiceSelect }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(availableVoices[0].name);
        onVoiceSelect(availableVoices[0]);
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [onVoiceSelect, selectedVoiceName]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = event.target.value;
    setSelectedVoiceName(voiceName);
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) {
      onVoiceSelect(voice);
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="voice-select" className="text-white mr-2">
        Choose Voice:
      </label>
      <select
        id="voice-select"
        value={selectedVoiceName}
        onChange={handleChange}
        className="p-1 rounded"
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  );
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [vapiApiKey, setVapiApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const vapiInstance = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // ── Speech recognition setup ─────────────────────────────────────────────
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition(
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


  const handleVoiceSelect = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
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
        const success = await createVapiCall(vapiInstance.current, responseText);
        if (!success) {
          speakWithBrowserTTS(responseText, selectedVoice || undefined);
        }
      } else {
        speakWithBrowserTTS(responseText, selectedVoice || undefined);
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
    <div className="min-h-screen bg-[#1e1e1e] p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-white">AninoDev</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeyInputs vapiApiKey={vapiApiKey} onVapiKeyChange={setVapiApiKey} />
            <VoiceSelector onVoiceSelect={handleVoiceSelect} />
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
