export function enhanceGeminiResponse(response: string, queryType: string): string {

  if (response.length < 100) return response;

  const hasHeadings = response.includes('##') || response.includes('#');
  const hasBulletPoints = response.includes('- ') || response.includes('* ');
  const hasCodeBlocks = response.includes('```');

  if (hasHeadings && (hasBulletPoints || hasCodeBlocks)) {
    return addCriticalThinkingElement(response, queryType);
  }

  let enhancedResponse = response;

  if (queryType === 'technical' || queryType === 'problem-solving') {
    enhancedResponse = addTechnicalStructure(response);
  } else if (queryType === 'conceptual') {
    enhancedResponse = addConceptualStructure(response);
  } else {
    enhancedResponse = addGeneralStructure(response);
  }

  return addCriticalThinkingElement(enhancedResponse, queryType);
}

function addCriticalThinkingElement(response: string, queryType: string): string {

  const criticalElements: Record<string, string[]> = {
    technical: [
      "\n\n### Key Considerations\nWhen implementing this solution, consider performance implications, edge cases, and maintainability.",
      "\n\n### Alternative Approaches\nAn alternative approach would be to [alternative solution], which offers [benefits] but has [drawbacks].",
      "\n\n### Best Practices\nFollow these best practices to ensure your implementation is robust and maintainable: [list of practices]."
    ],
    conceptual: [
      "\n\n### Different Perspectives\nIt's worth noting that there are different perspectives on this topic, including [alternative viewpoint].",
      "\n\n### Practical Applications\nThese concepts apply to real-world scenarios such as [examples of applications].",
      "\n\n### Limitations and Nuances\nWhile the explanation above covers the core concepts, there are some nuances to consider: [nuances]."
    ],
    'problem-solving': [
      "\n\n### Testing Your Solution\nTo verify your solution works correctly, test it with these edge cases: [edge cases].",
      "\n\n### Potential Challenges\nYou might encounter these challenges during implementation: [challenges] and here's how to address them.",
      "\n\n### Optimization Opportunities\nOnce you have a working solution, consider these optimizations: [optimizations]."
    ],
    general: [
      "\n\n### Additional Context\nFor a more complete understanding, also consider: [additional context].",
      "\n\n### Practical Takeaways\nThe key points to remember are: [key points].",
      "\n\n### Further Exploration\nIf you're interested in learning more, consider exploring: [related topics]."
    ]
  };

  const elements = criticalElements[queryType] || criticalElements.general;
  const randomElement = elements[Math.floor(Math.random() * elements.length)];

  if (!response.includes("Considerations") && !response.includes("Alternative") &&
      !response.includes("Perspectives") && !response.includes("Limitations")) {

    const sentences = response.split(/[.!?]+/);
    let relevantPhrase = "";
    if (sentences.length > 2) {
      const randomSentence = sentences[Math.floor(Math.random() * (sentences.length - 1)) + 1];
      const words = randomSentence.trim().split(/\s+/);
      if (words.length > 3) {
        relevantPhrase = words.slice(0, 3).join(" ");
      }
    }

    let element = randomElement;
    if (relevantPhrase) {
      element = element.replace("[alternative solution]", `using ${relevantPhrase}`)
                       .replace("[benefits]", "different trade-offs")
                       .replace("[drawbacks]", "its own challenges")
                       .replace("[list of practices]", "code organization, error handling, and documentation")
                       .replace("[alternative viewpoint]", `the perspective that ${relevantPhrase}`)
                       .replace("[examples of applications]", "software development, system design, and problem-solving")
                       .replace("[nuances]", "edge cases and special considerations")
                       .replace("[edge cases]", "boundary conditions and unexpected inputs")
                       .replace("[challenges]", "integration issues and performance bottlenecks")
                       .replace("[optimizations]", "caching, algorithm improvements, and resource management")
                       .replace("[additional context]", "historical development and theoretical foundations")
                       .replace("[key points]", "practical applications and implementation considerations")
                       .replace("[related topics]", "advanced techniques and complementary technologies");
    }

    return response + element;
  }

  return response;
}

