import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, X, Code } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  onImageUpload?: (file: File) => void;
  isProcessing?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  isProcessing = false,
}) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerateCode = () => {
    if (!selectedFile) return;

    if (typeof onImageUpload === "function") {
      try {
        onImageUpload(selectedFile);
      } catch (error) {
        console.error("Error calling onImageUpload:", error);
        toast({
          title: "Error",
          description: "Failed to process the image. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setLocalProcessing(true);

      setTimeout(() => {
        setLocalProcessing(false);
        toast({
          title: "Demo Mode",
          description: "This is a demo. In a real app, this would process your image.",
        });
      }, 2000);

      console.log("No onImageUpload function provided. This is likely a demo or preview.");
    }
  };

  // processing status
  const isCurrentlyProcessing = isProcessing || localProcessing;

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!selectedImage ? (
        <div
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-10 w-10 text-gray-400" />
            <h3 className="text-lg font-medium">Upload an image</h3>
            <p className="text-sm text-gray-400">Drag and drop or click to browse</p>
            <p className="text-xs text-gray-500">Supports JPG, PNG, WebP (Max 5MB)</p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              Select Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative border border-gray-700 rounded-lg overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <Button
              size="icon"
              variant="destructive"
              onClick={handleRemoveImage}
              className="h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="p-3 bg-[#272727] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300 truncate max-w-[200px]">
                {selectedFile?.name}
              </span>
            </div>
            <Button
              onClick={handleGenerateCode}
              disabled={isCurrentlyProcessing}
              className="bg-[#1e1e1e] hover:bg-gray-600"
            >
              {isCurrentlyProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">
                    <Code className="h-4 w-4" />
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Generate Code</span>
                  <span className="sm:hidden">
                    <Code className="h-4 w-4" />
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
