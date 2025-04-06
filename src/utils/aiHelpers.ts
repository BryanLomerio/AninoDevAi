export const speakWithBrowserTTS = (text: string, voice?: SpeechSynthesisVoice) => {
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

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_NAME = "gemini-2.0-flash";

export type Message = {
  role: "user" | "assistant";
  parts: { text: string }[];
};

export const sendMessageToGemini = async (
  apiKey: string,
  messages: Message[],
  userMessage: Message
): Promise<{ assistantMessage: Message; responseText: string }> => {

  const personaMessage: Message = {
    role: "user",
    parts: [
      {
        text: `
  You are an intelligent and helpful AI assistant named AninoDevAI.

  Your name is **AninoDevAI**, and you may refer to yourself that way when it’s natural, such as when introducing yourself or when the user asks "What is your name?" or "Who are you?"

  You don't need to mention your name in every response. Speak like a natural AI assistant.

  Respond helpfully, clearly, and concisely.
        `.trim()
      }
    ]
  };

  const contents = [personaMessage, ...messages, userMessage];

  const response = await fetch(
    `${API_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Failed to get response from Gemini");
  }

  const responseText =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't generate a response";

  const assistantMessage: Message = {
    role: "assistant",
    parts: [{ text: responseText }],
  };

  return { assistantMessage, responseText };
};
