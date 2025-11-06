import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    hero_title: "Professional YouTube Video Editing",
    hero_subtitle:
      "Premium quality editing that drives results for your channel",
    hero_cta: "Get Started",
    long_videos_title: "Long-Form Videos",
    shorts_title: "YouTube Shorts",
    clients_title: "Trusted by Top Creators",
    about_title: "About Me",
    pricing_title: "Pricing Packages",
    faq_title: "Frequently Asked Questions",
    contact_modal_title: "Get a Custom Quote",
    contact_modal_subtitle: "Choose your preferred way to reach out",
    contact_email: "Email",
    contact_whatsapp: "WhatsApp",
    contact_discord: "Discord",
    footer_rights: "All rights reserved.",
    verified: "Verified",
    subscribers: "subscribers",
    custom_package: "Custom",
    get_quote: "Get Quote",
  },
  pt: {
    hero_title: "Edição Profissional de Vídeos para YouTube",
    hero_subtitle:
      "Edição de qualidade premium que gera resultados para seu canal",
    hero_cta: "Começar Agora",
    long_videos_title: "Vídeos Longos",
    shorts_title: "YouTube Shorts",
    clients_title: "Confiado por Grandes Criadores",
    about_title: "Sobre Mim",
    pricing_title: "Pacotes de Preços",
    faq_title: "Perguntas Frequentes",
    contact_modal_title: "Solicite um Orçamento Personalizado",
    contact_modal_subtitle: "Escolha sua forma preferida de contato",
    contact_email: "Email",
    contact_whatsapp: "WhatsApp",
    contact_discord: "Discord",
    footer_rights: "Todos os direitos reservados.",
    verified: "Verificado",
    subscribers: "inscritos",
    custom_package: "Personalizado",
    get_quote: "Solicitar Orçamento",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
