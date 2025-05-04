export const speak = (text: string, rate = 1, pitch = 1, volume = 1): SpeechSynthesisUtterance | null => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.error("Speech synthesis not supported in this browser")
    return null
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  // Get available voices
  const voices = window.speechSynthesis.getVoices()

  // Try to find a good English voice
  const englishVoice = voices.find(
    (voice) => (voice.lang.includes("en") && voice.name.includes("Google")) || voice.name.includes("Female"),
  )

  if (englishVoice) {
    utterance.voice = englishVoice
  }

  // Set speech properties
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.volume = volume

  // Speak the text
  window.speechSynthesis.speak(utterance)

  return utterance
}

export const stopSpeaking = (): void => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== "undefined" && "speechSynthesis" in window
}
