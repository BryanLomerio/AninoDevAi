import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, X, Code, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ImageUploaderProps {
  onImageUpload?: (file: File) => void
  isProcessing?: boolean
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isProcessing = false }) => {
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localProcessing, setLocalProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleGenerateCode = () => {
    if (!selectedFile) return

    if (typeof onImageUpload === "function") {
      try {
        onImageUpload(selectedFile)
      } catch (error) {
        console.error("Error calling onImageUpload:", error)
        toast({
          title: "Error",
          description: "Failed to process the image. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      setLocalProcessing(true)

      setTimeout(() => {
        setLocalProcessing(false)
        toast({
          title: "Demo Mode",
          description: "This is a demo. In a real app, this would process your image.",
        })
      }, 2000)

      console.log("No onImageUpload function provided. This is likely a demo or preview.")
    }
  }

  // processing status
  const isCurrentlyProcessing = isProcessing || localProcessing

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />

      {!selectedImage ? (
        <div
          ref={dropAreaRef}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-500 hover:bg-blue-500/5"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
           {/*  <Upload
              className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors ${isDragging ? "text-blue-400" : "text-gray-400"}`}
            /> */}
            <h3 className="text-base sm:text-lg font-medium">Upload an image</h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {isMobile ? "Tap to browse" : "Drag and drop or click to browse"}
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <span>Supports JPG, PNG, WebP (Max 5MB)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="ml-1 focus:outline-none" aria-label="More information">
                      <Info className="h-3 w-3 text-gray-500" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                    <p className="text-xs">For best results, use clear UI mockups</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
        <div className="relative border border-gray-700 rounded-lg overflow-hidden shadow-md">
          <div className="absolute top-2 right-2 z-10">
            <Button
              size="icon"
              variant="destructive"
              onClick={handleRemoveImage}
              className="h-8 w-8 rounded-full bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm"
              aria-label="Remove image"
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
          <div className="p-3 bg-[#272727] flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-300 truncate">{selectedFile?.name}</span>
            </div>
            <Button
              onClick={handleGenerateCode}
              disabled={isCurrentlyProcessing}
              className="w-full sm:w-auto bg-[#1e1e1e] hover:bg-gray-600 transition-colors"
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
                  Processing...
                </>
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
