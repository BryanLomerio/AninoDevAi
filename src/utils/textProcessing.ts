export const stripMarkdown = (text: string): string => {
  if (!text) return "";

  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^#{1,6}\s*(.+)$/gm, "$1")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/___(.+?)___/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "image: $1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
};

export const initSpeechRecognition = (
  onResult: (text: string) => void,
  onError: (error: any) => void,
  speakResults = false
) => {

  const win = window as any;
  const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  const recognition = new SpeechRec();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const raw = event.results[i][0].transcript;
      const clean = stripMarkdown(raw);

      if (event.results[i].isFinal) {
        onResult(clean);
        if (speakResults) {
          const utter = new SpeechSynthesisUtterance(clean);
          window.speechSynthesis.speak(utter);
        }
      } else {
        interimTranscript += clean;
      }
    }

    if (interimTranscript) {
      onResult(interimTranscript);
    }
  };

  recognition.onerror = onError;
  return recognition;
};
