
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Mic, CheckCircle, X, Brain, Settings } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuizCreationProps {
  inputText: string;
  setInputText: (text: string) => void;
  isListening: boolean;
  isGenerating: boolean;
  quizType: string;
  setQuizType: (type: string) => void;
  inputMethod: string;
  setInputMethod: (method: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  numQuestions: number;
  generationError: string | null;
  handleVoiceInput: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileUpload: () => void;
  handleNumQuestionsChange: (value: number[]) => void;
  handleNumQuestionsInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateQuiz: () => void;
  clearInput: () => void;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-2.5 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
            SelfQuizzer
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg">
            <Label htmlFor="num-questions" className="whitespace-nowrap text-sm text-gray-300">
              Questions:
            </Label>
            <Input
              id="num-questions"
              type="number"
              min={1}
              value={numQuestions}
              onChange={handleNumQuestionsInput}
              className="w-16 h-8 text-center bg-[#252525] border-gray-700 focus:border-green-500"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-black/30 hover:bg-[#333333] border-gray-700 h-9"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Options</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1E1E1E] border-gray-800 shadow-lg max-w-md text-white">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-500" />
                  Quiz Settings
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div>
                  <Label htmlFor="quiz-type" className="text-sm font-medium text-white mb-3 block">
                    Quiz Type
                  </Label>
                  <RadioGroup
                    id="quiz-type"
                    value={quizType}
                    onValueChange={setQuizType}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-lg hover:bg-black/40 transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="multiple-choice"
                        id="multiple-choice"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="multiple-choice" className="text-sm text-white cursor-pointer">
                        Multiple Choice
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-lg hover:bg-black/40 transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="short-answer"
                        id="short-answer"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="short-answer" className="text-sm text-white cursor-pointer">
                        Short Answer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-lg hover:bg-black/40 transition-colors cursor-pointer">
                      <RadioGroupItem
                        value="true-false"
                        id="true-false"
                        className="border-white text-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="true-false" className="text-sm text-white cursor-pointer">
                        True/False
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-3 block text-white">
                    Number of Questions: {numQuestions}
                  </Label>
                  <div className="bg-black/30 p-4 rounded-lg">
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
                      <p className="text-xs text-amber-400 mt-3">
                        Note: Generating {numQuestions} questions may take longer and will be processed in batches.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
        <TabsList className="relative flex w-full sm:w-2/3 mx-auto mb-5 bg-black/30 rounded-lg overflow-hidden">
          <TabsTrigger
            value="text"
            className="flex-1 py-2.5 text-center z-10 data-[state=inactive]:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white flex items-center justify-center"
          >
            <span>Text Input</span>
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="flex-1 py-2.5 text-center z-10 data-[state=inactive]:text-gray-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white flex items-center justify-center"
          >
            <span>File Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-0">
          <Card className="p-5 bg-black/30 border-gray-800/50 shadow-xl rounded-xl backdrop-blur-sm">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter or paste your text content here..."
                className="min-h-[200px] bg-[#252525] border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-lg text-gray-100 placeholder:text-gray-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${
                    isListening
                      ? "bg-red-900/70 hover:bg-red-800/70"
                      : "bg-black/40 hover:bg-black/60 hover:text-green-500"
                  } border-gray-700/50 transition-colors`}
                  onClick={handleVoiceInput}
                >
                  <Mic className={`h-4 w-4 mr-2 ${isListening ? "animate-pulse" : ""}`} />
                  {isListening ? "Stop Listening" : "Voice Input"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/40 hover:bg-black/60 hover:text-red-500 border-gray-700/50"
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
          <Card className="p-8 bg-black/30 border-gray-800/50 flex flex-col items-center justify-center shadow-xl rounded-xl backdrop-blur-sm">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md" className="hidden" />
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-green-400">Upload a Text File</h3>
                <p className="text-sm text-gray-400 mt-2">Supports TXT, MD files</p>
              </div>
              <Button
                variant="outline"
                className="bg-black/40 hover:bg-black/60 border-gray-700/50 px-6 mt-2 hover:border-green-600 transition-all"
                onClick={triggerFileUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            {inputText && (
              <div className="mt-6 w-full">
                <div className="flex items-center justify-between bg-[#252525]/70 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm truncate max-w-[200px]">File content loaded</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearInput} className="h-8 w-8 p-0 hover:bg-black/30">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {generationError && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-sm shadow-lg">
          <p className="font-medium text-red-300">Error: {generationError}</p>
          <p className="mt-2 text-xs text-gray-300">
            Try reducing the number of questions or simplifying your content.
          </p>
        </div>
      )}

      <Button
        className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all py-7 text-lg font-medium shadow-xl rounded-xl ${
          isGenerating || !inputText.trim() ? "opacity-80" : ""
        }`}
        onClick={generateQuiz}
        disabled={isGenerating || !inputText.trim()}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
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
  );
};

export default QuizCreation;
