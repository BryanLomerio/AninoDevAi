export const chunkText = (text: string, maxLength = 4000): string[] => {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let currentChunk = ""

  const sentences = text.split(/(?<=[.!?])\s+/)

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += (currentChunk ? " " : "") + sentence
    } else {
      chunks.push(currentChunk)
      currentChunk = sentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks
}

export const speakEnhanced = (text: string, rate = 1, pitch = 1, volume = 1): void => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.error("Speech synthesis not supported in this browser")
    return
  }

  window.speechSynthesis.cancel()
  const chunks = chunkText(text)

  // Get available voices
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(
    (voice) => (voice.lang.includes("en") && voice.name.includes("Google")) || voice.name.includes("Female"),
  )

  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk)

    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Only for debugging
    if (index > 0) {
      console.log(`Speaking chunk ${index + 1} of ${chunks.length}`)
    }

    window.speechSynthesis.speak(utterance)
  })
}
