import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Upload,
  Mic,
  CheckCircle,
  X,
  ArrowRight,
  RefreshCw,
  CheckIcon,
  Settings,
  ChevronDown,
  Volume2,
  VolumeX,
  Brain,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

type QuizMode = "create" | "take"

const chunkText = (text: string, maxLength = 4000): string[] => {
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

const speakEnhanced = (text: string, rate = 1, pitch = 1, volume = 1): void => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.error("Speech synthesis not supported in this browser")
    return
  }

  window.speechSynthesis.cancel()
  const chunks = chunkText(text)

  // Get available voices
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(
    (voice) => (voice.lang.includes("en") && voice.name.includes("Google")) || voice.name.includes("Female"),
  )

  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk)

    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    // Only for debugging
    if (index > 0) {
      console.log(`Speaking chunk ${index + 1} of ${chunks.length}`)
    }

    window.speechSynthesis.speak(utterance)
  })
}

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
        // In a real implementation, you would use a library like pdf.js for PDFs or a server-side solution for DOC files
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

      //final scre
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

  const renderQuizCreation = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-green-800 p-2 rounded-full">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold">SelfQuizzer</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="num-questions" className="whitespace-nowrap text-sm">
              Questions:
            </Label>
            <Input
              id="num-questions"
              type="number"
              min={1}
              value={numQuestions}
              onChange={handleNumQuestionsInput}
              className="w-16 h-8 text-center bg-[#252525] border-gray-700"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700 h-8 w-full sm:w-auto"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Options</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1E1E1E] border-gray-800 shadow-lg max-w-md text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Quiz Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="quiz-type" className="text-xs font-medium text-white">
                    Quiz Type
                  </Label>
                  <RadioGroup
                    id="quiz-type"
                    value={quizType}
                    onValueChange={setQuizType}
                    className="flex flex-wrap gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="multiple-choice"
                        id="multiple-choice"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="multiple-choice" className="text-sm text-white">
                        Multiple Choice
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="short-answer"
                        id="short-answer"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="short-answer" className="text-sm text-white">
                        Short Answer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="true-false"
                        id="true-false"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="true-false" className="text-sm text-white">
                        True/False
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block text-white">
                    Number of Questions: {numQuestions}
                  </Label>
                  {numQuestions <= 20 ? (
                    <Slider
                      defaultValue={[5]}
                      min={1}
                      max={20}
                      step={1}
                      value={[numQuestions]}
                      onValueChange={handleNumQuestionsChange}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-xs text-gray-400">Slider available for 1-20 questions</p>
                  )}
                  {numQuestions > 20 && (
                    <p className="text-xs text-amber-400 mt-2">
                      Note: Generating {numQuestions} questions may take longer and will be processed in batches.
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
        <TabsList className="relative inline-flex mx-auto mb-3 bg-[#272727] rounded-lg overflow-hidden">
          <TabsTrigger
            value="text"
            className="flex-1 py-2 text-center z-10 data-[state=inactive]:text-gray-400 data-[state=active]:bg-green-800  data-[state=active]:text-white flex items-center justify-center"
          >
            {/*  <FileText className="h-4 w-4 mr-2" /> */}
            <span>Text Input</span>
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="flex-1 py-2 text-center z-10 data-[state=inactive]:text-gray-400 data-[state=active]:text-white data-[state=active]:bg-green-800 flex items-center justify-center"
          >
            {/*    <Upload className="h-4 w-4 mr-2" /> */}
            <span>File Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-0">
          <Card className="p-4 bg-[#1E1E1E] border-gray-800 shadow-md">
            <div className="space-y-3">
              <Textarea
                placeholder="Enter or paste your text content here..."
                className="min-h-[180px] bg-[#252525] border-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    isListening
                      ? "bg-red-900 hover:bg-red-800"
                      : "bg-[#2A2A2A]  hover:text-green-600 hover:bg-[#333333]"
                  } border-gray-700 transition-colors`}
                  onClick={handleVoiceInput}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isListening ? "Stop Listening" : "Voice Input"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2A2A2A] hover:bg-[#333333] hover:text-red-600 border-gray-700"
                  onClick={clearInput}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="mt-0">
          <Card className="p-5 bg-[#1E1E1E] border-gray-800 flex flex-col items-center justify-center shadow-md">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md" className="hidden" />
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-[#252525] text-white rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-base">Upload a Text File</h3>
                <p className="text-xs text-gray-400 mt-1">Supports TXT, MD files</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700 px-4"
                onClick={triggerFileUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            {inputText && (
              <div className="mt-4 w-full">
                <div className="flex items-center justify-between bg-[#252525] p-3 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">File content loaded</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearInput} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {generationError && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-sm">
          <p>Error: {generationError}</p>
          <p className="mt-1 text-xs text-gray-300">
            Try reducing the number of questions or simplifying your content.
          </p>
        </div>
      )}

      <Button
        className="w-full bg-green-800 hover:bg-green-700 transition-colors py-6 text-base font-medium shadow-lg"
        onClick={generateQuiz}
        disabled={isGenerating || !inputText.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating {numQuestions} Question{numQuestions !== 1 ? "s" : ""}...
          </>
        ) : (
          `Generate ${numQuestions} Question${numQuestions !== 1 ? "s" : ""}`
        )}
      </Button>

      {numQuestions > 20 && (
        <p className="text-xs text-center text-amber-400">
          Note: Generating {numQuestions} questions will be processed in batches and may take longer.
        </p>
      )}
    </div>
  )

  const renderQuizTaking = () => {
    if (generatedQuiz.length === 0) return null

    const currentQuestion = generatedQuiz[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === generatedQuiz.length - 1
    const progressPercentage = ((currentQuestionIndex + 1) / generatedQuiz.length) * 100

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-green-800 p-1.5 rounded-full">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Quiz</h2>
          </div>
          <div className="flex items-center gap-3">
            {speechSupported && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMute}
                  className={`${
                    isMuted ? "bg-[#2A2A2A]" : "bg-green-900/30 border-green-800"
                  } hover:bg-[#333333] border-gray-700 h-8 w-8 p-0 rounded-full`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                {!isMuted && (
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-xs text-gray-400">Speed:</span>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[speechRate]}
                      onValueChange={handleSpeechRateChange}
                      className="w-20"
                    />
                    <span className="text-xs text-gray-400">{speechRate.toFixed(1)}x</span>
                  </div>
                )}
              </div>
            )}
            <div className="text-sm font-medium px-2 py-1 bg-[#252525] rounded-md">
              {currentQuestionIndex + 1} of {generatedQuiz.length}
            </div>
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2 bg-gray-800" />

        <Card className="p-5 bg-[#1E1E1E] border-gray-800 shadow-md">
          <div className="space-y-5">
            <h3 className="text-lg font-medium">{currentQuestion.question}</h3>

            {currentQuestion.options ? (
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-3"
                disabled={isAnswerSubmitted}
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-md border ${
                      isAnswerSubmitted
                        ? option === currentQuestion.answer
                          ? "bg-green-900/20 border-green-800"
                          : option === selectedOption
                            ? "bg-red-900/20 border-red-800"
                            : "bg-[#2A2A2A] border-gray-700"
                        : "bg-[#2A2A2A] border-gray-700 hover:bg-[#333333] cursor-pointer transition-colors"
                    }`}
                    onClick={() => !isAnswerSubmitted && setSelectedOption(option)}
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer flex justify-between items-center"
                    >
                      <span>{option}</span>
                      {isAnswerSubmitted && option === currentQuestion.answer && (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      )}
                      {isAnswerSubmitted && option === selectedOption && option !== currentQuestion.answer && (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[100px] bg-[#252525] border-gray-700 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={isAnswerSubmitted}
                />
                {isAnswerSubmitted && (
                  <div className="p-3 rounded-md bg-green-900/20 border border-green-800">
                    <span className="font-medium">Correct answer: </span>
                    {currentQuestion.answer}
                  </div>
                )}
              </div>
            )}

            {showExplanation && currentQuestion.explanation && (
              <Collapsible defaultOpen={true} className="mt-2">
                <CollapsibleTrigger className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                  <span className="font-medium">Explanation</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 p-4 bg-[#252525] rounded-md border border-gray-700">
                  <p className="text-sm text-gray-300">{currentQuestion.explanation}</p>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
              {!isAnswerSubmitted ? (
                <Button
                  onClick={handleAnswerSubmit}
                  className="bg-green-800 hover:bg-green-700 transition-colors w-full sm:w-auto py-5 text-base font-medium"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-800 hover:bg-blue-700 transition-colors w-full sm:w-auto py-5 text-base font-medium"
                  disabled={isLastQuestion && isAnswerSubmitted}
                >
                  {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              )}

              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700 flex-1 sm:flex-none"
                  onClick={restartQuiz}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700 flex-1 sm:flex-none"
                  onClick={backToCreation}
                >
                  New Quiz
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {isLastQuestion && isAnswerSubmitted && (
          <Card className="p-5 bg-[#1E1E1E] border-gray-800 shadow-md">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-medium">Quiz Completed!</h3>
              <div className="text-4xl font-bold text-green-500">
                {score}/{generatedQuiz.length}
              </div>
              <p className="text-sm text-gray-400">
                You answered {score} out of {generatedQuiz.length} questions correctly.
              </p>
              <div className="text-2xl font-bold text-amber-500">
                {Math.round((score / generatedQuiz.length) * 100)}%
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <Button onClick={restartQuiz} className="bg-green-800 hover:bg-green-700 transition-colors">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700"
                  onClick={backToCreation}
                >
                  Create New Quiz
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  return quizMode === "create" ? renderQuizCreation() : renderQuizTaking()
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
