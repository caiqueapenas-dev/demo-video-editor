import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Settings,
  Video,
  Users,
  DollarSign,
  HelpCircle,
  LogOut,
  Plus,
  Trash2,
  Save,
} from "lucide-react";
import PhoneInput from "../components/PhoneInput";
import ImageUploader from "../components/ImageUploader";
import { getYoutubeThumbnail } from "../lib/youtubeUtils";

interface AdminPanelProps {
  onLogout: () => void;
}

type Tab = "settings" | "videos" | "shorts" | "clients" | "pricing" | "faq";

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Estado local para os campos complexos
  const [whatsappDDI, setWhatsappDDI] = useState("55");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [settings, setSettings] = useState({
    discord_link: "",
    whatsapp_link: "",
    email: "",
    about_text_pt: "",
    about_image_url: "",
    show_long_videos: true,
    show_shorts: true,
    show_clients: true,
    show_about: true,
    show_pricing: true,
    show_faq: true,
  });

  const [longVideos, setLongVideos] = useState<any[]>([]);
  const [shorts, setShorts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);

    if (activeTab === "settings") {
      const { data } = await supabase
        .from("portfolio_settings")
        .select("*")
        .maybeSingle();
      if (data) {
        setSettings(data);
        // Parse o whatsapp_link para DDI e Número
        if (data.whatsapp_link) {
          try {
            const url = new URL(data.whatsapp_link);
            const fullNumber = url.pathname.substring(1);
            // Isso é uma suposição simples. Ajuste se o formato do DDI variar.
            const ddi = fullNumber.substring(0, 2);
            const number = fullNumber.substring(2);
            setWhatsappDDI(ddi);
            setWhatsappNumber(number);
          } catch (e) {
            console.error("Erro ao parsear whatsapp_link:", e);
          }
        }
      }
    } else if (activeTab === "videos") {
      const { data } = await supabase
        .from("long_videos")
        .select("*")
        .order("order_index");
      if (data) setLongVideos(data);
    } else if (activeTab === "shorts") {
      const { data } = await supabase
        .from("shorts")
        .select("*")
        .order("order_index");
      if (data) setShorts(data);
    } else if (activeTab === "clients") {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("order_index");
      if (data) setClients(data);
    } else if (activeTab === "pricing") {
      const { data } = await supabase
        .from("pricing_packages")
        .select("*")
        .order("order_index");
      if (data) setPricing(data);
    } else if (activeTab === "faq") {
      const { data } = await supabase
        .from("faq_items")
        .select("*")
        .order("order_index");
      if (data) setFaqs(data);
    }

    setLoading(false);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const saveSettings = async () => {
    setLoading(true);

    // Constrói o whatsapp_link a partir do DDI e número
    const fullNumber = (whatsappDDI + whatsappNumber).replace(/\D/g, "");
    const whatsapp_link = fullNumber ? `https://wa.me/${fullNumber}` : "";

    const settingsToSave = {
      ...settings,
      whatsapp_link: whatsapp_link,
    };

    const { data: existing } = await supabase
      .from("portfolio_settings")
      .select("id")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("portfolio_settings")
        .update(settingsToSave)
        .eq("id", existing.id);
    } else {
      await supabase.from("portfolio_settings").insert([settingsToSave]);
    }

    showMessage("Settings saved successfully!");
    setLoading(false);
  };

  const addItem = (type: string) => {
    const newItem = {
      id: `temp-${Date.now()}`,
      order_index: 0,
      is_active: true,
      youtube_url: "",
      thumbnail_url: "", // Adicionado
    };

    if (type === "video") setLongVideos([...longVideos, { ...newItem }]);
    else if (type === "short") setShorts([...shorts, { ...newItem }]);
    else if (type === "client")
      setClients([
        ...clients,
        {
          ...newItem,
          name: "",
          photo_url: "",
          subscribers: "",
          channel_link: "",
          is_verified: false,
        },
      ]);
    else if (type === "pricing")
      setPricing([
        ...pricing,
        {
          ...newItem,
          name_pt: "",
          description_pt: "",
          price: 0,
          features_pt: [],
          is_custom: false,
        },
      ]);
    else if (type === "faq")
      setFaqs([...faqs, { ...newItem, question_pt: "", answer_pt: "" }]);
  };

  const deleteItem = async (type: string, id: string) => {
    if (id.startsWith("temp-")) {
      if (type === "video")
        setLongVideos(longVideos.filter((v) => v.id !== id));
      else if (type === "short") setShorts(shorts.filter((v) => v.id !== id));
      else if (type === "client")
        setClients(clients.filter((c) => c.id !== id));
      else if (type === "pricing")
        setPricing(pricing.filter((p) => p.id !== id));
      else if (type === "faq") setFaqs(faqs.filter((f) => f.id !== id));
      return;
    }

    const tables: Record<string, string> = {
      video: "long_videos",
      short: "shorts",
      client: "clients",
      pricing: "pricing_packages",
      faq: "faq_items",
    };

    await supabase.from(tables[type]).delete().eq("id", id);
    loadData();
    showMessage("Item deleted successfully!");
  };

  // Helper para atualizar URL e Thumbnail
  const handleVideoUrlChange = (
    value: string,
    index: number,
    type: "video" | "short"
  ) => {
    const updater = type === "video" ? setLongVideos : setShorts;
    const items = type === "video" ? longVideos : shorts;

    const updated = [...items];
    updated[index].youtube_url = value;

    // Auto-fetch thumbnail
    const thumbnailUrl = getYoutubeThumbnail(value);
    updated[index].thumbnail_url = thumbnailUrl;

    updater(updated);
  };

  const saveItems = async (type: string) => {
    setLoading(true);
    const tables: Record<string, string> = {
      video: "long_videos",
      short: "shorts",
      client: "clients",
      pricing: "pricing_packages",
      faq: "faq_items",
    };

    const items =
      type === "video"
        ? longVideos
        : type === "short"
        ? shorts
        : type === "client"
        ? clients
        : type === "pricing"
        ? pricing
        : faqs;

    for (const item of items) {
      const { id, ...data } = item;
      if (id.startsWith("temp-")) {
        await supabase.from(tables[type]).insert([data]);
      } else {
        await supabase.from(tables[type]).update(data).eq("id", id);
      }
    }

    showMessage("Items saved successfully!");
    loadData();
  };

  const tabs = [
    { id: "settings" as Tab, label: "Settings", icon: Settings },
    { id: "videos" as Tab, label: "Long Videos", icon: Video },
    { id: "shorts" as Tab, label: "Shorts", icon: Video },
    { id: "clients" as Tab, label: "Clients", icon: Users },
    { id: "pricing" as Tab, label: "Pricing", icon: DollarSign },
    { id: "faq" as Tab, label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      {message && (
        <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top">
          {message}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Portfolio Settings</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        setSettings({ ...settings, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      WhatsApp
                    </label>
                    <PhoneInput
                      value={{ ddi: whatsappDDI, number: whatsappNumber }}
                      onChange={({ ddi, number }) => {
                        setWhatsappDDI(ddi);
                        setWhatsappNumber(number);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Discord Link
                    </label>
                    <input
                      type="text"
                      value={settings.discord_link}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          discord_link: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <ImageUploader
                    label="Imagem de Perfil (Sobre Mim)"
                    value={settings.about_image_url}
                    onChange={(url) =>
                      setSettings({ ...settings, about_image_url: url })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      About Text (Portuguese)
                    </label>
                    <textarea
                      value={settings.about_text_pt}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          about_text_pt: e.target.value,
                        })
                      }
                      rows={5}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Section Visibility
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      "show_long_videos",
                      "show_shorts",
                      "show_clients",
                      "show_about",
                      "show_pricing",
                      "show_faq",
                    ].map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            settings[key as keyof typeof settings] as boolean
                          }
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [key]: e.target.checked,
                            })
                          }
                          className="w-5 h-5"
                        />
                        <span className="capitalize">
                          {key.replace("show_", "").replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === "videos" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Long Videos</h2>
                  <button
                    onClick={() => addItem("video")}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Video
                  </button>
                </div>

                <div className="space-y-4">
                  {longVideos.map((video, index) => (
                    <div key={video.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            YouTube URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={video.youtube_url}
                            onChange={(e) =>
                              handleVideoUrlChange(
                                e.target.value,
                                index,
                                "video"
                              )
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ordem
                          </label>
                          <select
                            value={video.order_index}
                            onChange={(e) => {
                              const updated = [...longVideos];
                              updated[index].order_index = parseInt(
                                e.target.value
                              );
                              setLongVideos(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {Array.from(
                              { length: longVideos.length + 5 },
                              (_, i) => i
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        {video.thumbnail_url && (
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-2">
                              Preview
                            </label>
                            <img
                              src={video.thumbnail_url}
                              alt="Thumbnail preview"
                              className="w-48 rounded-lg border bg-gray-100"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={video.is_active}
                            onChange={(e) => {
                              const updated = [...longVideos];
                              updated[index].is_active = e.target.checked;
                              setLongVideos(updated);
                            }}
                            className="w-5 h-5"
                          />
                          <span>Active</span>
                        </label>
                        <button
                          onClick={() => deleteItem("video", video.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems("video")}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Videos
                </button>
              </div>
            )}

            {activeTab === "shorts" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Shorts</h2>
                  <button
                    onClick={() => addItem("short")}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Short
                  </button>
                </div>

                <div className="space-y-4">
                  {shorts.map((short, index) => (
                    <div key={short.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            YouTube URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/shorts/..."
                            value={short.youtube_url}
                            onChange={(e) =>
                              handleVideoUrlChange(
                                e.target.value,
                                index,
                                "short"
                              )
                            }
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ordem
                          </label>
                          <select
                            value={short.order_index}
                            onChange={(e) => {
                              const updated = [...shorts];
                              updated[index].order_index = parseInt(
                                e.target.value
                              );
                              setShorts(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {Array.from(
                              { length: shorts.length + 5 },
                              (_, i) => i
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        {short.thumbnail_url && (
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-2">
                              Preview
                            </label>
                            <img
                              src={short.thumbnail_url}
                              alt="Thumbnail preview"
                              className="w-24 rounded-lg border bg-gray-100"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={short.is_active}
                            onChange={(e) => {
                              const updated = [...shorts];
                              updated[index].is_active = e.target.checked;
                              setShorts(updated);
                            }}
                            className="w-5 h-5"
                          />
                          <span>Active</span>
                        </label>
                        <button
                          onClick={() => deleteItem("short", short.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems("short")}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Shorts
                </button>
              </div>
            )}

            {activeTab === "clients" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Clients</h2>
                  <button
                    onClick={() => addItem("client")}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Client
                  </button>
                </div>

                <div className="space-y-4">
                  {clients.map((client, index) => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="space-y-4 mb-4">
                        <ImageUploader
                          label="Foto do Cliente"
                          value={client.photo_url}
                          onChange={(url) => {
                            const updated = [...clients];
                            updated[index].photo_url = url;
                            setClients(updated);
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Nome"
                          value={client.name}
                          onChange={(e) => {
                            const updated = [...clients];
                            updated[index].name = e.target.value;
                            setClients(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />

                        <input
                          type="text"
                          placeholder="Subscribers (e.g., 100K)"
                          value={client.subscribers}
                          onChange={(e) => {
                            const updated = [...clients];
                            updated[index].subscribers = e.target.value;
                            setClients(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Link do Canal (Opcional)"
                          value={client.channel_link}
                          onChange={(e) => {
                            const updated = [...clients];
                            updated[index].channel_link = e.target.value;
                            setClients(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ordem
                          </label>
                          <select
                            value={client.order_index}
                            onChange={(e) => {
                              const updated = [...clients];
                              updated[index].order_index = parseInt(
                                e.target.value
                              );
                              setClients(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {Array.from(
                              { length: clients.length + 5 },
                              (_, i) => i
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={client.is_verified}
                              onChange={(e) => {
                                const updated = [...clients];
                                updated[index].is_verified = e.target.checked;
                                setClients(updated);
                              }}
                              className="w-5 h-5"
                            />
                            <span>Verified</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={client.is_active}
                              onChange={(e) => {
                                const updated = [...clients];
                                updated[index].is_active = e.target.checked;
                                setClients(updated);
                              }}
                              className="w-5 h-5"
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <button
                          onClick={() => deleteItem("client", client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems("client")}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Clients
                </button>
              </div>
            )}

            {activeTab === "pricing" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Pricing Packages</h2>
                  <button
                    onClick={() => addItem("pricing")}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Package
                  </button>
                </div>

                <div className="space-y-6">
                  {pricing.map((pkg, index) => (
                    <div key={pkg.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Nome (Português)"
                          value={pkg.name_pt}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].name_pt = e.target.value;
                            setPricing(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />

                        <input
                          type="text"
                          placeholder="Descrição (Português)"
                          value={pkg.description_pt}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].description_pt = e.target.value;
                            setPricing(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Price (USD)"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].price = parseFloat(e.target.value);
                            setPricing(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ordem
                          </label>
                          <select
                            value={pkg.order_index}
                            onChange={(e) => {
                              const updated = [...pricing];
                              updated[index].order_index = parseInt(
                                e.target.value
                              );
                              setPricing(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {Array.from(
                              { length: pricing.length + 5 },
                              (_, i) => i
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Features (Português) - uma por linha
                        </label>
                        <textarea
                          value={
                            Array.isArray(pkg.features_pt)
                              ? pkg.features_pt.join("\n")
                              : ""
                          }
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].features_pt = e.target.value
                              .split("\n")
                              .filter((f) => f.trim());
                            setPricing(updated);
                          }}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pkg.is_custom}
                              onChange={(e) => {
                                const updated = [...pricing];
                                updated[index].is_custom = e.target.checked;
                                setPricing(updated);
                              }}
                              className="w-5 h-5"
                            />
                            <span>Custom Package</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pkg.is_active}
                              onChange={(e) => {
                                const updated = [...pricing];
                                updated[index].is_active = e.target.checked;
                                setPricing(updated);
                              }}
                              className="w-5 h-5"
                            />
                            <span>Active</span>
                          </label>
                        </div>
                        <button
                          onClick={() => deleteItem("pricing", pkg.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems("pricing")}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Packages
                </button>
              </div>
            )}

            {activeTab === "faq" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">FAQ Items</h2>
                  <button
                    onClick={() => addItem("faq")}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add FAQ
                  </button>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            Pergunta (Português)
                          </label>
                          <input
                            type="text"
                            value={faq.question_pt}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].question_pt = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Resposta (Português)
                          </label>
                          <textarea
                            value={faq.answer_pt}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].answer_pt = e.target.value;
                              setFaqs(updated);
                            }}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Ordem
                          </label>
                          <select
                            value={faq.order_index}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].order_index = parseInt(
                                e.target.value
                              );
                              setFaqs(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          >
                            {Array.from(
                              { length: faqs.length + 5 },
                              (_, i) => i
                            ).map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={faq.is_active}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].is_active = e.target.checked;
                              setFaqs(updated);
                            }}
                            className="w-5 h-5"
                          />
                          <span>Active</span>
                        </label>
                        <button
                          onClick={() => deleteItem("faq", faq.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems("faq")}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All FAQs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
