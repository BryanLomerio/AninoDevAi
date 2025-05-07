import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, Mic, CheckCircle, X, Brain, Settings } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface QuizCreationProps {
  inputText: string
  setInputText: (text: string) => void
  isListening: boolean
  isGenerating: boolean
  quizType: string
  setQuizType: (type: string) => void
  inputMethod: string
  setInputMethod: (method: string) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  numQuestions: number
  generationError: string | null
  handleVoiceInput: () => void
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  triggerFileUpload: () => void
  handleNumQuestionsChange: (value: number[]) => void
  handleNumQuestionsInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  generateQuiz: () => void
  clearInput: () => void
}

const QuizCreation = ({
  inputText,
  setInputText,
  isListening,
  isGenerating,
  quizType,
  setQuizType,
  inputMethod,
  setInputMethod,
  fileInputRef,
  numQuestions,
  generationError,
  handleVoiceInput,
  handleFileUpload,
  triggerFileUpload,
  handleNumQuestionsChange,
  handleNumQuestionsInput,
  generateQuiz,
  clearInput,
}: QuizCreationProps) => {
  return (
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
            <span>Text Input</span>
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="flex-1 py-2 text-center z-10 data-[state=inactive]:text-gray-400 data-[state=active]:text-white data-[state=active]:bg-green-800 flex items-center justify-center"
          >
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
}

export default QuizCreation
