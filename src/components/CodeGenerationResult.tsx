import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, X } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeGenerationResultProps {
  generatedCode: string
  onClose: () => void
}

const CodeGenerationResult: React.FC<CodeGenerationResultProps> = ({ generatedCode, onClose }) => {
  const [copied, setCopied] = useState(false)

  //code parser
  const extractCodeBlocks = (markdown: string) => {
    const codeBlockRegex = /```(?:jsx|tsx|javascript|html|react)?\s*([\s\S]*?)```/g
    let match
    const codeBlocks = []

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      codeBlocks.push(match[1].trim())
    }

    // If no code return the full text
    if (codeBlocks.length === 0) {
      return [markdown]
    }

    return codeBlocks
  }

  const codeBlocks = extractCodeBlocks(generatedCode)

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-md overflow-hidden mt-4">
      <div className="bg-[#272727] p-3 flex justify-between items-center">
        <h3 className="text-white font-medium">Generated Code</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-1 h-8 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="h-8 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto p-4">
        {codeBlocks.map((codeBlock, index) => (
          <div key={index} className="mb-4">
            <SyntaxHighlighter
              language="jsx"
              style={vscDarkPlus}
              className="rounded-md"
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.875rem",
                backgroundColor: "#000000",
                borderRadius: "0.375rem",
              }}
            >
              {codeBlock}
            </SyntaxHighlighter>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CodeGenerationResult
