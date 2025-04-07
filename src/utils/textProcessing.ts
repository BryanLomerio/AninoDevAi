
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

