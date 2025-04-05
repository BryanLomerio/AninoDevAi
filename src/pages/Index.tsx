
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ApiKeyInputs from "@/components/ApiKeyInputs";
import ChatDisplay from "@/components/ChatDisplay";
import MessageInput from "@/components/MessageInput";
import { initSpeechRecognition } from "@/utils/speechRecognition";
import { loadVapiSDK, createVapiCall } from "@/utils/vapiHelper";
import { speakWithBrowserTTS, sendMessageToGemini, type Message } from "@/utils/aiHelpers";

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [vapiApiKey, setVapiApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  
  const vapiInstance = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    recognitionRef.current = initSpeechRecognition(
      (newText) => {
        setTranscript(prev => {
          const finalText = prev + ' ' + newText;
          return finalText.trim();
        });
      },
      (error) => {
        console.error('Speech recognition error', error);
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
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (vapiApiKey && typeof window !== 'undefined') {
      const initVapi = async () => {
        try {
          vapiInstance.current = await loadVapiSDK(vapiApiKey);
          console.log("Vapi SDK loaded");
        } catch (err: any) {
          console.error(err);
          toast({
            title: "Error",
            description: err.message,
            variant: "destructive",
          });
        }
      };
      
      initVapi();
    }
  }, [vapiApiKey]);

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
    
    if (!geminiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage = { role: "user", parts: [{ text: transcript }] };
    setMessages(prev => [...prev, userMessage]);
    setTranscript("");
    setLoading(true);
    
    try {
      const { assistantMessage, responseText } = await sendMessageToGemini(
        geminiApiKey,
        messages,
        userMessage
      );
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (vapiInstance.current && vapiApiKey) {
        const success = await createVapiCall(vapiInstance.current, responseText);
        if (!success) {
          speakWithBrowserTTS(responseText);
        }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>AI Voice Assistant</CardTitle>
            <CardDescription>
              Powered by Gemini and Vapi
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ApiKeyInputs
              geminiApiKey={geminiApiKey}
              vapiApiKey={vapiApiKey}
              onGeminiKeyChange={setGeminiApiKey}
              onVapiKeyChange={setVapiApiKey}
            />
            
            <ChatDisplay 
              messages={messages} 
              loading={loading} 
            />
            
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