function addTechnicalStructure(response: string): string {
  const paragraphs = response.split('\n\n');

  if (paragraphs.length < 2) return response;

  let structured = `## Overview\n${paragraphs[0]}\n\n`;

  if (paragraphs.length >= 3) {
    structured += `## Key Concepts\n${paragraphs[1]}\n\n`;

    if (response.includes('```')) {
      structured += `## Implementation\n`;

      const codeMatches = response.match(/```[\s\S]+?```/g);
      if (codeMatches) {
        structured += `${codeMatches[0]}\n\n`;

        if (paragraphs.length >= 4) {
          structured += `## Explanation\n${paragraphs[2]}\n\n`;
        }
      } else {
        structured += `${paragraphs[2]}\n\n`;
      }
    } else {
      structured += `## Details\n${paragraphs[2]}\n\n`;
    }

    if (paragraphs.length >= 4) {
      structured += `## Additional Information\n`;
      for (let i = 3; i < paragraphs.length; i++) {
        structured += `${paragraphs[i]}\n\n`;
      }
    }
  } else {
    // For shorter responses
    structured += `## Details\n${paragraphs[1]}\n\n`;
  }

  return structured;
}

function addConceptualStructure(response: string): string {
  const paragraphs = response.split('\n\n');

  if (paragraphs.length < 2) return response;

  let structured = `## Definition\n${paragraphs[0]}\n\n`;

  if (paragraphs.length >= 3) {
    structured += `## Explanation\n${paragraphs[1]}\n\n`;
    structured += `## Examples\n${paragraphs[2]}\n\n`;

    if (paragraphs.length >= 4) {
      structured += `## Deeper Understanding\n`;
      for (let i = 3; i < paragraphs.length; i++) {
        structured += `${paragraphs[i]}\n\n`;
      }
    }
  } else {
    // For shorter responses
    structured += `## Examples\n${paragraphs[1]}\n\n`;
  }

  return structured;
}


function addGeneralStructure(response: string): string {
  const paragraphs = response.split('\n\n');

  if (paragraphs.length < 2) return response;

  let structured = `## Summary\n${paragraphs[0]}\n\n`;

  if (paragraphs.length >= 3) {
    structured += `## Key Points\n`;

    // Extract key points from second paragraph
    const sentences = paragraphs[1].split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) {
      structured += `- ${sentences[0].trim()}.\n`;
      structured += `- ${sentences[1].trim()}.\n`;
      structured += `- ${sentences[2].trim()}.\n\n`;
    } else {
      structured += `${paragraphs[1]}\n\n`;
    }

    structured += `## Details\n${paragraphs[2]}\n\n`;

    if (paragraphs.length >= 4) {
      structured += `## Additional Information\n`;
      for (let i = 3; i < paragraphs.length; i++) {
        structured += `${paragraphs[i]}\n\n`;
      }
    }
  } else {

    structured += `## Details\n${paragraphs[1]}\n\n`;
  }

  return structured;
}

export function determineQueryType(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('code') || lowerQuery.includes('program') ||
      lowerQuery.includes('implement') || lowerQuery.includes('develop') ||
      lowerQuery.includes('build') || lowerQuery.includes('create') ||
      lowerQuery.includes('function') || lowerQuery.includes('class')) {
    return 'technical';
  }

  if (lowerQuery.includes('fix') || lowerQuery.includes('solve') ||
      lowerQuery.includes('debug') || lowerQuery.includes('error') ||
      lowerQuery.includes('issue') || lowerQuery.includes('problem') ||
      lowerQuery.includes('how can i') || lowerQuery.includes('how do i')) {
    return 'problem-solving';
  }

  if (lowerQuery.includes('what is') || lowerQuery.includes('explain') ||
      lowerQuery.includes('concept') || lowerQuery.includes('theory') ||
      lowerQuery.includes('define') || lowerQuery.includes('meaning') ||
      lowerQuery.includes('understand')) {
    return 'conceptual';
  }

  return 'general';
}
