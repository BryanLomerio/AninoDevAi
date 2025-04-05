/// <reference types="vite/client" />

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare module '@vapi-ai/web' {
  export function createVAPI(apiKey: string): any;
}

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;

}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
