import { GoogleGenerativeAI } from "@google/generative-ai"

export async function generateCodeFromImage(apiKey: string, imageFile: File): Promise<string> {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64(imageFile)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // image data for the API
    const imagePart = {
      inlineData: {
        data: base64Image.split(",")[1],
        mimeType: imageFile.type,
      },
    }

    // Prompt for code generation
    const prompt =
      "Generate React JSX and Tailwind CSS code that would create a UI like what you see in this image. Focus on creating clean, responsive code that replicates the visual design as closely as possible."

    // Send request to Gemini
    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error generating code from image:", error)
    throw new Error("Failed to generate code from the uploaded image. Please try again.")
  }
}

// convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
