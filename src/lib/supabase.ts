import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PortfolioSettings {
  id: string;
  discord_link: string;
  whatsapp_link: string;
  email: string;
  about_text_en: string;
  about_text_pt: string;
  about_image_url: string;
  show_long_videos: boolean;
  show_shorts: boolean;
  show_clients: boolean;
  show_about: boolean;
  show_pricing: boolean;
  show_faq: boolean;
  updated_at: string;
}

export interface LongVideo {
  id: string;
  youtube_url: string;
  title_en: string;
  title_pt: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Short {
  id: string;
  youtube_url: string;
  title_en: string;
  title_pt: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  photo_url: string;
  subscribers: string;
  is_verified: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface PricingPackage {
  id: string;
  name_en: string;
  name_pt: string;
  description_en: string;
  description_pt: string;
  price: number;
  features_en: string[];
  features_pt: string[];
  order_index: number;
  is_active: boolean;
  is_custom: boolean;
  created_at: string;
}

export interface FAQItem {
  id: string;
  question_en: string;
  question_pt: string;
  answer_en: string;
  answer_pt: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}
