
import QuizGenerator from "@/components/QuizGenerator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Quiz = () => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-400 bg-[#1e1e1e] hover:text-white border-gray-700 hover:bg-[#2A2A2A]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="bg-[#191919] p-5 sm:p-8 rounded-xl border border-gray-800 shadow-xl">
          <QuizGenerator />
        </div>
      </div>
    </div>
  );
};

export default Quiz;
