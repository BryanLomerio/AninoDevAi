import React from "react";
import { Bot } from "lucide-react";

interface ThinkingProcessProps {
  isVisible: boolean;
  thoughts: string[];
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ isVisible, thoughts }) => {
  if (!isVisible || thoughts.length === 0) return null;

  return (
    <div className="mb-6 w-full border-b border-slate-700/30 pb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-800">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs font-medium text-slate-300 mb-1">
            AninoDevAI <span className="text-purple-400">(thinking)</span>
          </div>

          <div className="prose prose-sm prose-invert break-words max-w-full">
            <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Critical Thinking Process</h4>
              {thoughts.map((thought, idx) => (
                <div key={idx} className="mb-2 last:mb-0">
                  <p className="text-xs text-slate-300">{thought}</p>
                  {idx < thoughts.length - 1 && (
                    <div className="w-full h-px bg-slate-700/30 my-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingProcess;
