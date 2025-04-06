import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import ApiKeyInputs from "@/components/ApiKeyInputs"
import { useIsMobile } from "@/hooks/use-mobile"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  vapiApiKey: string
  onVapiKeyChange: (key: string) => void
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void
  shouldSpeak: boolean
  onSpeakToggle: (value: boolean) => void
  onStopSpeech: () => void
}

interface VoiceSelectorProps {
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onVoiceSelect }) => {
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = React.useState("")
  const isMobile = useIsMobile()

  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(availableVoices[0].name)
        onVoiceSelect(availableVoices[0])
      }
    }

    loadVoices()

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [onVoiceSelect, selectedVoiceName])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = event.target.value
    setSelectedVoiceName(voiceName)
    const voice = voices.find((v) => v.name === voiceName)
    if (voice) {
      onVoiceSelect(voice)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <label htmlFor="voice-select" className="text-white text-xs whitespace-nowrap">
        {isMobile ? "Voice:" : "Voice:"}
      </label>
      <select
        id="voice-select"
        value={selectedVoiceName}
        onChange={handleChange}
        className="flex-1 p-1 text-xs rounded-md border border-slate-700 bg-slate-800 text-white focus:ring-1 focus:ring-slate-600 focus:outline-none font-poppins"
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name} className="bg-slate-800 text-white font-poppins">
            {isMobile ? voice.name : `${voice.name} (${voice.lang})`}
          </option>
        ))}
      </select>
    </div>
  )
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  vapiApiKey,
  onVapiKeyChange,
  onVoiceSelect,
  shouldSpeak,
  onSpeakToggle,
  onStopSpeech,
}) => {
  const isMobile = useIsMobile()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className=" border border-gray-700 mb-10 overflow-hidden bg-[#272727]"
        >
          <div className="p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white text-sm font-medium font-poppins">Settings</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors rounded-full p-1 hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <div className=" p-2 rounded-md border border-gray-700">
                  <h4 className="text-xs text-slate-300 mb-2 font-poppins">Voice Settings</h4>
                  <VoiceSelector onVoiceSelect={onVoiceSelect} />
                </div>
              </div>

              {/* Voice Output Controls */}
              <div className=" p-2 rounded-md border border-gray-700">
                <h4 className="text-xs text-slate-300 mb-2 font-poppins">Voice Output</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-white text-xs font-poppins" htmlFor="toggle-voice">
                      {isMobile ? "Voice:" : "Enable voice responses:"}
                    </label>
                    <input
                      type="checkbox"
                      id="toggle-voice"
                      checked={shouldSpeak}
                      onChange={(e) => onSpeakToggle(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800"
                    />
                  </div>

                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-poppins transition-colors"
                    onClick={onStopSpeech}
                  >
                    {isMobile ? "Stop" : "Stop Voice"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SettingsPanel

