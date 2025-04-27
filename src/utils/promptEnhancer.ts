export function enhancePromptWithCriticalThinking(prompt: string, topic: string): string {

  const baseCriticalThinking = [
    "Consider multiple perspectives on this topic",
    "Analyze the strengths and weaknesses of different approaches",
    "Provide evidence and reasoning for your statements",
    "Consider limitations and uncertainties in your knowledge",
    "Break down complex concepts into simpler components",
  ];

  const topicSpecificThinking: Record<string, string[]> = {
    programming: [
      "Evaluate code for efficiency, readability, and maintainability",
      "Consider edge cases and potential bugs",
      "Explain the reasoning behind implementation choices",
      "Compare alternative approaches and their trade-offs",
      "Consider best practices and design patterns",
    ],
    ai: [
      "Distinguish between established capabilities and speculative future developments",
      "Consider ethical implications and potential biases",
      "Explain technical concepts in accessible terms while maintaining accuracy",
      "Acknowledge limitations of current AI technologies",
      "Discuss both benefits and potential risks",
    ],
    science: [
      "Distinguish between established scientific consensus and emerging theories",
      "Explain the methodology behind scientific findings",
      "Consider alternative explanations for observed phenomena",
      "Acknowledge limitations in current scientific understanding",
      "Explain how scientific concepts relate to real-world applications",
    ],
    business: [
      "Consider multiple stakeholder perspectives",
      "Analyze short-term and long-term implications",
      "Evaluate risks and opportunities",
      "Consider market trends and competitive factors",
      "Discuss practical implementation challenges",
    ],
  };

  let thinkingElements = [...baseCriticalThinking];

  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes("program") || lowerTopic.includes("code") || lowerTopic.includes("develop")) {
    thinkingElements = [...thinkingElements, ...topicSpecificThinking.programming];
  } else if (lowerTopic.includes("ai") || lowerTopic.includes("machine learning") || lowerTopic.includes("model")) {
    thinkingElements = [...thinkingElements, ...topicSpecificThinking.ai];
  } else if (lowerTopic.includes("science") || lowerTopic.includes("physics") || lowerTopic.includes("biology")) {
    thinkingElements = [...thinkingElements, ...topicSpecificThinking.science];
  } else if (lowerTopic.includes("business") || lowerTopic.includes("market") || lowerTopic.includes("finance")) {
    thinkingElements = [...thinkingElements, ...topicSpecificThinking.business];
  }

  const selectedElements = thinkingElements.slice(0, 5);

  // Combine the original prompt with the critical thinking instructions
  const enhancedPrompt = `
${prompt}

When responding, please:
${selectedElements.map(element => `- ${element}`).join('\n')}
`;

  return enhancedPrompt;
}

export function createEnhancedSystemPrompt(queryType: string, complexity: string): string {
  const basePrompt = `
You are an intelligent and helpful AI assistant named AninoDevAI.

Your name is **AninoDevAI**, and you may refer to yourself that way when it's natural, such as when introducing yourself or when the user asks "What is your name?" or "Who are you?"

You don't need to mention your name in every response. Speak like a natural AI assistant.
`;

  let criticalThinkingInstructions = '';

  if (queryType === 'technical') {
    criticalThinkingInstructions = `
CRITICAL THINKING INSTRUCTIONS:
- Break down technical concepts into clear, understandable components
- Provide concrete examples and code snippets where appropriate
- Explain the reasoning behind technical decisions and recommendations
- Consider edge cases, limitations, and potential issues
- Compare alternative approaches when relevant
- Use precise, accurate terminology while remaining accessible
`;
  } else if (queryType === 'conceptual') {
    criticalThinkingInstructions = `
CRITICAL THINKING INSTRUCTIONS:
- Provide clear definitions and explanations of key concepts
- Use analogies and examples to illustrate abstract ideas
- Consider different perspectives and interpretations
- Acknowledge areas of ongoing debate or uncertainty
- Connect concepts to practical applications or real-world contexts
- Build explanations progressively from simple to more complex
`;
  } else if (queryType === 'problem-solving') {
    criticalThinkingInstructions = `
CRITICAL THINKING INSTRUCTIONS:
- Analyze the problem systematically, identifying key components
- Consider multiple solution approaches and their trade-offs
- Provide step-by-step guidance with clear reasoning
- Anticipate potential obstacles and how to address them
- Verify solutions against the original requirements
- Suggest ways to test or validate the solution
`;
  } else {
    criticalThinkingInstructions = `
CRITICAL THINKING INSTRUCTIONS:
- Consider multiple perspectives and approaches
- Provide evidence and reasoning for your statements
- Acknowledge limitations and uncertainties in your knowledge
- Structure your response logically and clearly
- Tailor your explanation to the appropriate level of detail
`;
  }

  let complexityInstructions = '';

  if (complexity === 'High') {
    complexityInstructions = `
COMPLEXITY LEVEL: High
- Provide comprehensive, nuanced explanations
- Address subtle distinctions and edge cases
- Include relevant technical details and context
- Consider advanced concepts and their implications
`;
  } else if (complexity === 'Medium') {
    complexityInstructions = `
COMPLEXITY LEVEL: Medium
- Balance depth with accessibility
- Provide sufficient detail without overwhelming
- Use clear examples to illustrate key points
- Focus on the most relevant aspects of the topic
`;
  } else {
    complexityInstructions = `
COMPLEXITY LEVEL: Basic
- Focus on clarity and simplicity
- Use straightforward language and examples
- Emphasize core concepts and practical applications
- Avoid unnecessary technical details
`;
  }

  return `${basePrompt}${criticalThinkingInstructions}${complexityInstructions}

Respond helpfully, clearly, and concisely.`;
}
