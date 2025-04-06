import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Volume2, VolumeX } from "lucide-react"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void
  shouldSpeak: boolean
  onSpeakToggle: (value: boolean) => void
  onStopSpeech: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onVoiceSelect,
  shouldSpeak,
  onSpeakToggle,
  onStopSpeech,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0)
  const initialVoiceSet = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        if (availableVoices.length > 0) {
          setVoices(availableVoices)
          // set the default voice once.
          if (!initialVoiceSet.current) {
            const defaultVoiceIndex = availableVoices.findIndex(
              (voice) =>
                voice.name.toLowerCase().includes("male") ||
                /david|mark|fred|alex|paul|zarvox|bruce/.test(voice.name.toLowerCase())
            )
            const chosenIndex = defaultVoiceIndex !== -1 ? defaultVoiceIndex : 0
            setSelectedVoiceIndex(chosenIndex)
            onVoiceSelect(availableVoices[chosenIndex])
            initialVoiceSet.current = true
          }
        }
      }

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
      loadVoices()
    }
  }, [onVoiceSelect])

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(e.target.value)
    setSelectedVoiceIndex(index)
    onVoiceSelect(voices[index])
  }

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#272727] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Text-to-Speech Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-300">Text-to-Speech</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {shouldSpeak ? (
                  <Volume2 className="h-4 w-4 text-slate-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-400" />
                )}
                <Label htmlFor="tts-toggle" className="text-sm text-slate-300">
                  Enable speech
                </Label>
              </div>
              <Switch id="tts-toggle" checked={shouldSpeak} onCheckedChange={onSpeakToggle} />
            </div>

            {shouldSpeak && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="voice-select" className="text-sm text-slate-300">
                    Voice
                  </Label>
                  <select
                    id="voice-select"
                    value={selectedVoiceIndex}
                    onChange={handleVoiceChange}
                    className="w-full bg-slate-800 text-white rounded-md border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-600"
                  >
                    {voices.map((voice, index) => (
                      <option key={`${voice.name}-${index}`} value={index}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={onStopSpeech}>
                    Stop Speaking
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
