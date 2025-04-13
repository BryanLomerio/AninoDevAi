/// <reference types="vite/client" />

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
}

interface Window {
  SpeechRecognition: {
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
  };
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

export {};
