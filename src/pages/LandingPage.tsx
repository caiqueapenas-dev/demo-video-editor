import { useState, useEffect } from 'react';
import { supabase, PortfolioSettings } from '../lib/supabase';
import Hero from '../components/Hero';
import VideoSection from '../components/VideoSection';
import Clients from '../components/Clients';
import About from '../components/About';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import LanguageSwitch from '../components/LanguageSwitch';

export default function LandingPage() {
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('portfolio_settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LanguageSwitch />

      <Hero />

      {settings?.show_long_videos && <VideoSection type="long" />}

      {settings?.show_shorts && <VideoSection type="short" />}

      {settings?.show_clients && <Clients />}

      {settings?.show_about && <About />}

      {settings?.show_pricing && (
        <Pricing onCustomQuote={() => setIsContactModalOpen(true)} />
      )}

      {settings?.show_faq && <FAQ />}

      <Footer />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}