import React, { useState } from "react";
import { Volume2, Square } from "lucide-react";
import "./VoiceConverter.css";

const VoiceConverter = ({ text, stepNumber }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese" },
    { code: "ja-JP", name: "Japanese" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "ru-RU", name: "Russian" },
    { code: "hi-IN", name: "Hindi" },
  ];

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="voice-converter">
      <div className="voice-converter-content">
        <div className="voice-controls">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-selector"
            disabled={isSpeaking}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSpeak}
            className={`voice-button ${isSpeaking ? "speaking" : ""}`}
            title={isSpeaking ? "Stop speaking" : "Read aloud"}
          >
            {isSpeaking ? (
              <>
                <Square size={18} />
                Stop
              </>
            ) : (
              <>
                <Volume2 size={18} />
                Listen
              </>
            )}
          </button>
        </div>

        {stepNumber && (
          <div className="step-indicator">Step {stepNumber}</div>
        )}
      </div>
    </div>
  );
};

export default VoiceConverter;
