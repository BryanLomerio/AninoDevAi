
export interface ThinkingStep {
  thought: string;
}

export const generateThinkingProcess = (prompt: string): ThinkingStep[] => {
  const steps: ThinkingStep[] = [];
  const lowercasePrompt = prompt.toLowerCase();
  steps.push({
    thought: `Analyzing query: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`
  });

  const topics = extractKeyTopics(lowercasePrompt);
  steps.push({
    thought: `Identifying key topics: ${topics.join(', ')}`
  });

  const domains = identifyDomains(lowercasePrompt, topics);
  steps.push({
    thought: `Considering knowledge domains: ${domains}`
  });

  steps.push({
    thought: determineResponseApproach(lowercasePrompt, topics)
  });

  return steps;
};

function extractKeyTopics(prompt: string): string[] {
  const topics = [];

  // Check for technical topics
  if (prompt.includes('code') || prompt.includes('programming') ||
      prompt.includes('javascript') || prompt.includes('react') ||
      prompt.includes('typescript')) {
    topics.push('programming');
  }

  if (prompt.includes('ai') || prompt.includes('machine learning') ||
      prompt.includes('artificial intelligence') || prompt.includes('model')) {
    topics.push('artificial intelligence');
  }

  if (prompt.includes('who are you') || prompt.includes('your name') ||
      prompt.includes('about you')) {
    topics.push('identity');
  }

  // Check for image generation
  if (prompt.includes('image') || prompt.includes('picture') ||
      prompt.includes('draw') || prompt.includes('generate') ||
      prompt.includes('create') && (prompt.includes('image') || prompt.includes('picture'))) {
    topics.push('image generation');
  }

  // no specific topics found
  if (topics.length === 0) {
    topics.push('general query');
  }

  return topics;
}

function identifyDomains(prompt: string, topics: string[]): string {
  if (topics.includes('programming')) {
    if (prompt.includes('react')) return 'React development';
    if (prompt.includes('typescript')) return 'TypeScript development';
    if (prompt.includes('javascript')) return 'JavaScript development';
    return 'Software development';
  }

  if (topics.includes('artificial intelligence')) {
    if (prompt.includes('gpt') || prompt.includes('language model')) return 'Large Language Models';
    if (prompt.includes('image') || prompt.includes('generate')) return 'Generative AI';
    return 'Artificial Intelligence';
  }

  if (topics.includes('identity')) {
    return 'Assistant identity and capabilities';
  }

  if (topics.includes('image generation')) {
    return 'Image generation and visual content';
  }

  return 'General knowledge';
}

function determineResponseApproach(prompt: string, topics: string[]): string {
  if (topics.includes('programming')) {
    return "This query is related to programming. I'll provide a structured, technical response with practical examples or explanations.";
  }

  if (topics.includes('artificial intelligence')) {
    return "This query is about AI technology. I'll provide an informative explanation balancing technical accuracy with accessibility.";
  }

  if (topics.includes('identity')) {
    return "This is a question about who I am. I'll provide a clear explanation of my identity as AninoDevAI.";
  }

  if (topics.includes('image generation')) {
    return "This request involves generating visual content. I'll check if it's a direct image generation request or a question about image capabilities.";
  }

  if (prompt.includes('?') || prompt.startsWith('how') || prompt.startsWith('what') ||
      prompt.startsWith('why') || prompt.startsWith('when') || prompt.startsWith('where')) {
    return "This appears to be an informational question. I'll provide a helpful, factual response with relevant context.";
  }

  return "This is a general input. I'll provide a helpful, conversational response that addresses the user's needs.";
}
