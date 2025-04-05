
import React from "react";
import { Message } from "@/utils/aiHelpers";

interface ChatDisplayProps {
  messages: Message[];
  loading: boolean;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, loading }) => {
  return (
    <div className="border rounded-md p-4 h-80 overflow-y-auto mb-4 bg-white">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`mb-3 p-3 rounded-lg ${
            msg.role === "user"
              ? "bg-blue-100 ml-12"
              : "bg-gray-100 mr-12"
          }`}
        >
          <p className="text-sm font-medium mb-1">
            {msg.role === "user" ? "You" : "AninoDev"}
          </p>
          <p>{msg.parts[0].text}</p>
        </div>
      ))}
      {loading && (
        <div className="bg-gray-100 p-3 rounded-lg mr-12 mb-3">
          <p className="text-sm font-medium mb-1">AninoDev</p>
          <p>Thinking...</p>
        </div>
      )}
    </div>
  );
};

export default ChatDisplay;
