import { useEffect, useState } from "react";
import { supabase, PricingPackage } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { Check } from "lucide-react";

interface PricingProps {
  onCustomQuote: () => void;
}

export default function Pricing({ onCustomQuote }: PricingProps) {
  const { language, t } = useLanguage();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pricing_packages")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (data) {
      setPackages(data);
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          {t("pricing_title")}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => {
            const name = language === "en" ? pkg.name_en : pkg.name_pt;
            const description =
              language === "en" ? pkg.description_en : pkg.description_pt;
            const features =
              language === "en" ? pkg.features_en : pkg.features_pt;
            const isPopular = index === 1;

            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  isPopular ? "ring-2 ring-emerald-500 scale-105" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {name}
                  </h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">
                    {description}
                  </p>

                  {!pkg.is_custom ? (
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">
                        ${pkg.price}
                      </span>
                      <span className="text-gray-600 ml-2">USD</span>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        {t("custom_package")}
                      </span>
                    </div>
                  )}

                  <ul className="space-y-4 mb-8">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      pkg.is_custom ? onCustomQuote() : onCustomQuote()
                    }
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      isPopular
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/50"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    {pkg.is_custom ? t("get_quote") : t("hero_cta")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
