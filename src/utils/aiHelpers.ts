
export const speakWithBrowserTTS = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

// Updated API URL with the correct model name format
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_NAME = "gemini-2.0-flash"; // Updated from "gemini-pro" to "gemini-2.0-flash"

export type Message = { 
  role: string; 
  parts: { text: string }[] 
};

export const sendMessageToGemini = async (
  apiKey: string,
  messages: Message[],
  userMessage: Message
): Promise<{ assistantMessage: Message; responseText: string }> => {
  // Updated endpoint to use the correct model name
  const response = await fetch(`${API_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        ...messages,
        userMessage
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || "Failed to get response from Gemini");
  }
  
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response";
  const assistantMessage = { role: "assistant", parts: [{ text: responseText }] };
  
  return { assistantMessage, responseText };
};
