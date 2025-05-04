import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Upload,
  Mic,
  FileText,
  CheckCircle,
  X,
  ArrowRight,
  RefreshCw,
  CheckIcon,
  XIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from "lucide-react"
import { initSpeechRecognition } from "@/utils/speechRecognition"
import { speak, stopSpeaking, isSpeechSynthesisSupported } from "@/utils/textToSpeech"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

type QuizMode = "create" | "take"

const QuizGenerator = () => {
  const { toast } = useToast()
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizType, setQuizType] = useState("multiple-choice")
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([])
  const [inputMethod, setInputMethod] = useState("text")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const [numQuestions, setNumQuestions] = useState(5)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Quiz taking states
  const [quizMode, setQuizMode] = useState<QuizMode>("create")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    setSpeechSupported(isSpeechSynthesisSupported())
  }, [])

  // Stop
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    if (quizMode === "take" && generatedQuiz.length > 0 && !isMuted && speechSupported) {
      const currentQuestion = generatedQuiz[currentQuestionIndex]
      let textToSpeak = currentQuestion.question

      // Add options to speech if it's multiple choice
      if (currentQuestion.options) {
        textToSpeak += ". Options: " + currentQuestion.options.join(". ")
      }

      currentUtteranceRef.current = speak(textToSpeak, speechRate)
    }
  }, [currentQuestionIndex, quizMode, generatedQuiz, isMuted, speechSupported, speechRate])

  // Speak explanation when shown
  useEffect(() => {
    if (showExplanation && !isMuted && speechSupported) {
      const currentQuestion = generatedQuiz[currentQuestionIndex]
      if (currentQuestion.explanation) {
        const textToSpeak = `Explanation: ${currentQuestion.explanation}`
        currentUtteranceRef.current = speak(textToSpeak, speechRate)
      }
    }
  }, [showExplanation, isMuted, speechSupported, currentQuestionIndex, generatedQuiz, speechRate])

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking()
    } else if (quizMode === "take" && generatedQuiz.length > 0) {
      // Resume
      const currentQuestion = generatedQuiz[currentQuestionIndex]
      let textToSpeak = currentQuestion.question

      if (currentQuestion.options) {
        textToSpeak += ". Options: " + currentQuestion.options.join(". ")
      }

      currentUtteranceRef.current = speak(textToSpeak, speechRate)
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
        toast({
          title: "Voice Recognition Error",
          description: "There was an error with voice recognition. Please try again.",
          variant: "destructive",
        })
        setIsListening(false)
      },
    )

    if (recognition) {
      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
      toast({
        title: "Voice Recognition Active",
        description: "Start speaking. Click the mic button again to stop.",
      })
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setInputText(text)
      toast({
        title: "File Uploaded",
        description: `Successfully loaded content from ${file.name}`,
      })
    }
    reader.onerror = () => {
      toast({
        title: "Error Reading File",
        description: "There was an error reading the file.",
        variant: "destructive",
      })
    }
    reader.readAsText(file)
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
      toast({
        title: "Input Required",
        description: "Please provide text content to generate a quiz.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is missing")
      }

      const prompt = `Generate a ${quizType} quiz with exactly ${numQuestions} questions based on the following content.
      Format the response as a JSON array of question objects.
      ${
        quizType === "multiple-choice"
          ? "Each object should have: question, options (array of 4 choices), answer (correct option), and explanation."
          : "Each object should have: question, answer, and explanation."
      }
      Content: ${inputText}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      const generatedText = data.candidates[0].content.parts[0].text
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const quizData = JSON.parse(jsonMatch[0])
        setGeneratedQuiz(quizData)
        // Reset quiz
        setCurrentQuestionIndex(0)
        setUserAnswers([])
        setScore(0)
        setQuizMode("take")
        setIsAnswerSubmitted(false)
        setSelectedOption("")

        toast({
          title: "Quiz Generated",
          description: `Successfully generated ${quizData.length} questions. Let's start!`,
        })
      } else {
        throw new Error("Could not parse quiz data from response")
      }
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const clearInput = () => {
    setInputText("")
    setGeneratedQuiz([])
    setQuizMode("create")
  }

  const handleAnswerSubmit = () => {
    if (!selectedOption && quizType === "multiple-choice") {
      toast({
        title: "Selection Required",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      })
      return
    }

    // Stop any ongoing speech
    stopSpeaking()

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

    // Speak the result if not muted
    if (!isMuted && speechSupported) {
      const resultText = isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${currentQuestion.answer}`

      currentUtteranceRef.current = speak(resultText, speechRate)
    }
  }

  const handleNextQuestion = () => {
    // Stop any ongoing speech
    stopSpeaking()

    if (currentQuestionIndex < generatedQuiz.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      setSelectedOption("")
      setIsAnswerSubmitted(false)
      setShowExplanation(false)
    } else {
      // Quiz completed
      toast({
        title: "Quiz Completed!",
        description: `Your final score: ${score}/${generatedQuiz.length}`,
      })

      // final score
      if (!isMuted && speechSupported) {
        const scoreText = `Quiz completed! Your final score is ${score} out of ${generatedQuiz.length}.`
        currentUtteranceRef.current = speak(scoreText, speechRate)
      }
    }
  }

  const restartQuiz = () => {
    stopSpeaking()

    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setScore(0)
    setSelectedOption("")
    setIsAnswerSubmitted(false)
    setShowExplanation(false)
  }

  const backToCreation = () => {
    // Stop any ongoing speech
    stopSpeaking()

    setQuizMode("create")
    setGeneratedQuiz([])
  }

  // Render the quiz creation interface
  const renderQuizCreation = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
        <h2 className="text-xl font-semibold">Quiz Generator</h2>
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
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="w-full sm:w-auto">
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700 h-8 w-full sm:w-auto"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Options</span>
                {showAdvanced ? (
                  <ChevronUp className="h-3.5 w-3.5 ml-1" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 ml-1" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-2 bg-[#1E1E1E] border border-gray-800 rounded-md">
              <div className="space-y-2">
                <div>
                  <Label htmlFor="quiz-type" className="text-xs">
                    Quiz Type
                  </Label>
                  <RadioGroup
                    id="quiz-type"
                    value={quizType}
                    onValueChange={setQuizType}
                    className="flex flex-wrap space-x-4 mt-1"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem
                        value="multiple-choice"
                        id="multiple-choice"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="multiple-choice" className="text-xs">
                        Multiple Choice
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem
                        value="short-answer"
                        id="short-answer"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="short-answer" className="text-xs">
                        Short Answer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem
                        value="true-false"
                        id="true-false"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="true-false" className="text-xs">
                        True/False
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Number of Questions: {numQuestions}</Label>
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
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
        <TabsList className="grid grid-cols-2 mb-2 bg-[#272727] rounded-lg overflow-hidden">
          <TabsTrigger value="text" className="data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white ">
            <FileText className="h-4 w-4 mr-2" />
            <span>Text Input</span>
          </TabsTrigger>
          <TabsTrigger value="file" className="data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white">
            <Upload className="h-4 w-4 mr-2" />
            <span>File Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-0">
          <Card className="p-3 bg-[#1E1E1E] border-gray-800">
            <div className="space-y-3">
              <Textarea
                placeholder="Enter or paste your text content here..."
                className="min-h-[150px] bg-[#252525] border-gray-700"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${isListening ? "bg-red-900 hover:bg-red-800" : "bg-[#2A2A2A] hover:bg-[#333333]"} border-gray-700`}
                  onClick={handleVoiceInput}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isListening ? "Stop Listening" : "Voice Input"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700"
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
          <Card className="p-4 bg-[#1E1E1E] border-gray-800 flex flex-col items-center justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.doc,.docx,.pdf"
              className="hidden"
            />
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-[#252525] text-white rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Upload a Text File</h3>
                <p className="text-xs text-gray-400 mt-1">Supports TXT, MD, DOC, DOCX, PDF</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700"
                onClick={triggerFileUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            {inputText && (
              <div className="mt-3 w-full">
                <div className="flex items-center justify-between bg-[#252525] p-2 rounded-md">
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

      <Button
        className="w-full bg-green-800 hover:bg-green-900"
        onClick={generateQuiz}
        disabled={isGenerating || !inputText.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating {numQuestions} Question{numQuestions !== 1 ? "s" : ""}...
          </>
        ) : (
          `Generate ${numQuestions} Question${numQuestions !== 1 ? "s" : ""}`
        )}
      </Button>
    </div>
  )

  // render quiz
  const renderQuizTaking = () => {
    if (generatedQuiz.length === 0) return null

    const currentQuestion = generatedQuiz[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === generatedQuiz.length - 1
    const progressPercentage = ((currentQuestionIndex + 1) / generatedQuiz.length) * 100

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Quiz</h2>
          <div className="flex items-center gap-3">
            {speechSupported && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMute}
                  className="bg-[#2A2A2A] hover:bg-[#333333] border-gray-700 h-8 w-8 p-0"
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
            <div className="text-sm text-gray-400">
              {currentQuestionIndex + 1} of {generatedQuiz.length}
            </div>
          </div>
        </div>

        <Progress value={progressPercentage} className="h-2" />

        <Card className="p-4 bg-[#1E1E1E] border-gray-800">
          <div className="space-y-4">
            <h3 className="text-base font-medium">{currentQuestion.question}</h3>

            {currentQuestion.options ? (
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-2"
                disabled={isAnswerSubmitted}
              >
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded-md border ${
                      isAnswerSubmitted
                        ? option === currentQuestion.answer
                          ? "bg-green-900/20 border-green-800"
                          : option === selectedOption
                            ? "bg-red-900/20 border-red-800"
                            : "bg-[#2A2A2A] border-gray-700"
                        : "bg-[#2A2A2A] border-gray-700 hover:bg-[#333333] cursor-pointer"
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
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      )}
                      {isAnswerSubmitted && option === selectedOption && option !== currentQuestion.answer && (
                        <XIcon className="h-4 w-4 text-red-500" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[80px] bg-[#252525] border-gray-700"
                  value={selectedOption}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={isAnswerSubmitted}
                />
                {isAnswerSubmitted && (
                  <div className="p-2 rounded-md bg-green-900/20 border border-green-800">
                    <span className="font-medium">Correct answer: </span>
                    {currentQuestion.answer}
                  </div>
                )}
              </div>
            )}

            {showExplanation && currentQuestion.explanation && (
              <Collapsible defaultOpen={true} className="mt-2">
                <CollapsibleTrigger className="flex items-center text-sm text-gray-400 hover:text-gray-300">
                  <span className="font-medium">Explanation</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 p-3 bg-[#252525] rounded-md border border-gray-700">
                  <p className="text-sm text-gray-300">{currentQuestion.explanation}</p>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
              {!isAnswerSubmitted ? (
                <Button onClick={handleAnswerSubmit} className="bg-green-800 hover:bg-green-900 w-full sm:w-auto">
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-800 hover:bg-blue-900 w-full sm:w-auto"
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
                  <RefreshCw className="h-4 w-4 mr-1" />
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
          <Card className="p-4 bg-[#1E1E1E] border-gray-800">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium">Quiz Completed!</h3>
              <div className="text-3xl font-bold text-green-500">
                {score}/{generatedQuiz.length}
              </div>
              <p className="text-sm text-gray-400">
                You answered {score} out of {generatedQuiz.length} questions correctly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
                <Button onClick={restartQuiz} size="sm" className="bg-green-800 hover:bg-green-900">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
