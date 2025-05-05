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

export const speak = (text: string, rate = 1, pitch = 1, volume = 1): SpeechSynthesisUtterance | null => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.error("Speech synthesis not supported in this browser")
    return null
  }

  window.speechSynthesis.cancel()

  const chunks = chunkText(text)
  if (chunks.length === 0) return null

  // Get available voices
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(
    (voice) => (voice.lang.includes("en") && voice.name.includes("Google")) || voice.name.includes("Female"),
  )

  if (chunks.length === 1) {
    const utterance = new SpeechSynthesisUtterance(chunks[0])

    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    window.speechSynthesis.speak(utterance)
    return utterance
  }

  let currentChunkIndex = 0

  const speakNextChunk = () => {
    if (currentChunkIndex >= chunks.length) return

    const chunk = chunks[currentChunkIndex]
    const utterance = new SpeechSynthesisUtterance(chunk)

    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    if (currentChunkIndex < chunks.length - 1) {
      utterance.onend = () => {
        currentChunkIndex++
        speakNextChunk()
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  speakNextChunk()

  const firstUtterance = new SpeechSynthesisUtterance(chunks[0])
  if (englishVoice) {
    firstUtterance.voice = englishVoice
  }
  firstUtterance.rate = rate
  firstUtterance.pitch = pitch
  firstUtterance.volume = volume

  return firstUtterance
}

export const stopSpeaking = (): void => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== "undefined" && "speechSynthesis" in window
}
