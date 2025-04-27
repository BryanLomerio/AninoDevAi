export const stripMarkdown = (text: string): string => {
  if (!text) return ""

  return (
    text
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/___([^_]+)___/g, "$1")
      .replace(/__([^_]+)__/g, "$1")

      // Headers
      .replace(/#{1,6}\s+(.+)/g, "$1")

      // Links
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$1")

      // Code blocks
      .replace(/```[\s\S]*?```/g, "code block omitted")
      .replace(/`([^`]+)`/g, "$1")

      // Lists
      .replace(/^\s*[-*+]\s+(.+)$/gm, "$1")
      .replace(/^\s*\d+\.\s+(.+)$/gm, "$1")

      // Blockquotes
      .replace(/^\s*>\s+(.+)$/gm, "$1")

      // Images
      .replace(/!\[([^\]]+)\]$$([^)]+)$$/g, "image: $1")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

export const enhanceTextResponse = (text: string): string => {

  if (text.includes("##") || (text.includes("#") && text.includes("\n"))) {
    return text
  }

  const paragraphs = text.split(/\n\n+/)
  if (paragraphs.length <= 1) {
    return text
  }

  const isList = paragraphs.some((p) => p.trim().startsWith("- ") || p.trim().startsWith("* "))
  if (isList) {
    return text
  }

  if (text.includes("```") || text.includes("function") || text.includes("class") || text.includes("const ")) {
    return text
  }

  let structured = ""

  structured += paragraphs[0] + "\n\n"

  for (let i = 1; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i]
    if (paragraph.length > 100) {

      const firstSentence = paragraph.split(/[.!?]/, 1)[0].trim()
      if (firstSentence.length > 10 && firstSentence.length < 60) {
        structured += `## ${firstSentence}\n\n`
        structured += paragraph.substring(firstSentence.length).trim() + "\n\n"
      } else {
        structured += paragraph + "\n\n"
      }
    } else {
      structured += paragraph + "\n\n"
    }
  }

  return structured.trim()
}

export const extractKeyPoints = (text: string): string[] => {

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  const keyPoints = sentences.filter((sentence) => {
    const s = sentence.toLowerCase().trim()
    return (
      s.includes("important") ||
      s.includes("key") ||
      s.includes("critical") ||
      s.includes("essential") ||
      s.includes("fundamental") ||
      s.includes("significant") ||
      s.startsWith("note that") ||
      s.startsWith("remember that")
    )
  })


  if (keyPoints.length >= 2) {
    return keyPoints.map((p) => p.trim())
  }

  const informativeSentences = sentences
    .filter((s) => s.length > 30 && s.length < 150)
    .filter((s) => !s.toLowerCase().includes("example"))
    .slice(0, 3) // Take up to 3

  return informativeSentences.map((s) => s.trim())
}
