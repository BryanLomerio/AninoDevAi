import { GoogleGenAI } from "@google/genai";

export const speakWithBrowserTTS = (text: string, voice?: SpeechSynthesisVoice) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
    };

    const voices = window.speechSynthesis.getVoices();

    if (voice && voices.includes(voice)) {
      utterance.voice = voice;
    } else {
      const defaultVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("male") ||
            /david|mark|fred|alex|paul|zarvox|bruce/.test(v.name.toLowerCase())
        ) || voices[0];
      utterance.voice = defaultVoice;
    }

    utterance.rate = 1.2;
    utterance.pitch = 1;
    utterance.volume = 3;

    // delay for mobile
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }
};

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL_NAME = "gemini-2.0-flash";

export type Message = {
  role: "user" | "assistant";
  parts: { text: string }[];
};

function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019''"]/g, "")
    .replace(/[^a-zA-Z0-9\s\u00C0-\u024F\u1E00-\u1EFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const sendMessageToGemini = async (
  apiKey: string,
  messages: Message[],
  userMessage: Message
): Promise<{ assistantMessage: Message; responseText: string }> => {
  const incomingRaw = userMessage.parts[0].text.trim();
  const incoming = incomingRaw.toLowerCase();

  if (incoming === "url") {
    const url = "wss://app.evoxcharge.ph:8040/";
    const assistantMessage: Message = {
      role: "assistant",
      parts: [{ text: url }],
    };
    return { assistantMessage, responseText: url };
  }

  const cleaned = normalizeInput(userMessage.parts[0].text);

  // Handle EVOxCharge EV charger list request
  if (cleaned.includes("evoxcharge stations") || cleaned.includes("list of ev chargers of evoxcharge")) {
    const tableText = `### **PRIVATE**

- NLEX Balintawak
- Sta. Elena Golf Club
- Six/NEO
- NYK-Fil Maritime E-Training, Inc
- NLEX ODB Compound
- NYK-Fil Ship Management Inc.
- Pacific Plaza Tower
- Shang Residences at Wack Wack
- Yusen Logistics Center - Laguna

### **PUBLIC**

- MOA Square
- Newport World Resorts - 2F
- AIA Tower
- Acuatico Beach Resort
- World Trade Center
- Baguio Country Club
- R Garage
- IIEE Main Office
- EVOxCharge - In.Hub Station
- AIAI Philippines Cebu
- Newport World Resorts - 4F (Under Maintenance)
- Baguio Country Club
- Escala Tagaytay`;
    const assistantMessage: Message = {
      role: "assistant",
      parts: [{ text: tableText }],
    };
    return { assistantMessage, responseText: tableText };
  }

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
  ];

  if (creatorKeywords.some((q) => cleaned.includes(q))) {
    const customText = "I was created by Bryan Lomerio, a fullstack developer from the Philippines.";
    const assistantMessage: Message = {
      role: "assistant",
      parts: [{ text: customText }],
    };

    return { assistantMessage, responseText: customText };
  }

  // Analyze the query to determine the appropriate response approach
  const queryAnalysis = analyzeQuery(userMessage.parts[0].text, messages);

  // Enhanced system prompt with critical thinking instructions
  const personaMessage: Message = {
    role: "user",
    parts: [
      {
        text: `
        You are an intelligent and helpful AI assistant named AninoDevAI.

        Your name is **AninoDevAI**, and you may refer to yourself that way when it's natural, such as when introducing yourself or when the user asks "What is your name?" or "Who are you?"

        You don't need to mention your name in every response. Speak like a natural AI assistant.

        IMPORTANT INSTRUCTIONS FOR CRITICAL THINKING:
        - ${queryAnalysis.responseApproach}
        - When answering questions, first consider multiple perspectives and approaches
        - Break down complex problems into smaller components
        - Provide evidence and reasoning for your statements
        - Consider limitations and uncertainties in your knowledge
        - For technical questions, provide accurate, detailed explanations with examples
        - For conceptual questions, use analogies and clear explanations
        - For problem-solving, provide step-by-step solutions with explanations
        - Acknowledge when a topic has multiple valid viewpoints
        - Complexity level: ${queryAnalysis.complexity}

        Respond helpfully, clearly, and concisely.
        `.trim(),
      },
    ],
  };

  // Add context-specific instructions based on query analysis
  if (queryAnalysis.domains.includes("Software Development") ||
      queryAnalysis.domains.includes("Programming")) {
    personaMessage.parts[0].text += `
      When discussing code or programming:
      - Provide working, well-structured code examples
      - Explain the reasoning behind implementation choices
      - Consider performance, readability, and maintainability
      - Highlight potential edge cases or limitations
      - Use modern best practices and patterns
    `;
  }

  if (queryAnalysis.domains.includes("Artificial Intelligence")) {
    personaMessage.parts[0].text += `
      When discussing AI topics:
      - Explain concepts in accessible terms while maintaining technical accuracy
      - Acknowledge both capabilities and limitations of AI technologies
      - Consider ethical implications where relevant
      - Distinguish between established facts and areas of ongoing research
    `;
  }

  if (queryAnalysis.intent === "Comparison") {
    personaMessage.parts[0].text += `
      For this comparison:
      - Provide a structured analysis of similarities and differences
      - Consider multiple dimensions of comparison
      - Highlight strengths and weaknesses of each option
      - Provide context for when each option might be preferred
      - Avoid oversimplification of complex differences
    `;
  }

  const contents = [personaMessage, ...messages, userMessage];

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
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Failed to get response from Gemini");
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response";

  const assistantMessage: Message = {
    role: "assistant",
    parts: [{ text: responseText }],
  };

  return { assistantMessage, responseText };
};

// New function to analyze the query and determine the best response approach
function analyzeQuery(query: string, previousMessages: Message[]) {
  const lowercaseQuery = query.toLowerCase();

  // Extract topics
  const topics = [];

  if (lowercaseQuery.includes("code") || lowercaseQuery.includes("programming") ||
      lowercaseQuery.includes("javascript") || lowercaseQuery.includes("typescript") ||
      lowercaseQuery.includes("react") || lowercaseQuery.includes("python")) {
    topics.push("programming");
  }

  if (lowercaseQuery.includes("ai") || lowercaseQuery.includes("machine learning") ||
      lowercaseQuery.includes("artificial intelligence") || lowercaseQuery.includes("model")) {
    topics.push("artificial intelligence");
  }

  // Determine domains
  const domains = [];

  if (topics.includes("programming")) {
    if (lowercaseQuery.includes("architecture") || lowercaseQuery.includes("design pattern")) {
      domains.push("Software Architecture");
    } else if (lowercaseQuery.includes("algorithm") || lowercaseQuery.includes("data structure")) {
      domains.push("Algorithms & Data Structures");
    } else {
      domains.push("Software Development");
    }
  }

  if (topics.includes("artificial intelligence")) {
    if (lowercaseQuery.includes("ethics") || lowercaseQuery.includes("bias")) {
      domains.push("AI Ethics");
    } else {
      domains.push("Artificial Intelligence");
    }
  }

  // Determine intent
  let intent = "General Request";

  if (lowercaseQuery.includes("?") || lowercaseQuery.startsWith("what") ||
      lowercaseQuery.startsWith("how") || lowercaseQuery.startsWith("why")) {
    intent = "Information Seeking";
  } else if (lowercaseQuery.startsWith("compare") || lowercaseQuery.includes("vs") ||
             lowercaseQuery.includes("versus") || lowercaseQuery.includes("differences between")) {
    intent = "Comparison";
  } else if (lowercaseQuery.startsWith("fix") || lowercaseQuery.startsWith("debug") ||
             lowercaseQuery.includes("error") || lowercaseQuery.includes("problem")) {
    intent = "Problem Solving";
  }

  // Determine complexity
  const wordCount = query.split(/\s+/).length;
  const technicalTerms = [
    "algorithm", "implementation", "architecture", "framework", "optimization",
    "complexity", "paradigm", "abstraction", "recursion", "polymorphism"
  ];
  const hasTechnicalTerms = technicalTerms.some(term => lowercaseQuery.includes(term));

  let complexity = "Medium";
  if (wordCount > 30 || hasTechnicalTerms) {
    complexity = "High";
  } else if (wordCount < 10 && !hasTechnicalTerms) {
    complexity = "Low";
  }

  // Determine response approach
  let responseApproach = "Provide a helpful, conversational response that addresses the user's needs";

  if (domains.includes("Software Development") || domains.includes("Algorithms & Data Structures")) {
    responseApproach = "Provide a structured, technical response with practical examples and explanations";
  } else if (domains.includes("Artificial Intelligence")) {
    responseApproach = "Provide an informative explanation balancing technical accuracy with accessibility";
  } else if (intent === "Comparison") {
    responseApproach = "Provide a structured analysis of similarities, differences, and appropriate use cases";
  } else if (intent === "Problem Solving") {
    responseApproach = "Provide a structured solution with explanations of the underlying issues and step-by-step guidance";
  }

  // Consider conversation context
  const hasContext = previousMessages.length > 0;

  return {
    topics,
    domains,
    intent,
    complexity,
    responseApproach,
    hasContext
  };
}

export const isImageGenerationRequest = (text: string): boolean => {
  const normalized = text.toLowerCase().trim();

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
  ];

  return imageRequestPatterns.some((pattern) => normalized.includes(pattern));
};

export const extractImagePrompt = (text: string): string => {
  const normalized = text.toLowerCase().trim();

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
  ];

  for (const prefix of prefixes) {
    if (normalized.includes(prefix)) {
      return text.substring(text.toLowerCase().indexOf(prefix) + prefix.length).trim();
    }
  }

  return text;
};

export const generateImageFromGemini = async (apiKey: string, prompt: string): Promise<{ text?: string; imageSrc?: string }> => {
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
