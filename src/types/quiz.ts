export interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

export type QuizMode = "create" | "take"
