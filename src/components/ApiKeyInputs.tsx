
import React from "react";
import { Input } from "@/components/ui/input";

interface ApiKeyInputsProps {
  geminiApiKey: string;
  vapiApiKey: string;
  onGeminiKeyChange: (key: string) => void;
  onVapiKeyChange: (key: string) => void;
}

const ApiKeyInputs: React.FC<ApiKeyInputsProps> = ({
  geminiApiKey,
  vapiApiKey,
  onGeminiKeyChange,
  onVapiKeyChange
}) => {
  return (
    <div className="mb-6 space-y-2">
      <div className="flex gap-2">
        <Input
          type="password" 
          placeholder="Enter Gemini API Key"
          value={geminiApiKey}
          onChange={(e) => onGeminiKeyChange(e.target.value)}
          className="flex-1"
        />
        <Input
          type="password" 
          placeholder="Enter Vapi API Key (optional)"
          value={vapiApiKey}
          onChange={(e) => onVapiKeyChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ApiKeyInputs;
