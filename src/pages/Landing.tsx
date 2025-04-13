import { Link } from "react-router-dom";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon } from "lucide-react"
import ImageUploader from "@/components/ImageUploader"
import CodeGenerationResult from "@/components/CodeGenerationResult"
import { useToast } from "@/components/ui/use-toast"
import { generateCodeFromImage } from "@/utils/imageToCodeHelper"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export default function Home() {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("chat")

  const handleImageUpload = async (file: File) => {
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
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AninoDevAI</h1>
          <p className="text-gray-400">AI assistant for chat, image and code generation</p>
        </header>

        <Tabs defaultValue="chat" className="w-full max-w-3xl mx-auto" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
            <TabsTrigger value="code">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image to Code
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <div className="bg-[#272727] rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Chat with AninoDevAI</h2>
              <p className="text-gray-400 mb-6">
                Ask questions, generate content/image, or discuss ideas with our AI assistant
              </p>
              <Link to="/home">
              <Button size="lg" className="bg-[#1e1e1e] hover:bg-gray-600">
                Start Chatting
              </Button>
            </Link>

            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="bg-[#272727] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Image to Code</h2>
              <p className="text-gray-400 mb-6 text-center">Upload an image and get React JSX & Tailwind CSS code</p>
              <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
              {generatedCode && <CodeGenerationResult generatedCode={generatedCode} onClose={handleClearResult} />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
