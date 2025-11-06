import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div
        className="relative"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <button
          onClick={() => setLanguage(language === "en" ? "pt" : "en")}
          className={`flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 transition-all duration-300 hover:shadow-xl ${
            isExpanded ? "pr-6" : ""
          }`}
        >
          <span className="text-2xl">{language === "en" ? "🇺🇸" : "🇧🇷"}</span>
          <span
            className={`font-medium text-gray-700 transition-all duration-300 overflow-hidden ${
              isExpanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            {language === "en" ? "English" : "Português Brasil"}
          </span>
        </button>
      </div>
    </div>
  );
}
