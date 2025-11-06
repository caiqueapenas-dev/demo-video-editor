import { useEffect, useState } from "react";
import { supabase, FAQItem } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const { language, t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (data) {
      setFaqs(data);
    }
    setLoading(false);
  };

  if (loading || faqs.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          {t("faq_title")}
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const question =
              language === "en" ? faq.question_en : faq.question_pt;
            const answer = language === "en" ? faq.answer_en : faq.answer_pt;
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {question}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
