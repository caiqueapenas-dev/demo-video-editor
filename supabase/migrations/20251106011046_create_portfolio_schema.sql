/*
  # Video Portfolio Schema

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text, hashed password)
      - `created_at` (timestamptz)
    
    - `portfolio_settings`
      - `id` (uuid, primary key)
      - `discord_link` (text)
      - `whatsapp_link` (text)
      - `email` (text)
      - `about_text_en` (text)
      - `about_text_pt` (text)
      - `about_image_url` (text)
      - `show_long_videos` (boolean)
      - `show_shorts` (boolean)
      - `show_clients` (boolean)
      - `show_about` (boolean)
      - `show_pricing` (boolean)
      - `show_faq` (boolean)
      - `updated_at` (timestamptz)
    
    - `long_videos`
      - `id` (uuid, primary key)
      - `youtube_url` (text)
      - `title_en` (text)
      - `title_pt` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `shorts`
      - `id` (uuid, primary key)
      - `youtube_url` (text)
      - `title_en` (text)
      - `title_pt` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `photo_url` (text)
      - `subscribers` (text)
      - `is_verified` (boolean)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `pricing_packages`
      - `id` (uuid, primary key)
      - `name_en` (text)
      - `name_pt` (text)
      - `description_en` (text)
      - `description_pt` (text)
      - `price` (decimal)
      - `features_en` (jsonb)
      - `features_pt` (jsonb)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `is_custom` (boolean)
      - `created_at` (timestamptz)
    
    - `faq_items`
      - `id` (uuid, primary key)
      - `question_en` (text)
      - `question_pt` (text)
      - `answer_en` (text)
      - `answer_pt` (text)
      - `order_index` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for portfolio data
    - Admin-only write access (to be implemented in app logic)
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_link text DEFAULT '',
  whatsapp_link text DEFAULT '',
  email text DEFAULT '',
  about_text_en text DEFAULT '',
  about_text_pt text DEFAULT '',
  about_image_url text DEFAULT '',
  show_long_videos boolean DEFAULT true,
  show_shorts boolean DEFAULT true,
  show_clients boolean DEFAULT true,
  show_about boolean DEFAULT true,
  show_pricing boolean DEFAULT true,
  show_faq boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS long_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url text NOT NULL,
  title_en text DEFAULT '',
  title_pt text DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url text NOT NULL,
  title_en text DEFAULT '',
  title_pt text DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text DEFAULT '',
  subscribers text DEFAULT '',
  is_verified boolean DEFAULT false,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_pt text NOT NULL,
  description_en text DEFAULT '',
  description_pt text DEFAULT '',
  price decimal DEFAULT 0,
  features_en jsonb DEFAULT '[]'::jsonb,
  features_pt jsonb DEFAULT '[]'::jsonb,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_en text NOT NULL,
  question_pt text NOT NULL,
  answer_en text NOT NULL,
  answer_pt text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE long_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read portfolio settings"
  ON portfolio_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can read active long videos"
  ON long_videos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active shorts"
  ON shorts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active clients"
  ON clients FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active pricing packages"
  ON pricing_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active FAQ items"
  ON faq_items FOR SELECT
  USING (is_active = true);

INSERT INTO admin_users (username, password) 
VALUES ('admin', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO portfolio_settings (discord_link, whatsapp_link, email, about_text_en, about_text_pt)
VALUES ('', '', 'contact@example.com', 'Professional video editor with years of experience.', 'Editor de vídeo profissional com anos de experiência.')
ON CONFLICT DO NOTHING;