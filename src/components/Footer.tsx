import { useLanguage } from "../contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-gray-400">
          © {currentYear} Video Editing Portfolio. {t("footer_rights")}
        </p>
      </div>
    </footer>
  );
}
