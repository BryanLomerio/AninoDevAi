import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowRight,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  Volume2,
  VolumeX,
  Brain,
  X,
  Trophy,
  Target,
  Clock,
  BookOpen,
  Calendar,
  TrendingUp
} from "lucide-react";

interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
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

interface QuizStats {
  date: string;
  score: number;
  total: number;
  percentage: number;
  quizType: string;
  difficulty?: string;
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
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStats[]>([]);

  useEffect(() => {
    // Load quiz statistics from localStorage
    const savedStats = localStorage.getItem('quizStats');
    if (savedStats) {
      setQuizStats(JSON.parse(savedStats));
    }
  }, []);

  const saveQuizResult = () => {
    const today = new Date().toDateString();
    const percentage = Math.round((score / generatedQuiz.length) * 100);

    const newResult: QuizStats = {
      date: today,
      score,
      total: generatedQuiz.length,
      percentage,
      quizType,
      difficulty: generatedQuiz[0]?.difficulty || "medium"
    };

    const updatedStats = [...quizStats, newResult];
    setQuizStats(updatedStats);
    localStorage.setItem('quizStats', JSON.stringify(updatedStats));
  };

  if (generatedQuiz.length === 0) return null;

  const currentQuestion = generatedQuiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === generatedQuiz.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / generatedQuiz.length) * 100;
  const isQuizComplete = isLastQuestion && isAnswerSubmitted;

  // Show dialog when quiz is complete
  useEffect(() => {
    if (isQuizComplete && !showCompletionDialog) {
      saveQuizResult();
      setShowCompletionDialog(true);
    }
  }, [isQuizComplete]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "hard":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/50";
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const scorePercentage = Math.round((score / generatedQuiz.length) * 100);

  const handleDialogNext = () => {
    setShowCompletionDialog(false);
    if (currentQuestionIndex < generatedQuiz.length - 1) {
      handleNextQuestion();
    }
  };

  const handleDialogRestart = () => {
    setShowCompletionDialog(false);
    restartQuiz();
  };

  const handleDialogNewQuiz = () => {
    setShowCompletionDialog(false);
    backToCreation();
  };

  const getRecentStats = () => {
    return quizStats.slice(-3).reverse();
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quiz in Progress</h2>
            <div className="flex items-center gap-1 mt-0.5">
              {currentQuestion.topic && (
                <Badge variant="outline" className="border-[#272727] text-slate-300 text-xs bg-[#1e1e1e] px-2 py-0">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {currentQuestion.topic}
                </Badge>
              )}
              {currentQuestion.difficulty && (
                <Badge className={`text-xs px-2 py-0 ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  <Target className="h-3 w-3 mr-1" />
                  {currentQuestion.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speech Controls */}
          {speechSupported && (
            <div className="flex items-center gap-1 bg-[#272727] rounded-lg px-2 py-1 border border-[#1e1e1e]">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className={`h-7 w-7 p-0 ${
                  isMuted
                    ? "text-slate-400 hover:text-white"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>

              {!isMuted && (
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-xs text-slate-400">Speed:</span>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[speechRate]}
                    onValueChange={handleSpeechRateChange}
                    className="w-16"
                  />
                  <span className="text-xs text-slate-300 font-mono w-7">
                    {speechRate.toFixed(1)}x
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-1 bg-[#272727] rounded-lg px-3 py-1 border border-[#1e1e1e]">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-emerald-400 font-bold text-sm">{currentQuestionIndex + 1}</span>
            <span className="text-slate-500 text-sm">/</span>
            <span className="text-slate-300 text-sm">{generatedQuiz.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-300">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2 bg-[#272727]"
        />
      </div>

      {/* Question Card */}
      <Card className="p-4 bg-[#272727] border-[#1e1e1e] backdrop-blur-sm">
        <div className="space-y-4">
          {/* Question */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Answer Options */}
          {currentQuestion.options ? (
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-2"
              disabled={isAnswerSubmitted}
            >
              {currentQuestion.options.map((option, index) => {
                const isSelected = option === selectedOption;
                const isCorrect = option === currentQuestion.answer;
                const isIncorrect = isAnswerSubmitted && isSelected && !isCorrect;

                let optionStyle = "bg-[#1e1e1e] border-[#272727] hover:bg-[#272727] hover:border-slate-500";

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = "bg-green-500/20 border-green-500/50 shadow-green-500/20 shadow-lg";
                  } else if (isIncorrect) {
                    optionStyle = "bg-red-500/20 border-red-500/50 shadow-red-500/20 shadow-lg";
                  } else {
                    optionStyle = "bg-[#1e1e1e] border-[#272727]";
                  }
                } else if (isSelected) {
                  optionStyle = "bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/20 shadow-lg";
                }

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${optionStyle}`}
                    onClick={() => !isAnswerSubmitted && setSelectedOption(option)}
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      className="border-slate-400 text-white data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer flex justify-between items-center text-white"
                    >
                      <span className="text-sm">{option}</span>
                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      {isAnswerSubmitted && isIncorrect && (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[80px] bg-[#1e1e1e] border-[#272727] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder:text-slate-400"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isAnswerSubmitted}
              />
              {isAnswerSubmitted && (
                <Card className="p-3 bg-emerald-500/10 border-emerald-500/30">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="font-medium text-emerald-300 text-sm">Correct answer:</span>
                      <p className="text-white text-sm mt-1">{currentQuestion.answer}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && (
            <Collapsible defaultOpen={true} className="mt-4">
              <CollapsibleTrigger className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm">
                <span>Explanation</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Card className="p-3 bg-[#1e1e1e] border-[#272727]">
                  <p className="text-slate-200 leading-relaxed text-sm">{currentQuestion.explanation}</p>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-[#1e1e1e]">
            {!isAnswerSubmitted ? (
              <Button
                onClick={handleAnswerSubmit}
                disabled={!selectedOption.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 px-6 font-semibold"
              >
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
                {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-[#1e1e1e] hover:bg-[#272727] border-[#272727] text-slate-300 hover:text-white"
                onClick={restartQuiz}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Restart
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#1e1e1e] hover:bg-[#272727] border-[#272727] text-slate-300 hover:text-white"
                onClick={backToCreation}
              >
                New Quiz
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="bg-[#1e1e1e] border-[#272727] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Quiz Completed!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 p-2">
            {/* Score Circle */}
            <div className="text-center">
              <div className="relative mx-auto w-24 h-24">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <div className="bg-[#1e1e1e] w-20 h-20 rounded-full flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(scorePercentage)}`}>
                      {scorePercentage}%
                    </span>
                  </div>
                </div>
                <Trophy className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400" />
              </div>

              <div className="mt-3">
                <p className="text-slate-300 text-sm">
                  You scored <span className="font-bold text-emerald-400">{score}</span> out of{" "}
                  <span className="font-bold text-white">{generatedQuiz.length}</span> questions correctly
                </p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#272727] p-3 rounded-lg border border-[#1e1e1e]">
                <div className="text-xl font-bold text-emerald-400">{score}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </div>
              <div className="bg-[#272727] p-3 rounded-lg border border-[#1e1e1e]">
                <div className="text-xl font-bold text-red-400">{generatedQuiz.length - score}</div>
                <div className="text-xs text-slate-400">Incorrect</div>
              </div>
              <div className="bg-[#272727] p-3 rounded-lg border border-[#1e1e1e]">
                <div className={`text-xl font-bold ${getScoreColor(scorePercentage)}`}>
                  {scorePercentage}%
                </div>
                <div className="text-xs text-slate-400">Score</div>
              </div>
            </div>

            {/* Recent Quiz History */}
            {quizStats.length > 0 && (
              <div className="bg-[#272727] p-3 rounded-lg border border-[#1e1e1e]">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Recent Results
                </h3>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {getRecentStats().map((stat, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-[#1e1e1e] p-1.5 rounded">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-300">{stat.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${getScoreColor(stat.percentage)}`}>
                          {stat.score}/{stat.total}
                        </span>
                        <span className="text-slate-500">({stat.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                onClick={handleDialogRestart}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="bg-[#272727] hover:bg-[#1e1e1e] border-[#1e1e1e] text-slate-300 hover:text-white px-6 py-2"
                onClick={handleDialogNewQuiz}
              >
                Create New Quiz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizTaking;
