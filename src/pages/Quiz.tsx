import QuizGenerator from "@/components/QuizGenerator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Quiz = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#232323] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-300 bg-[#1e1e1e]/50 hover:text-white border-gray-700 hover:bg-[#2A2A2A] backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="">
          <QuizGenerator />
        </div>
      </div>
    </div>
  );
};

export default Quiz;
