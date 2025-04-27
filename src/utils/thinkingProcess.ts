export interface ThinkingStep {
  thought: string
}

export const generateThinkingProcess = (prompt: string): ThinkingStep[] => {
  const steps: ThinkingStep[] = []
  const lowercasePrompt = prompt.toLowerCase()

  // Initial analysis
  steps.push({
    thought: `Analyzing query: "${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}"`,
  })

  // Extract key topics
  const topics = extractKeyTopics(lowercasePrompt)
  steps.push({
    thought: `Identifying key topics: ${topics.join(", ")}`,
  })

  // Identify knowledge domains with more specificity
  const domains = identifyDomains(lowercasePrompt, topics)
  steps.push({
    thought: `Considering knowledge domains: ${domains.join(", ")}`,
  })

  // Analyze query intent
  const intent = analyzeQueryIntent(lowercasePrompt)
  steps.push({
    thought: `Determining query intent: ${intent}`,
  })

  // Evaluate complexity
  const complexity = evaluateComplexity(lowercasePrompt, topics)
  steps.push({
    thought: `Assessing query complexity: ${complexity}`,
  })

  //prior knowledge
  if (topics.some((t) => t.includes("previous") || t.includes("before") || t.includes("earlier"))) {
    steps.push({
      thought: `Considering conversation context and prior exchanges for continuity`,
    })
  }

  steps.push({
    thought: determineResponseApproach(lowercasePrompt, topics, domains, intent, complexity),
  })

  //  limitations
  const limitations = identifyLimitations(topics, domains)
  if (limitations) {
    steps.push({
      thought: limitations,
    })
  }

  return steps
}

function extractKeyTopics(prompt: string): string[] {
  const topics = []


  if (prompt.includes("code") || prompt.includes("programming")) {
    if (prompt.includes("javascript") || prompt.includes("js")) topics.push("javascript")
    else if (prompt.includes("typescript") || prompt.includes("ts")) topics.push("typescript")
    else if (prompt.includes("react") || prompt.includes("component")) topics.push("react")
    else if (prompt.includes("python")) topics.push("python")
    else if (prompt.includes("java")) topics.push("java")
    else if (prompt.includes("c#") || prompt.includes("csharp")) topics.push("c#")
    else if (prompt.includes("database") || prompt.includes("sql")) topics.push("databases")
    else topics.push("programming")
  }

  // AI and ML with more specific categorization
  if (
    prompt.includes("ai") ||
    prompt.includes("machine learning") ||
    prompt.includes("artificial intelligence") ||
    prompt.includes("model")
  ) {
    if (prompt.includes("llm") || prompt.includes("language model") || prompt.includes("gpt"))
      topics.push("large language models")
    else if (prompt.includes("neural network") || prompt.includes("deep learning")) topics.push("neural networks")
    else if (prompt.includes("computer vision") || prompt.includes("image recognition")) topics.push("computer vision")
    else if (prompt.includes("nlp") || prompt.includes("natural language")) topics.push("natural language processing")
    else topics.push("artificial intelligence")
  }

  // Web development
  if (
    prompt.includes("web") ||
    prompt.includes("html") ||
    prompt.includes("css") ||
    prompt.includes("frontend") ||
    prompt.includes("backend")
  ) {
    topics.push("web development")
  }

  // Mobile development
  if (
    prompt.includes("mobile") ||
    prompt.includes("android") ||
    prompt.includes("ios") ||
    prompt.includes("app development")
  ) {
    topics.push("mobile development")
  }

  // Data science and analytics
  if (
    prompt.includes("data science") ||
    prompt.includes("analytics") ||
    prompt.includes("statistics") ||
    prompt.includes("visualization")
  ) {
    topics.push("data science")
  }

  // Identity and capabilities
  if (
    prompt.includes("who are you") ||
    prompt.includes("your name") ||
    prompt.includes("about you") ||
    prompt.includes("what can you do")
  ) {
    topics.push("assistant identity")
  }

  // Image generation
  if (
    (prompt.includes("image") || prompt.includes("picture") || prompt.includes("photo")) &&
    (prompt.includes("generate") || prompt.includes("create") || prompt.includes("make"))
  ) {
    topics.push("image generation")
  }

  // Conceptual understanding
  if (
    prompt.includes("explain") ||
    prompt.includes("how does") ||
    prompt.includes("what is") ||
    prompt.includes("concept")
  ) {
    topics.push("conceptual explanation")
  }

  // Problem solving
  if (
    prompt.includes("solve") ||
    prompt.includes("solution") ||
    prompt.includes("fix") ||
    prompt.includes("debug") ||
    prompt.includes("error")
  ) {
    topics.push("problem solving")
  }

  // No specific topics found
  if (topics.length === 0) {
    // Try to extract potential topics from key nouns
    const potentialTopics = extractPotentialTopics(prompt)
    if (potentialTopics.length > 0) {
      topics.push(...potentialTopics)
    } else {
      topics.push("general query")
    }
  }

  return topics
}

