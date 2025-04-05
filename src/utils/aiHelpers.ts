
export const speakWithBrowserTTS = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    // Ensure voices are loaded
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        const femaleVoice = voices.find(voice => voice.name.toLowerCase().includes('female'));

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        } else {
          utterance.voice = voices[0];
        }

        // Speak the text
        window.speechSynthesis.speak(utterance);
      }
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }


    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }
  }
};



const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_NAME = "gemini-2.0-flash";

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
