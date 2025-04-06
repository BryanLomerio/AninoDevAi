export const initSpeechRecognition = (
  onResult: (text: string) => void,
  onError: (error: any) => void
) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  const SpeechRecognitionAPI = (window as any).SpeechRecognition ||
                               (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        onResult(transcript);
      } else {
        interimTranscript += transcript;
      }
    }
    if (interimTranscript) {
      onResult(interimTranscript);
    }
  };

  recognition.onerror = onError;

  return recognition;
};
