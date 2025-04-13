# AninoDevAI - Voice AI Assistant
<div align="center" style="display: flex; justify-content: center; gap: 20px;">
  <img src="public/future.png" alt="AninoDevAI Logo" width="auto" height="300"/>
</div>
 <img src="public/devai.png" alt="AninoDevAI Logo" width="auto" height="400"/>

A voice-enabled AI assistant that allows natural conversations through speech recognition and synthesis, powered by Google's Gemini AI.

## Features
- Voice input/output
- Real-time speech recognition
- AI-powered responses
- Custom voice selection
- Mobile responsive design

## Tech Stack
- React + TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- Google Gemini API
- Vapi AI SDK
- Browser Speech API
- Framer Motion
- TanStack Query
- React Router

## Setup

1. Clone the repository:
```bash
git clone https://github.com/BryanLomerio/AninoDevAi.git
cd AninoDevAi
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start development server:
```bash
npm run dev
```

Visit `http://localhost:8080`

## Build

```bash
npm run build
```

## Requirements
- Node.js 16+
- Modern web browser with speech recognition support
- Gemini API key
- Vapi API key (optional for enhanced voice)
