import { useState, useRef, useEffect } from "react"
import type { Message } from "../utils/aiHelpers"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react"

interface ChatDisplayProps {
  messages: Message[]
  loading: boolean
  generatedImages: Record<number, string>
  thinking: boolean
  thoughts: string[]
}

const CodeBlock: React.FC<{ language: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mt-4 mb-4 rounded-md border border-slate-700 overflow-hidden w-full">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 text-xs text-slate-300">
        <span className="font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
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
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            background: "#0d1117",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

// Typing
const TypingAnimation: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Reset animation when text changes
    setDisplayedText("")
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 20)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <div className="text-sm text-slate-300 mb-2 break-words">{displayedText}</div>
}

// Loading
const LoadingIndicator = () => (
  <div className="flex space-x-1.5 items-center mb-4">
    <div className="h-2 w-2 bg-emerald-500/70 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
    <div className="h-2 w-2 bg-emerald-500/70 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
    <div className="h-2 w-2 bg-emerald-500/70 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
  </div>
)

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, loading, generatedImages, thinking, thoughts }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null)
  const [ratings, setRatings] = useState<Record<number, 1 | -1 | 0>>({})
  const [previousThoughts, setPreviousThoughts] = useState<string[]>([])
  const [showPreviousThoughts, setShowPreviousThoughts] = useState(false)

  // current and prev
  useEffect(() => {
    if (thinking && thoughts.length > 0) {
      const currentThought = thoughts[thoughts.length - 1]
      if (!previousThoughts.includes(currentThought)) {
        setPreviousThoughts((prev) => [...prev, currentThought])
      }
    } else if (!thinking) {
      setPreviousThoughts([])
    }
  }, [thinking, thoughts])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loading, thinking, thoughts])

  const copyMessageToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageIndex(index)
    setTimeout(() => setCopiedMessageIndex(null), 2000)
  }

  const currentThought = thinking && thoughts.length > 0 ? thoughts[thoughts.length - 1] : null

  return (
    <div className="w-full text-white pb-4">
      {messages.length === 0 && !loading && !thinking ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 px-4 py-8">
          <h3 className="text-xl font-medium text-white mb-3">Start a conversation with AninoDevAI</h3>
          <p className="text-sm text-center text-slate-400 max-w-md mb-6">
            Ask questions, generate code, create images, or just chat.
          </p>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md w-full">
            <div className="bg-[#40414F] border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-white mb-1">Turn off AI voice</p>
              <p className="text-xs text-slate-400">Adjust settings in the menu</p>
            </div>
            <div className="bg-[#40414F] border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer">
              <p className="text-sm font-medium text-white mb-1">Generate images</p>
              <p className="text-xs text-slate-400">Click the image icon to create</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <div key={index} className="w-full border-b border-slate-800/10 py-6">
              <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {msg.role === "user" ? (
                  // User message
                  <div className="flex flex-col items-end">
                    <div className="max-w-[90%] md:max-w-[75%]">
                      <div className="prose prose-invert break-words">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="text-sm mb-3 break-words leading-relaxed">{children}</p>,
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                className="text-blue-400 hover:underline break-words"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-sm space-y-1">{children}</ul>,
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 mb-3 text-sm space-y-1">{children}</ol>
                            ),
                            li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 mt-4 break-words">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold mb-3 mt-4 break-words">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold mb-2 mt-3 break-words">{children}</h3>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-slate-600 pl-4 italic my-3 text-slate-300 break-words">
                                {children}
                              </blockquote>
                            ),
                            code({ inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "")
                              if (!inline && match) {
                                return <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                              }
                              return (
                                <code
                                  className="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono break-words"
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            },
                            pre: ({ children }) => <pre className="w-full overflow-x-auto">{children}</pre>,
                          }}
                        >
                          {msg.parts[0].text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Assistant mess
                  <div className="flex flex-col">
                    <div className="max-w-[90%] md:max-w-[75%]">
                      <div className="prose prose-sm prose-invert break-words w-full">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="text-sm mb-3 break-words leading-relaxed">{children}</p>,
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                className="text-blue-400 hover:underline break-words"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-sm space-y-1">{children}</ul>,
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 mb-3 text-sm space-y-1">{children}</ol>
                            ),
                            li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mb-3 mt-4 break-words">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold mb-3 mt-4 break-words">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold mb-2 mt-3 break-words">{children}</h3>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-slate-600 pl-4 italic my-3 text-slate-300 break-words">
                                {children}
                              </blockquote>
                            ),
                            code({ inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "")
                              if (!inline && match) {
                                return <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                              }
                              return (
                                <code
                                  className="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono break-words"
                                  {...props}
                                >
                                  {children}
                                </code>
                              )
                            },
                            pre: ({ children }) => <pre className="w-full overflow-x-auto">{children}</pre>,
                          }}
                        >
                          {msg.parts[0].text}
                        </ReactMarkdown>

                        {generatedImages[index] && (
                          <div className="mt-4 mb-4">
                            <img
                              src={generatedImages[index] || "/placeholder.svg"}
                              alt="Generated by AI"
                              className="w-full rounded-md border border-slate-700 shadow-lg"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <button
                          onClick={() => copyMessageToClipboard(msg.parts[0].text, index)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700/30"
                        >
                          {copiedMessageIndex === index ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setRatings((prev) => ({
                                ...prev,
                                [index]: prev[index] === 1 ? 0 : 1,
                              }))
                            }
                            className={`p-1.5 rounded transition-colors ${
                              ratings[index] === 1
                                ? "text-emerald-400 bg-emerald-400/10"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                            }`}
                            aria-label="Thumbs up"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setRatings((prev) => ({
                                ...prev,
                                [index]: prev[index] === -1 ? 0 : -1,
                              }))
                            }
                            className={`p-1.5 rounded transition-colors ${
                              ratings[index] === -1
                                ? "text-red-400 bg-red-400/10"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                            }`}
                            aria-label="Thumbs down"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {(thinking || loading) && (
            <div className="w-full py-6">
              <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col">
                  <div className="max-w-[90%] md:max-w-[75%]">
                    {thinking && currentThought && (
                      <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30 mb-4 animate-fadeIn w-full">
                        <div className="text-xs text-emerald-400 font-medium mb-2 flex items-center justify-between">
                          <span>Critical Thinking Process</span>
                          {previousThoughts.length > 1 && (
                            <button
                              onClick={() => setShowPreviousThoughts(!showPreviousThoughts)}
                              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                              {showPreviousThoughts ? (
                                <>
                                  <span>Hide history</span>
                                  <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  <span>Show history</span>
                                  <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <TypingAnimation text={currentThought} />

                        {showPreviousThoughts && previousThoughts.length > 1 && (
                          <div className="mt-3 space-y-2 pl-3 border-l-2 border-slate-700">
                            {previousThoughts.slice(0, -1).map((thought, i) => (
                              <div
                                key={i}
                                className="text-xs text-slate-400 break-words"
                                style={{ opacity: 0.7 - i * 0.15 > 0.3 ? 0.7 - i * 0.15 : 0.3 }}
                              >
                                {thought}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {loading && <LoadingIndicator />}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      )}
    </div>
  )
}

export default ChatDisplay