function extractPotentialTopics(prompt: string): string[] {
  const words = prompt.split(/\s+/)
  const potentialTopics = []

  // Common nouns
  const topicIndicators = [
    "science",
    "art",
    "history",
    "math",
    "business",
    "finance",
    "health",
    "medicine",
    "politics",
    "education",
    "technology",
    "philosophy",
    "psychology",
    "sociology",
    "economics",
    "engineering",
  ]

  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "").toLowerCase()
    if (topicIndicators.includes(cleanWord)) {
      potentialTopics.push(cleanWord)
    }
  }

  return potentialTopics
}

function identifyDomains(prompt: string, topics: string[]): string[] {
  const domains = []

  if (
    topics.includes("programming") ||
    topics.includes("javascript") ||
    topics.includes("typescript") ||
    topics.includes("react") ||
    topics.includes("python") ||
    topics.includes("java") ||
    topics.includes("c#")
  ) {
    if (prompt.includes("architecture") || prompt.includes("design pattern")) domains.push("Software Architecture")
    else if (prompt.includes("algorithm") || prompt.includes("data structure"))
      domains.push("Algorithms & Data Structures")
    else if (prompt.includes("test") || prompt.includes("unit test") || prompt.includes("integration"))
      domains.push("Software Testing")
    else if (prompt.includes("debug") || prompt.includes("error") || prompt.includes("fix"))
      domains.push("Debugging & Troubleshooting")
    else domains.push("Software Development")
  }

  // AI and ML domains
  if (
    topics.includes("artificial intelligence") ||
    topics.includes("large language models") ||
    topics.includes("neural networks") ||
    topics.includes("computer vision") ||
    topics.includes("natural language processing")
  ) {
    if (prompt.includes("ethics") || prompt.includes("bias") || prompt.includes("fairness")) domains.push("AI Ethics")
    else if (prompt.includes("implement") || prompt.includes("code") || prompt.includes("build"))
      domains.push("AI Implementation")
    else if (prompt.includes("concept") || prompt.includes("explain") || prompt.includes("how does"))
      domains.push("AI Concepts")
    else domains.push("Artificial Intelligence")
  }

  // Web and mobile development
  if (topics.includes("web development")) {
    if (prompt.includes("frontend") || prompt.includes("ui") || prompt.includes("user interface"))
      domains.push("Frontend Development")
    else if (prompt.includes("backend") || prompt.includes("server") || prompt.includes("api"))
      domains.push("Backend Development")
    else if (prompt.includes("responsive") || prompt.includes("mobile friendly")) domains.push("Responsive Design")
    else domains.push("Web Development")
  }

  if (topics.includes("mobile development")) {
    if (prompt.includes("android")) domains.push("Android Development")
    else if (prompt.includes("ios") || prompt.includes("swift")) domains.push("iOS Development")
    else if (prompt.includes("react native") || prompt.includes("flutter")) domains.push("Cross-platform Development")
    else domains.push("Mobile Development")
  }

  // Data science
  if (topics.includes("data science")) {
    if (prompt.includes("visualization") || prompt.includes("chart") || prompt.includes("graph"))
      domains.push("Data Visualization")
    else if (prompt.includes("analysis") || prompt.includes("analyze")) domains.push("Data Analysis")
    else if (prompt.includes("statistics") || prompt.includes("statistical")) domains.push("Statistical Analysis")
    else domains.push("Data Science")
  }

  // Assistant identity
  if (topics.includes("assistant identity")) {
    domains.push("Assistant Capabilities")
  }

  // Image generation
  if (topics.includes("image generation")) {
    domains.push("Generative AI")
  }

  // Conceptual explanations
  if (topics.includes("conceptual explanation")) {
    domains.push("Educational Content")
  }

  // Problem solving
  if (topics.includes("problem solving")) {
    domains.push("Technical Troubleshooting")
  }

  // If no specific domains identified, use a general domain
  if (domains.length === 0) {
    domains.push("General Knowledge")
  }

  return domains
}

function analyzeQueryIntent(prompt: string): string {

  if (
    prompt.includes("?") ||
    prompt.startsWith("what") ||
    prompt.startsWith("how") ||
    prompt.startsWith("why") ||
    prompt.startsWith("when") ||
    prompt.startsWith("where") ||
    prompt.startsWith("can you explain")
  ) {
    return "Information Seeking"
  }

  if (
    prompt.startsWith("generate") ||
    prompt.startsWith("create") ||
    prompt.startsWith("make") ||
    prompt.startsWith("build") ||
    prompt.includes("can you generate") ||
    prompt.includes("can you create")
  ) {
    return "Content Generation"
  }

  if (
    prompt.startsWith("fix") ||
    prompt.startsWith("debug") ||
    prompt.startsWith("solve") ||
    prompt.startsWith("help me with") ||
    prompt.includes("error") ||
    prompt.includes("problem")
  ) {
    return "Problem Solving"
  }

  if (
    prompt.startsWith("compare") ||
    prompt.startsWith("contrast") ||
    prompt.startsWith("what is better") ||
    prompt.includes("vs") ||
    prompt.includes("versus") ||
    prompt.includes("differences between")
  ) {
    return "Comparison"
  }

  if (
    prompt.startsWith("summarize") ||
    prompt.startsWith("tldr") ||
    prompt.includes("in brief") ||
    prompt.includes("summary of")
  ) {
    return "Summarization"
  }

  if (prompt.includes("opinion") || prompt.includes("what do you think") || prompt.includes("your thoughts")) {
    return "Opinion Seeking"
  }

  return "General Request"
}

