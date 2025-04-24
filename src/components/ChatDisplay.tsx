import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Message } from "@/utils/aiHelpers"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy, User, Bot } from 'lucide-react'


interface ChatDisplayProps {
  messages: Message[]
  loading: boolean
  generatedImages: Record<number, string>
}

const CodeBlock: React.FC<{ language: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-3 mb-3 rounded-md overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between bg-slate-700 px-3 py-1.5 text-xs text-slate-300">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.875rem",
          borderRadius: 0,
          background: "#000000",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, loading, generatedImages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
      <div className="flex-1 w-full overflow-y-auto  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-purple-300 px-4 md:px-2 py-2">
        {messages.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Start a conversation with AninoDevAI</p>
            <p className="text-sm">You can turn off the AI voice in the settings.</p>
            <p className="text-sm mt-2">Click the image icon to generate an image.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto w-full">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-6 w-full ${msg.role === "user" ? "flex justify-end" : "flex justify-start"}`}
              >
                <div
                  className={`
                    ${msg.role === "user" ? "" : ""}

                    ${msg.role === "user" ? "rounded-tr-none" : "rounded-tl-none"}
                    max-w-full md:max-w-[80%]
                  `}
                >
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-600 pb-2">
                    {msg.role === "user" ? (
                      <>
                        <span className="text-xs font-medium text-slate-300">You</span>
                        <User className="h-3.5 w-3.5 text-slate-400" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-300">AninoDevAI</span>
                      </>
                    )}
                  </div>

                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ node, children }) => <p className="text-sm mb-2">{children}</p>,
                        a: ({ node, children, href }) => (
                          <a
                            href={href}
                            className="text-blue-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        ul: ({ node, children }) => <ul className="list-disc pl-5 mb-2 text-sm">{children}</ul>,
                        ol: ({ node, children }) => <ol className="list-decimal pl-5 mb-2 text-sm">{children}</ol>,
                        li: ({ node, children }) => <li className="mb-1">{children}</li>,
                        h1: ({ node, children }) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
                        h2: ({ node, children }) => <h2 className="text-md font-bold mb-2 mt-3">{children}</h2>,
                        h3: ({ node, children }) => <h3 className="text-sm font-bold mb-2 mt-3">{children}</h3>,
                        blockquote: ({ node, children }) => (
                          <blockquote className="border-l-2 border-slate-600 pl-3 italic my-2">{children}</blockquote>
                        ),
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "")
                          return !inline && match ? (
                            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                          ) : (
                            <code className="bg-slate-700 px-1 py-0.5 rounded text-xs" {...props}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {msg.parts[0].text}
                    </ReactMarkdown>

                    {/* Display generated image */}
                    {generatedImages[index] && (
                      <div className="mt-3 mb-3">
                        <img
                          src={generatedImages[index] || "/placeholder.svg"}
                          alt="Generated by AI"
                          className="w-full rounded-md border border-slate-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-6 w-full">
                <div className=" p-4 max-w-full md:max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2 border-b border-slate-600 pb-2">
                    <Bot className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-300">AninoDevAI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatDisplay
