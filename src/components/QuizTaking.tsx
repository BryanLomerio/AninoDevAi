import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, RefreshCw, CheckIcon, ChevronDown, Volume2, VolumeX, Brain, X } from "lucide-react";

interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface QuizTakingProps {
  generatedQuiz: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: string[];
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  isAnswerSubmitted: boolean;
  score: number;
  showExplanation: boolean;
  quizType: string;
  isMuted: boolean;
  speechSupported: boolean;
  speechRate: number;
  toggleMute: () => void;
  handleSpeechRateChange: (value: number[]) => void;
  handleAnswerSubmit: () => void;
  handleNextQuestion: () => void;
  restartQuiz: () => void;
  backToCreation: () => void;
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
  if (generatedQuiz.length === 0) return null;

  const currentQuestion = generatedQuiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === generatedQuiz.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / generatedQuiz.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-2.5 rounded-xl shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-green-500">
            Quiz
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {speechSupported && (
            <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className={`${
                  isMuted ? "bg-black/40" : "bg-green-900/30 border-green-800"
                } hover:bg-[#333333] border-gray-700/50 h-8 w-8 p-0 rounded-full`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              {!isMuted && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-gray-400">Speed:</span>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[speechRate]}
                    onValueChange={handleSpeechRateChange}
                    className="w-24"
                  />
                  <span className="text-xs font-mono bg-black/30 px-2 py-0.5 rounded">{speechRate.toFixed(1)}x</span>
                </div>
              )}
            </div>
          )}
          <div className="font-medium px-3 py-1 bg-black/30 rounded-full text-sm">
            <span className="text-green-500 font-bold">{currentQuestionIndex + 1}</span>
            <span className="mx-1 text-gray-500">/</span>
            <span className="text-gray-300">{generatedQuiz.length}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Progress
          value={progressPercentage}
          className="h-2.5 bg-gray-800/50 rounded-full overflow-hidden"
          indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-600"
        />
        <div
          className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] bg-[length:10px_10px] opacity-20"
        ></div>
      </div>

      <Card className="p-6 bg-black/30 border-gray-800/50 shadow-xl rounded-xl backdrop-blur-sm">
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-gray-100">{currentQuestion.question}</h3>

          {currentQuestion.options ? (
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-4"
              disabled={isAnswerSubmitted}
            >
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 option-hover ${
                    isAnswerSubmitted
                      ? option === currentQuestion.answer
                        ? "bg-green-900/20 border-green-800/70"
                        : option === selectedOption
                          ? "bg-red-900/20 border-red-800/70"
                          : "bg-black/40 border-gray-700/50"
                      : "bg-black/40 border-gray-700/50 hover:bg-black/60 cursor-pointer"
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
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[120px] bg-black/40 border-gray-700/50 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg text-gray-100"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isAnswerSubmitted}
              />
              {isAnswerSubmitted && (
                <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/70 shadow-lg">
                  <span className="font-medium text-green-500">Correct answer: </span>
                  {currentQuestion.answer}
                </div>
              )}
            </div>
          )}

          {showExplanation && currentQuestion.explanation && (
            <Collapsible defaultOpen={true} className="mt-4">
              <CollapsibleTrigger className="flex items-center text-sm text-green-400 hover:text-green-300 transition-colors">
                <span className="font-medium">Explanation</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 p-5 bg-black/40 rounded-lg border border-gray-700/50 shadow-inner">
                <p className="text-sm text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-3">
            {!isAnswerSubmitted ? (
              <Button
                onClick={handleAnswerSubmit}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all w-full sm:w-auto py-6 text-base font-medium rounded-lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all w-full sm:w-auto py-6 text-base font-medium rounded-lg"
                disabled={isLastQuestion && isAnswerSubmitted}
              >
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
                {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            )}

            <div className="flex gap-3 mt-2 sm:mt-0">
              <Button
                variant="outline"
                className="bg-black/40 hover:bg-black/60 border-gray-700/50 flex-1 sm:flex-none"
                onClick={restartQuiz}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              <Button
                variant="outline"
                className="bg-black/40 hover:bg-black/60 border-gray-700/50 flex-1 sm:flex-none"
                onClick={backToCreation}
              >
                New Quiz
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {isLastQuestion && isAnswerSubmitted && (
        <Card className="p-8 bg-black/30 border-gray-800/50 shadow-xl rounded-xl backdrop-blur-sm">
          <div className="text-center space-y-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 mx-auto flex items-center justify-center shadow-lg">
              <h3 className="text-3xl font-bold text-white">
                {Math.round((score / generatedQuiz.length) * 100)}%
              </h3>
            </div>

            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              Quiz Completed!
            </h3>

            <div className="text-5xl font-bold">
              <span className="text-green-500">{score}</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-300">{generatedQuiz.length}</span>
            </div>

            <p className="text-sm text-gray-400">
              You answered {score} out of {generatedQuiz.length} questions correctly.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-5">
              <Button
                onClick={restartQuiz}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all px-6 py-6"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="bg-black/40 hover:bg-black/60 border-gray-700/50 px-6 py-6"
                onClick={backToCreation}
              >
                Create New Quiz
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuizTaking;
