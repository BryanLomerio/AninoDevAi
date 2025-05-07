import { useState, useRef, useEffect } from "react"
import QuizCreation from "../components/QuizCreation"
import QuizTaking from "../components/QuizTaking"
import { speakEnhanced } from "../lib/speech-utils"

interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
  explanation?: string
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

  // Quiz
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
      // Resume
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
        console.log("Voice Recognition Error: There was an error with voice recognition. Please try again.")
        setIsListening(false)
      },
    )

    if (recognition) {
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
      console.log("Voice Recognition Active: Start speaking. Click the mic button again to stop.")
    } else {
      console.log("Voice Recognition Not Supported: Your browser doesn't support voice recognition.")
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    try {
      // For text files, use FileReader
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
          console.log(`File Uploaded: Successfully loaded content from ${file.name}`)
          setIsGenerating(false)
        }
        reader.onerror = () => {
          console.log("Error Reading File: There was an error reading the file.")
          setGenerationError("Failed to read the file. Please try another file.")
          setIsGenerating(false)
        }
        reader.readAsText(file)
      }
      // For PDF and DOC files, we need to extract text differently
      else if (
        file.type === "application/pdf" ||
        file.type.includes("word") ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".doc")
      ) {
        // For demonstration, we'll just show an error message
        setGenerationError("PDF and DOC file parsing is not implemented in this demo. Please use plain text files.")
        setIsGenerating(false)
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
      console.log("Input Required: Please provide text content to generate a quiz.")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing")
      }

      const batchSize = 10
      const batches = Math.ceil(numQuestions / batchSize)
      let allQuestions: QuizQuestion[] = []

      for (let batch = 0; batch < batches; batch++) {
        const questionsInBatch = Math.min(batchSize, numQuestions - batch * batchSize)

        const prompt = `Generate a ${quizType} quiz with exactly ${questionsInBatch} questions based on the following content.
        Format the response as a JSON array of question objects.
        ${
          quizType === "multiple-choice"
            ? "Each object should have: question, options (array of 4 choices), answer (correct option), and explanation."
            : "Each object should have: question, answer, and explanation."
        }
        Content: ${inputText}
        ${batch > 0 ? `This is batch ${batch + 1} of ${batches}, so make sure these questions are different from previous batches.` : ""}
        IMPORTANT: Return ONLY valid JSON without any additional text or formatting.`

        let retries = 0
        const maxRetries = 5
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
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                  },
                }),
              },
            )

            if (response.status === 429) {
              retries++
              console.log(`Rate limit hit. Retry ${retries}/${maxRetries} after ${delay}ms delay`)
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
            console.log(`Error occurred. Retry ${retries}/${maxRetries} after ${delay}ms delay`)
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
          quizData = JSON.parse(generatedText.trim())
        } catch (e) {
          const jsonMatch = generatedText.match(/\[\s*\{[\s\S]*\}\s*\]/)
          if (jsonMatch) {
            quizData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error("Could not parse quiz data from response")
          }
        }

        allQuestions = [...allQuestions, ...quizData]

        if (batches > 1 && batch < batches - 1) {
          const batchDelay = 2000 + batch * 1000
          console.log(`Waiting ${batchDelay / 1000} seconds before next batch to avoid rate limits...`)
          await new Promise((resolve) => setTimeout(resolve, batchDelay))
        }
      }

      allQuestions = allQuestions.slice(0, numQuestions)

      setGeneratedQuiz(allQuestions)
      // Reset quiz
      setCurrentQuestionIndex(0)
      setUserAnswers([])
      setScore(0)
      setQuizMode("take")
      setIsAnswerSubmitted(false)
      setSelectedOption("")

      console.log(`Quiz Generated: Successfully generated ${allQuestions.length} questions. Let's start!`)
    } catch (error) {
      console.error("Error generating quiz:", error)
      if (error.message.includes("429")) {
        setGenerationError(
          "Rate limit exceeded. Please wait a moment before trying again or reduce the number of questions.",
        )
      } else {
        setGenerationError(error instanceof Error ? error.message : "Failed to generate quiz")
      }
      console.log("Generation Failed: " + (error instanceof Error ? error.message : "Failed to generate quiz"))
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
      console.log("Selection Required: Please select an answer before submitting.")
      return
    }

    // Stop any ongoing speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const currentQuestion = generatedQuiz[currentQuestionIndex]
    const isCorrect = selectedOption === currentQuestion.answer

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
      // Quiz completed
      console.log(`Quiz Completed!: Your final score: ${score}/${generatedQuiz.length}`)

      //final score
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

  return quizMode === "create" ? (
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
  )
}

export default QuizGenerator

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
