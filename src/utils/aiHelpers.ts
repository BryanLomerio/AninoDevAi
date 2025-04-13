import { GoogleGenAI } from "@google/genai"

export const speakWithBrowserTTS = (text: string, voice?: SpeechSynthesisVoice) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event)
    }

    // Force get voices for mobile
    const voices = window.speechSynthesis.getVoices()

    if (voice && voices.includes(voice)) {
      utterance.voice = voice
    } else {
      const defaultVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("male") ||
            /david|mark|fred|alex|paul|zarvox|bruce/.test(v.name.toLowerCase())
        ) || voices[0]
      utterance.voice = defaultVoice
    }

    utterance.rate = 1.2
    utterance.pitch = 1
    utterance.volume = 3

    // delay for mobile
    setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 50)
  }
}

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models"
const MODEL_NAME = "gemini-2.0-flash"

export type Message = {
  role: "user" | "assistant"
  parts: { text: string }[]
}

function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .replace(/[''"]/g, "")
    .replace(/[^a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export const sendMessageToGemini = async (
  apiKey: string,
  messages: Message[],
  userMessage: Message,
): Promise<{ assistantMessage: Message; responseText: string }> => {
  const cleaned = normalizeInput(userMessage.parts[0].text)

  const creatorKeywords = [
    "who created you",
    "who made you",
    "who is your creator",
    "who built you",
    "who created aninodev ai",
    "who made aninodev ai",
    "who built aninodev ai",
    "sino gumawa sayo",
    "sino gumawa sa iyo",
    "gumawa sayo",
    "gumawa sa iyo",
    "sino gumawa saiyo",
    "sino gumawa sa yo",
    "gumawa ng aninodev ai",
    "gumawa ng ai",
  ]

  if (creatorKeywords.some((q) => cleaned.includes(q))) {
    const customText = "I was created by Bryan Lomerio, a fullstack developer from the Philippines."
    const assistantMessage: Message = {
      role: "assistant",
      parts: [{ text: customText }],
    }

    return { assistantMessage, responseText: customText }
  }

  const personaMessage: Message = {
    role: "user",
    parts: [
      {
        text: `
        You are an intelligent and helpful AI assistant named AninoDevAI.

        Your name is **AninoDevAI**, and you may refer to yourself that way when it's natural, such as when introducing yourself or when the user asks "What is your name?" or "Who are you?"

        You don't need to mention your name in every response. Speak like a natural AI assistant.

        Respond helpfully, clearly, and concisely.
        `.trim(),
      },
    ],
  }

  const contents = [personaMessage, ...messages, userMessage]

  const response = await fetch(`${API_URL}/${MODEL_NAME}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 10000,
      },
    }),
  })

  const data = await response.json()
  if (data.error) {
    throw new Error(data.error.message || "Failed to get response from Gemini")
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response"

  const assistantMessage: Message = {
    role: "assistant",
    parts: [{ text: responseText }],
  }

  return { assistantMessage, responseText }
}

export const isImageGenerationRequest = (text: string): boolean => {
  const normalized = text.toLowerCase().trim()

  const imageRequestPatterns = [
    // Generate patterns
    "generate an image",
    "generate a picture",
    "generate image",
    "generate picture",
    "generate me an image",
    "generate me a picture",
    "generate me image",
    "generate me picture",

    // Create patterns
    "create an image",
    "create a picture",
    "create image",
    "create picture",
    "create me an image",
    "create me a picture",
    "create me image",
    "create me picture",

    // Make patterns
    "make an image",
    "make a picture",
    "make image",
    "make picture",
    "make me an image",
    "make me a picture",
    "make me image",
    "make me picture",

    // Give patterns
    "give me an image",
    "give me a picture",
    "give me image",
    "give me picture",
    "give an image",
    "give a picture",

    // Show patterns
    "show me an image",
    "show me a picture",
    "show me image",
    "show me picture",
    "show an image",
    "show a picture",

    // Draw patterns
    "draw",
    "draw me",
    "draw an image",
    "draw a picture",

    // Direct requests
    "image of",
    "picture of",
    "photo of",
    "i want an image of",
    "i want a picture of",
    "i need an image of",
    "i need a picture of",

    // Visualization requests
    "visualize",
    "render",
    "illustrate",
    "can you show",
    "can you create",
    "can you generate",
    "can you make",
    "can you draw",
  ]

  return imageRequestPatterns.some((pattern) => normalized.includes(pattern))
}

export const extractImagePrompt = (text: string): string => {
  const normalized = text.toLowerCase().trim()

  const prefixes = [
    // Generate patterns
    "generate an image of",
    "generate a picture of",
    "generate image of",
    "generate picture of",
    "generate me an image of",
    "generate me a picture of",
    "generate me image of",
    "generate me picture of",

    // Create patterns
    "create an image of",
    "create a picture of",
    "create image of",
    "create picture of",
    "create me an image of",
    "create me a picture of",
    "create me image of",
    "create me picture of",

    // Make patterns
    "make an image of",
    "make a picture of",
    "make image of",
    "make picture of",
    "make me an image of",
    "make me a picture of",
    "make me image of",
    "make me picture of",

    // Give patterns
    "give me an image of",
    "give me a picture of",
    "give me image of",
    "give me picture of",
    "give an image of",
    "give a picture of",

    // Show patterns
    "show me an image of",
    "show me a picture of",
    "show me image of",
    "show me picture of",
    "show an image of",
    "show a picture of",

    // Draw patterns
    "draw",
    "draw me",
    "draw an image of",
    "draw a picture of",

    // Direct requests
    "image of",
    "picture of",
    "photo of",
    "i want an image of",
    "i want a picture of",
    "i need an image of",
    "i need a picture of",

    // Visualization requests
    "visualize",
    "render",
    "illustrate",
    "can you show me",
    "can you create an image of",
    "can you generate an image of",
    "can you make an image of",
    "can you draw",
  ]

  for (const prefix of prefixes) {
    if (normalized.includes(prefix)) {
      return text.substring(text.toLowerCase().indexOf(prefix) + prefix.length).trim()
    }
  }

  return text
}

export type ImageGenerationResult = {
  text?: string
  imageSrc?: string
}

export const generateImageFromGemini = async (apiKey: string, prompt: string): Promise<ImageGenerationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    console.log("Sending image generation request with prompt:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    let resultText = "";
    let imageSrc = "";

    //  extract text and image data.
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        resultText += part.text;
      } else if (part.inlineData) {
        imageSrc = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // If no image data is returned
    if (!imageSrc) {
      console.warn("No image data returned from Gemini API");
      return {
        text: "Please turn on image generation to generate an image like that.",
        imageSrc: undefined,
      };
    }

    return { text: resultText, imageSrc };
  } catch (error) {
    console.error("Error generating image:", error);

    // error handling
    let errorMessage = "Please turn on image generation to generate an image like that.";

    if (error instanceof Error) {
      if (error.message.includes("content policy")) {
        errorMessage =
          "I couldn't generate that image due to content policy restrictions. Please try a different description or turn on image generation.";
      } else if (error.message.includes("quota")) {
        errorMessage = "I've reached my image generation quota. Please try again later or enable image generation.";
      } else {
        errorMessage = `Error generating image: ${error.message}`;
      }
    }

    return {
      text: errorMessage,
      imageSrc: undefined,
    };
  }
};
