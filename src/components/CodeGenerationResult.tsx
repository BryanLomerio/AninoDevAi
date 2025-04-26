import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, X, ChevronDown, ChevronUp } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeGenerationResultProps {
  generatedCode: string
  onClose: () => void
}

const CodeGenerationResult: React.FC<CodeGenerationResultProps> = ({ generatedCode, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [maxHeight, setMaxHeight] = useState("500px")
  const codeContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // sm breakpoint
        setMaxHeight("300px")
      } else {
        setMaxHeight("500px")
      }
    }

    handleResize() // Set initial value
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Code parser
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

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="bg-[#1e1e1e] border border-gray-700 rounded-md overflow-hidden mt-4 shadow-lg transition-all">
      <div className="bg-[#272727] p-3 flex justify-between items-center">
        <h3 className="text-white font-medium flex items-center">
          <span>Generated Code</span>
          <span className="ml-2 text-xs text-gray-400 hidden sm:inline">
            {codeBlocks.length} {codeBlocks.length === 1 ? "block" : "blocks"}
          </span>
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleExpand}
            className="h-8 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            aria-label={expanded ? "Collapse code" : "Expand code"}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-1 h-8 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="h-8 bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={codeContainerRef}
        className={`overflow-y-auto p-4 transition-all duration-300 ease-in-out ${expanded ? "" : "max-h-0 p-0"}`}
        style={{ maxHeight: expanded ? maxHeight : "0px" }}
      >
        {codeBlocks.map((codeBlock, index) => (
          <div key={index} className="mb-4 last:mb-0">
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
              wrapLines={true}
              wrapLongLines={true}
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
