import { Bot } from "lucide-react";

export interface ThinkingProcessProps {
  isVisible: boolean;
  thoughts: string[];
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ isVisible, thoughts }) => {
  if (!isVisible || thoughts.length === 0) return null;

  //recent thought
  const currentThought = thoughts[thoughts.length - 1];

  return (
    <div className="flex items-start gap-3 mb-6 w-full">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-slate-300 mb-1">
          AninoDevAI <span className="text-purple-400">(thinking)</span>
        </div>
        <div className="text-sm text-slate-300 mb-2">{currentThought}</div>

        <div className="flex space-x-1 mt-2">
          <div
            className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ThinkingProcess;
