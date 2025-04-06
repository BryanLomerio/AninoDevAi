/* import React, { useState, useEffect } from "react";

interface VoiceSelectorProps {
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onVoiceSelect }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Set default if none is selected
      if (availableVoices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(availableVoices[0].name);
        onVoiceSelect(availableVoices[0]);
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [onVoiceSelect, selectedVoiceName]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = event.target.value;
    setSelectedVoiceName(voiceName);
    const voice = voices.find((v) => v.name === voiceName);
    if (voice) {
      onVoiceSelect(voice);
    }
  };

  return (
    <select value={selectedVoiceName} onChange={handleChange}>
      {voices.map((voice) => (
        <option key={voice.name} value={voice.name}>
          {voice.name} ({voice.lang})
        </option>
      ))}
    </select>
  );
};

export default VoiceSelector;
 */
