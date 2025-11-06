import { useEffect, useState } from "react";
import { X, Mail, MessageCircle, Hash } from "lucide-react";
import { supabase, PortfolioSettings } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("portfolio_settings")
      .select("*")
      .single();

    if (data) {
      setSettings(data);
    }
  };

  if (!isOpen) return null;

  const handleContact = (type: string) => {
    if (!settings) return;

    switch (type) {
      case "email":
        window.location.href = `mailto:${settings.email}`;
        break;
      case "whatsapp":
        window.open(settings.whatsapp_link, "_blank");
        break;
      case "discord":
        window.open(settings.discord_link, "_blank");
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("contact_modal_title")}
          </h2>
          <p className="text-emerald-100">{t("contact_modal_subtitle")}</p>
        </div>

        <div className="p-6 space-y-4">
          {settings?.email && (
            <button
              onClick={() => handleContact("email")}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-emerald-300 group"
            >
              <div className="bg-emerald-100 group-hover:bg-emerald-200 p-3 rounded-lg transition-all">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">
                  {t("contact_email")}
                </div>
                <div className="text-sm text-gray-600">{settings.email}</div>
              </div>
            </button>
          )}

          {settings?.whatsapp_link && (
            <button
              onClick={() => handleContact("whatsapp")}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-green-300 group"
            >
              <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-lg transition-all">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">
                  {t("contact_whatsapp")}
                </div>
                <div className="text-sm text-gray-600">Chat on WhatsApp</div>
              </div>
            </button>
          )}

          {settings?.discord_link && (
            <button
              onClick={() => handleContact("discord")}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 group"
            >
              <div className="bg-indigo-100 group-hover:bg-indigo-200 p-3 rounded-lg transition-all">
                <Hash className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-900">
                  {t("contact_discord")}
                </div>
                <div className="text-sm text-gray-600">Message on Discord</div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
