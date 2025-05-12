
import { Link } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, MessageSquare, Github, Coffee, FileQuestion, Play, Brain} from "lucide-react"
import ImageUploader from "@/components/ImageUploader"
import CodeGenerationResult from "@/components/CodeGenerationResult"
import QuizGenerator from "@/components/QuizGenerator"
import { useToast } from "@/lib/use-toast"
import { generateCodeFromImage } from "@/utils/imageToCodeHelper"
import Alogo from "@/assets/brain.png";

export default function LandingPage() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")

  const handleImageUpload = async (file: File) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      toast({
        title: "API Key Missing",
        description: "Gemini API key is required for code generation",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const code = await generateCodeFromImage(GEMINI_API_KEY, file)
      setGeneratedCode(code)
    } catch (error) {
      console.error("Error in code generation:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearResult = () => {
    setGeneratedCode(null)
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] from-[#1a1a1a] to-[#232323] text-white quiz-bg-pattern">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800 flex items-center justify-center">
                <img
                  src={Alogo}
                  alt="AI Logo"
                  className="w-full h-full object-contain transition-transform transform hover:scale-105"
                />
              </div>
              <h1 className="text-3xl sm:text-2xl font-bold text-gray-400">AninoDevAI</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="https://github.com/BryanLomerio/AninoDevAi" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-500 bg-[#1e1e1e] hover:text-white border-gray-700 hover:bg-[#2A2A2A] hover:border-gray-500"
              >
                <Github className="h-4 w-4 mr-2" />
                <span>GitHub</span>
              </Button>
            </a>
            <a href="https://buymeacoffee.com/aninooo" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-500 bg-[#1e1e1e] border-gray-700 hover:bg-[#2A2A2A] hover:border-gray-500"
              >
                <Coffee className="h-4 w-4 mr-2 text-yellow-300" />
                <span className="text-yellow-300">Buy me a coffee</span>
              </Button>
            </a>
          </div>
        </header>

        <div className="bg-[#191919] p-5 sm:p-8 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden mb-8">
          <Tabs
            defaultValue="chat"
            className="text-center w-full max-w-3xl mx-auto"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid text-center grid-cols-3 mb-8 bg-[#272727] rounded-lg overflow-hidden">
              <TabsTrigger
                value="chat"
                className="flex items-center justify-center data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded-md transition-all"
              >
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Chat Assistant</span>
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="flex items-center justify-center data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded-md transition-all"
              >
                <ImageIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Image to Code</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="flex items-center justify-center data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded-md transition-all"
              >
                 <Brain className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">SelfQuizzer</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-[#1E1E1E] rounded-lg p-8 text-center border border-gray-800">
                <h2 className="text-xl font-semibold mb-4">Chat with AninoDevAI</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Ask questions about programming, get code explanations, generate images with AninoDevAI assistant.
                </p>
                <Link to="/home">
                  <Button size="lg" className="bg-green-800 hover:bg-green-900 text-white shadow-lg">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chatting
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-800">
                <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
                {generatedCode && <CodeGenerationResult generatedCode={generatedCode} onClose={handleClearResult} />}
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="bg-[#1E1E1E] rounded-lg p-8 text-center border border-gray-800">
                <h2 className="text-xl font-semibold mb-4">Generate Quiz with AninoDevAI</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Create custom quizzes from text, study materials, or any content to test your knowledge.
                </p>
                <Link to="/quiz">
                  <Button size="lg" className="bg-green-800 hover:bg-green-900 text-white shadow-lg">
                    <Play className="h-4 w-4 mr-2" />
                    Start Quiz
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>© {new Date().getFullYear()} AninoDevAI. Built with React, And Tailwind CSS</p>
        </footer>
      </div>
    </div>
  )
}
