import { useEffect, useState } from "react";
import { supabase, PortfolioSettings } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";

export default function About() {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("portfolio_settings")
      .select("*")
      .single();

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  if (loading || !settings?.show_about) return null;

  const aboutText =
    language === "en" ? settings.about_text_en : settings.about_text_pt;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          {t("about_title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              {settings.about_image_url ? (
                <img
                  src={settings.about_image_url}
                  alt="About Me"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <div className="text-white text-8xl font-bold">?</div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-500/20 rounded-2xl -z-10"></div>
          </div>

          <div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {aboutText || "Add your story here..."}
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <div className="flex-1 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  100+
                </div>
                <div className="text-sm text-gray-600">Videos Edited</div>
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">50+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
