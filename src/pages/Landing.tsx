import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, MessageSquare, Code, Github, Coffee } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import CodeGenerationResult from "@/components/CodeGenerationResult";
import { useToast } from "@/components/ui/use-toast";
import { generateCodeFromImage } from "@/utils/imageToCodeHelper";
import Alogo from "@/assets/brain.png"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function Home() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");

  const handleImageUpload = async (file: File) => {
    if (!GEMINI_API_KEY) {
      toast({
        title: "API Key Missing",
        description: "Gemini API key is required for code generation",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const code = await generateCodeFromImage(GEMINI_API_KEY, file);
      setGeneratedCode(code);
    } catch (error) {
      console.error("Error in code generation:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearResult = () => {
    setGeneratedCode(null);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="text-center md:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 text-center sm:text-left">
  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-800 flex items-center justify-center">
    <img
      src={Alogo || "/placeholder.svg"}
      alt="AI Logo"
      className="w-full h-full object-contain transition-transform transform hover:scale-105"
    />
  </div>
  <h1 className="text-3xl sm:text-4xl font-bold text-white">
    AninoDevAI
  </h1>
</div>

          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/BryanLomerio/AninoDevAi"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-gray-500 border-gray-700 hover:border-gray-500">
                <Github className="h-4 w-4 mr-2" />
                <span>GitHub</span>
              </Button>
            </a>
            <a
              href="https://buymeacoffee.com/aninooo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-gray-500 border-gray-700 hover:border-gray-500">
                <Coffee className="h-4 w-4 mr-2" />
                <span>Buy me a coffee</span>
              </Button>
            </a>
          </div>
        </header>

        <div className="bg-[#191919] p-5 sm:p-8 rounded-xl border border-gray-800 shadow-xl relative overflow-hidden mb-8">
          <div className="relative">
          </div>

          <Tabs defaultValue="chat" className="text-center w-full max-w-3xl mx-auto relative" onValueChange={setActiveTab}>
            <TabsList className="grid text-center grid-cols-2 mb-8 bg-[#272727] rounded-lg overflow-hidden">
              <TabsTrigger
                value="chat"
                className="flex items-center justify-center text-center data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded-md transition-all"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Chat Assistant</span>
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="flex items-center justify-center text-center data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded-md transition-all"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                <span>Image to Code</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <TabsContent value="chat" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="bg-[#272727] rounded-lg p-8 text-center border border-gray-800">
                  <div className="mb-6 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[#1e1e1e]">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-4">Chat with AninoDevAI</h2>
                  <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Ask questions about programming, get code explanations, generate images with AninoDevAI assistant.

                  </p>
                  <Link to="/home">
                    <Button size="lg" className="bg-[#1e1e1e] hover:bg-gray-800 text-white shadow-lg">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chatting
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4 mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="bg-[#272727] rounded-lg p-6 border border-gray-800">
                  <div className="text-center mb-6">
                   {/*  <div className="mb-6 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[#1e1e1e]">
                      <Code className="h-10 w-10 text-white" />
                    </div> */}
                   {/*  <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                      Upload a UI mockup or design, and get React JSX & Tailwind CSS code instantly. Perfect for rapid prototyping.
                    </p> */}
                  </div>
                  <ImageUploader onImageUpload={handleImageUpload} isProcessing={isProcessing} />
                  {generatedCode && <CodeGenerationResult generatedCode={generatedCode} onClose={handleClearResult} />}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12">
          <p>© {new Date().getFullYear()} AninoDevAI. Built with React, Tailwind CSS, and Gemini API.</p>
        </footer>

      </div>
    </div>
  );
}
