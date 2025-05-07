import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowRight, RefreshCw, CheckIcon, ChevronDown, Volume2, VolumeX, Brain, X } from "lucide-react"

interface QuizQuestion {
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

interface QuizTakingProps {
  generatedQuiz: QuizQuestion[]
  currentQuestionIndex: number
  userAnswers: string[]
  selectedOption: string
  setSelectedOption: (option: string) => void
  isAnswerSubmitted: boolean
  score: number
  showExplanation: boolean
  quizType: string
  isMuted: boolean
  speechSupported: boolean
  speechRate: number
  toggleMute: () => void
  handleSpeechRateChange: (value: number[]) => void
  handleAnswerSubmit: () => void
  handleNextQuestion: () => void
  restartQuiz: () => void
  backToCreation: () => void
}

const QuizTaking = ({
  generatedQuiz,
  currentQuestionIndex,
  userAnswers,
  selectedOption,
  setSelectedOption,
  isAnswerSubmitted,
  score,
  showExplanation,
  quizType,
  isMuted,
  speechSupported,
  speechRate,
  toggleMute,
  handleSpeechRateChange,
  handleAnswerSubmit,
  handleNextQuestion,
  restartQuiz,
  backToCreation,
}: QuizTakingProps) => {
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
            <div className="text-2xl font-bold text-amber-500">{Math.round((score / generatedQuiz.length) * 100)}%</div>
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

export default QuizTaking
