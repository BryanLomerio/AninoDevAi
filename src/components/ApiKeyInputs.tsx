import React from "react";
import { Input } from "@/components/ui/input";

interface ApiKeyInputsProps {
  vapiApiKey: string;
  onVapiKeyChange: (key: string) => void;
}

const ApiKeyInputs: React.FC<ApiKeyInputsProps> = ({
  vapiApiKey,
  onVapiKeyChange,
}) => (
  <div className="mb-6 space-y-2">
    <div className="flex gap-2">

    </div>
  </div>
);

export default ApiKeyInputs;
