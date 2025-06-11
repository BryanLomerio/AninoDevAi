import { useState, useRef, useEffect } from "react"
import QuizCreation from "../components/QuizCreation"
import QuizTaking from "../components/QuizTaking"
import { speakEnhanced } from "../lib/speech-utils"
import { Card } from "@/components/ui/card"

interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
  explanation?: string
  difficulty?: "easy" | "medium" | "hard"
  topic?: string
}

type QuizMode = "create" | "take"

const QuizGenerator = () => {
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizType, setQuizType] = useState("multiple-choice")
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([])
  const [inputMethod, setInputMethod] = useState("text")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const [numQuestions, setNumQuestions] = useState(5)
  const [isMuted, setIsMuted] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState("medium")

  // Quiz state
  const [quizMode, setQuizMode] = useState<QuizMode>("create")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window)
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (quizMode === "take" && generatedQuiz.length > 0 && !isMuted && speechSupported) {
      const currentQuestion = generatedQuiz[currentQuestionIndex]
      if (currentQuestion) {
        let textToSpeak = currentQuestion.question

        if (currentQuestion.options) {
          textToSpeak += ". Options: " + currentQuestion.options.join(". ")
        }

        speakEnhanced(textToSpeak, speechRate)
      }
    }
  }, [currentQuestionIndex, quizMode, generatedQuiz, isMuted, speechSupported, speechRate])

  useEffect(() => {
    if (showExplanation && !isMuted && speechSupported && generatedQuiz.length > 0) {
      const currentQuestion = generatedQuiz[currentQuestionIndex]
      if (currentQuestion && currentQuestion.explanation) {
        const textToSpeak = `Explanation: ${currentQuestion.explanation}`
        speakEnhanced(textToSpeak, speechRate)
      }
    }
  }, [showExplanation, isMuted, speechSupported, currentQuestionIndex, generatedQuiz, speechRate])

  const toggleMute = () => {
    if (!isMuted) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } else if (quizMode === "take" && generatedQuiz.length > 0) {
      const currentQuestion = generatedQuiz[currentQuestionIndex]
      if (currentQuestion) {
        let textToSpeak = currentQuestion.question

        if (currentQuestion.options) {
          textToSpeak += ". Options: " + currentQuestion.options.join(". ")
        }

        speakEnhanced(textToSpeak, speechRate)
      }
    }
    setIsMuted(!isMuted)
  }

  const handleSpeechRateChange = (value: number[]) => {
    setSpeechRate(value[0])
  }

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        setIsListening(false)
      }
      return
    }

    const recognition = initSpeechRecognition(
      (text) => {
        setInputText((prev) => prev + " " + text)
      },
      (error) => {
        console.error("Speech recognition error:", error)
        setIsListening(false)
      },
    )

    if (recognition) {
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    setGenerationError(null)

    try {
      if (
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        file.name.endsWith(".md") ||
        file.name.endsWith(".txt")
      ) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          setInputText(text)
          setIsGenerating(false)
        }
        reader.onerror = () => {
          setGenerationError("Failed to read the file. Please try another file.")
          setIsGenerating(false)
        }
        reader.readAsText(file)
      } else {
        setGenerationError("Unsupported file type. Please upload a text file (.txt, .md).")
        setIsGenerating(false)
      }
    } catch (error) {
      console.error("File upload error:", error)
      setGenerationError("An error occurred while processing the file.")
      setIsGenerating(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleNumQuestionsChange = (value: number[]) => {
    setNumQuestions(value[0])
  }

  const handleNumQuestionsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setNumQuestions(value)
    }
  }

  const generateQuiz = async () => {
    if (!inputText.trim()) {
      setGenerationError("Please provide text content to generate a quiz.")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing")
      }

      const batchSize = Math.min(8, numQuestions)
      const batches = Math.ceil(numQuestions / batchSize)
      let allQuestions: QuizQuestion[] = []

      for (let batch = 0; batch < batches; batch++) {
        const questionsInBatch = Math.min(batchSize, numQuestions - batch * batchSize)

        const difficultyPrompt = {
          easy: "Generate questions that test basic understanding and recall of key concepts.",
          medium: "Generate questions that require comprehension and application of concepts.",
          hard: "Generate questions that require analysis, synthesis, and critical thinking."
        }[difficulty]

        const prompt = `Generate a ${quizType} quiz with exactly ${questionsInBatch} ${difficulty} difficulty questions based on the following content.

${difficultyPrompt}

Format the response as a JSON array of question objects.
${
  quizType === "multiple-choice"
    ? `Each object should have:
- question: the question text
- options: array of exactly 4 plausible choices (mix correct and incorrect options well)
- answer: the exact correct option from the choices
- explanation: detailed explanation of why the answer is correct
- difficulty: "${difficulty}"
- topic: relevant topic/subject area`
    : quizType === "true-false"
    ? `Each object should have:
- question: a clear statement that can be definitively true or false
- answer: "True" or "False"
- explanation: detailed explanation of why the statement is true or false
- difficulty: "${difficulty}"
- topic: relevant topic/subject area`
    : `Each object should have:
- question: the question text
- answer: a concise but complete answer
- explanation: detailed explanation expanding on the answer
- difficulty: "${difficulty}"
- topic: relevant topic/subject area`
}

Content: ${inputText}

${batch > 0 ? `This is batch ${batch + 1} of ${batches}. Ensure questions are unique and don't repeat topics from previous batches.` : ""}

IMPORTANT:
- Return ONLY valid JSON without any additional text or formatting
- Ensure all questions are clear, unambiguous, and directly related to the content
- For multiple choice, make distractors plausible but clearly incorrect
- Provide comprehensive explanations that enhance learning`

        let retries = 0
        const maxRetries = 3
        let delay = 1000
        let success = false
        let responseData

        while (!success && retries < maxRetries) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 8192,
                  },
                }),
              },
            )

            if (response.status === 429) {
              retries++
              await new Promise((resolve) => setTimeout(resolve, delay))
              delay *= 2
              continue
            }

            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`)
            }

            responseData = await response.json()
            success = true
          } catch (error) {
            retries++
            if (retries >= maxRetries) {
              throw error
            }
            await new Promise((resolve) => setTimeout(resolve, delay))
            delay *= 2
          }
        }

        if (!success || !responseData) {
          throw new Error("Failed to generate quiz after multiple retries")
        }

        const generatedText = responseData.candidates[0].content.parts[0].text

        let quizData: QuizQuestion[] = []
        try {
          const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          quizData = JSON.parse(cleanedText)
        } catch (e) {
          const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/)
          if (jsonMatch) {
            quizData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error("Could not parse quiz data from response")
          }
        }

        // Validate and clean quiz data
        quizData = quizData.filter((q: any) => {
          if (!q.question || !q.answer) return false
          if (quizType === "multiple-choice" && (!q.options || !Array.isArray(q.options) || q.options.length !== 4)) return false
          return true
        }).map((q: any) => ({
          ...q,
          difficulty: q.difficulty || difficulty,
          topic: q.topic || "General"
        }))

        allQuestions = [...allQuestions, ...quizData]

        if (batches > 1 && batch < batches - 1) {
          const batchDelay = 2000
          await new Promise((resolve) => setTimeout(resolve, batchDelay))
        }
      }

      allQuestions = allQuestions.slice(0, numQuestions)

      if (allQuestions.length === 0) {
        throw new Error("No valid questions were generated. Please try with different content or settings.")
      }

      setGeneratedQuiz(allQuestions)
      setCurrentQuestionIndex(0)
      setUserAnswers([])
      setScore(0)
      setQuizMode("take")
      setIsAnswerSubmitted(false)
      setSelectedOption("")

    } catch (error) {
      console.error("Error generating quiz:", error)
      if (error.message.includes("429")) {
        setGenerationError(
          "Rate limit exceeded. Please wait a moment before trying again or reduce the number of questions.",
        )
      } else {
        setGenerationError(error instanceof Error ? error.message : "Failed to generate quiz")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const clearInput = () => {
    setInputText("")
    setGeneratedQuiz([])
    setQuizMode("create")
    setGenerationError(null)
  }

  const handleAnswerSubmit = () => {
    if (!selectedOption && quizType === "multiple-choice") {
      setGenerationError("Please select an answer before submitting.")
      return
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const currentQuestion = generatedQuiz[currentQuestionIndex]
    const isCorrect = selectedOption.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()

    const newUserAnswers = [...userAnswers]
    newUserAnswers[currentQuestionIndex] = selectedOption
    setUserAnswers(newUserAnswers)

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1)
    }

    setIsAnswerSubmitted(true)
    setShowExplanation(true)

    if (!isMuted && speechSupported) {
      const resultText = isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${currentQuestion.answer}`
      speakEnhanced(resultText, speechRate)
    }
  }

  const handleNextQuestion = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    if (currentQuestionIndex < generatedQuiz.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setSelectedOption("")
      setIsAnswerSubmitted(false)
      setShowExplanation(false)
    } else {
      if (!isMuted && speechSupported) {
        const scoreText = `Quiz completed! Your final score is ${score} out of ${generatedQuiz.length}.`
        speakEnhanced(scoreText, speechRate)
      }
    }
  }

  const restartQuiz = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setScore(0)
    setSelectedOption("")
    setIsAnswerSubmitted(false)
    setShowExplanation(false)
  }

  const backToCreation = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setScore(0)
    setSelectedOption("")
    setIsAnswerSubmitted(false)
    setShowExplanation(false)
    setQuizMode("create")
    setGeneratedQuiz([])
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
{/*         <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 hover:bg-slate-700">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div> */}

        {/* Main Content */}
        <Card className="p-8 bg-[#191919] backdrop-blur-xl  border-none w-full">
          {quizMode === "create" ? (
            <QuizCreation
              inputText={inputText}
              setInputText={setInputText}
              isListening={isListening}
              isGenerating={isGenerating}
              quizType={quizType}
              setQuizType={setQuizType}
              inputMethod={inputMethod}
              setInputMethod={setInputMethod}
              fileInputRef={fileInputRef}
              numQuestions={numQuestions}
              generationError={generationError}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              handleVoiceInput={handleVoiceInput}
              handleFileUpload={handleFileUpload}
              triggerFileUpload={triggerFileUpload}
              handleNumQuestionsChange={handleNumQuestionsChange}
              handleNumQuestionsInput={handleNumQuestionsInput}
              generateQuiz={generateQuiz}
              clearInput={clearInput}
            />
          ) : (
            <QuizTaking
              generatedQuiz={generatedQuiz}
              currentQuestionIndex={currentQuestionIndex}
              userAnswers={userAnswers}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              isAnswerSubmitted={isAnswerSubmitted}
              score={score}
              showExplanation={showExplanation}
              quizType={quizType}
              isMuted={isMuted}
              speechSupported={speechSupported}
              speechRate={speechRate}
              toggleMute={toggleMute}
              handleSpeechRateChange={handleSpeechRateChange}
              handleAnswerSubmit={handleAnswerSubmit}
              handleNextQuestion={handleNextQuestion}
              restartQuiz={restartQuiz}
              backToCreation={backToCreation}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

const initSpeechRecognition = (onResult: (text: string) => void, onError: (error: any) => void) => {
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    return null
  }

  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  const recognition = new SpeechRecognitionAPI()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = "en-US"

  recognition.onresult = (event: any) => {
    let interimTranscript = ""
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        onResult(transcript)
      } else {
        interimTranscript += transcript
      }
    }
    if (interimTranscript) {
      onResult(interimTranscript)
    }
  }

  recognition.onerror = onError

  return recognition
}

export default QuizGenerator
