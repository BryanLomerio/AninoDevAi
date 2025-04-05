
/// <reference types="vite/client" />

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare module '@vapi-ai/web' {
  export function createVAPI(apiKey: string): any;
}

