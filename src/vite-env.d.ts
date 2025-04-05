
/// <reference types="vite/client" />

// Add type definitions for the Web Speech API
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// Add type definition for Vapi
declare module '@vapi-ai/web' {
  export function createVAPI(apiKey: string): any;
  // Add other Vapi types as needed
}