function evaluateComplexity(prompt: string, topics: string[]): string {
  // Evaluate the complexity of the query

  // Check word count as a basic complexity indicator
  const wordCount = prompt.split(/\s+/).length

  // Check for multiple topics as an indicator of complexity
  const multipleTopics = topics.length > 1

  // Check for technical terms
  const technicalTerms = [
    "algorithm",
    "implementation",
    "architecture",
    "framework",
    "optimization",
    "complexity",
    "paradigm",
    "abstraction",
    "recursion",
    "polymorphism",
    "inheritance",
    "encapsulation",
  ]

  const hasTechnicalTerms = technicalTerms.some((term) => prompt.includes(term))

  const nuanceIndicators = [
    "difference between",
    "compare",
    "contrast",
    "pros and cons",
    "advantages and disadvantages",
    "trade-offs",
    "best practices",
    "in-depth",
    "detailed",
    "comprehensive",
    "nuanced",
  ]

  const hasNuanceIndicators = nuanceIndicators.some((indicator) => prompt.includes(indicator))


  if ((wordCount > 30 && (multipleTopics || hasTechnicalTerms)) || (hasTechnicalTerms && hasNuanceIndicators)) {
    return "High"
  } else if ((wordCount > 15 && (multipleTopics || hasTechnicalTerms)) || hasNuanceIndicators) {
    return "Medium"
  } else {
    return "Low"
  }
}

function determineResponseApproach(
  prompt: string,
  topics: string[],
  domains: string[],
  intent: string,
  complexity: string,
): string {

  if (
    topics.some(
      (t) =>
        t === "programming" ||
        t === "javascript" ||
        t === "typescript" ||
        t === "react" ||
        t === "python" ||
        t === "java" ||
        t === "c#",
    )
  ) {
    if (intent === "Problem Solving") {
      return "This is a technical troubleshooting query. I'll provide a structured solution with explanations of the underlying issues and step-by-step guidance."
    }

    if (intent === "Information Seeking" && complexity === "High") {
      return "This is a complex technical question. I'll provide a comprehensive explanation with examples, code snippets where appropriate, and references to best practices."
    }

    return "This is a programming-related query. I'll provide a clear, technically accurate response with practical examples and explanations."
  }

  // For AI and ML queries
  if (topics.some((t) => t === "artificial intelligence" || t === "large language models" || t === "neural networks")) {
    if (domains.includes("AI Ethics")) {
      return "This query relates to AI ethics. I'll provide a balanced perspective that considers multiple viewpoints and ethical frameworks."
    }

    if (intent === "Comparison") {
      return "This is a comparison of AI concepts or technologies. I'll provide a structured analysis of similarities, differences, and appropriate use cases."
    }

    return "This query is about AI technology. I'll provide an informative explanation balancing technical accuracy with accessibility."
  }

  // For image generation
  if (topics.includes("image generation")) {
    return "This request involves generating visual content. I'll check if it's a direct image generation request or a question about image capabilities."
  }

  // For identity questions
  if (topics.includes("assistant identity")) {
    return "This is a question about who I am. I'll provide a clear explanation of my identity as AninoDevAI."
  }

  // For conceptual explanations
  if (topics.includes("conceptual explanation")) {
    if (complexity === "High") {
      return "This is a request for a complex conceptual explanation. I'll provide a comprehensive response with analogies, examples, and a logical structure to build understanding."
    } else {
      return "This is a request for a conceptual explanation. I'll provide a clear, accessible explanation with relevant examples."
    }
  }

  // For general information seeking
  if (intent === "Information Seeking") {
    return "This appears to be an informational question. I'll provide a helpful, factual response with relevant context and sources where appropriate."
  }

  // For content generation
  if (intent === "Content Generation") {
    return "This is a content generation request. I'll create high-quality, relevant content that meets the specified requirements."
  }

  // Default approach
  return "This is a general input. I'll provide a helpful, conversational response that addresses the user's needs while maintaining accuracy and relevance."
}

function identifyLimitations(topics: string[], domains: string[]): string | null {
  if (topics.includes("artificial intelligence") || domains.includes("AI Ethics")) {
    return "Acknowledging that AI discussions may involve evolving concepts and that I should present balanced perspectives on capabilities and limitations"
  }

  if (domains.includes("Technical Troubleshooting") || domains.includes("Debugging & Troubleshooting")) {
    return "Recognizing that troubleshooting requires context-specific information, and my suggestions should be adaptable to the user's specific environment"
  }

  if (topics.includes("data science") || domains.includes("Statistical Analysis")) {
    return "Noting that data analysis discussions benefit from specific datasets and contexts, and my general principles may need adaptation"
  }

  if (domains.includes("Opinion Seeking")) {
    return "Recognizing that while I can provide analysis based on information, I should clarify when topics involve subjective judgments or evolving fields"
  }

  return null
}
