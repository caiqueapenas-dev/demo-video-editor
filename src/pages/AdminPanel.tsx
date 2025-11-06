import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Settings, Video, Users, FileText, DollarSign, HelpCircle,
  LogOut, Eye, EyeOff, Plus, Trash2, Save
} from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

type Tab = 'settings' | 'videos' | 'shorts' | 'clients' | 'pricing' | 'faq';

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [settings, setSettings] = useState({
    discord_link: '',
    whatsapp_link: '',
    email: '',
    about_text_en: '',
    about_text_pt: '',
    about_image_url: '',
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

    if (activeTab === 'settings') {
      const { data } = await supabase.from('portfolio_settings').select('*').maybeSingle();
      if (data) setSettings(data);
    } else if (activeTab === 'videos') {
      const { data } = await supabase.from('long_videos').select('*').order('order_index');
      if (data) setLongVideos(data);
    } else if (activeTab === 'shorts') {
      const { data } = await supabase.from('shorts').select('*').order('order_index');
      if (data) setShorts(data);
    } else if (activeTab === 'clients') {
      const { data } = await supabase.from('clients').select('*').order('order_index');
      if (data) setClients(data);
    } else if (activeTab === 'pricing') {
      const { data } = await supabase.from('pricing_packages').select('*').order('order_index');
      if (data) setPricing(data);
    } else if (activeTab === 'faq') {
      const { data } = await supabase.from('faq_items').select('*').order('order_index');
      if (data) setFaqs(data);
    }

    setLoading(false);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveSettings = async () => {
    setLoading(true);
    const { data: existing } = await supabase.from('portfolio_settings').select('id').maybeSingle();

    if (existing) {
      await supabase.from('portfolio_settings').update(settings).eq('id', existing.id);
    } else {
      await supabase.from('portfolio_settings').insert([settings]);
    }

    showMessage('Settings saved successfully!');
    setLoading(false);
  };

  const addItem = (type: string) => {
    const newItem = {
      id: `temp-${Date.now()}`,
      order_index: 0,
      is_active: true,
      youtube_url: '',
      title_en: '',
      title_pt: '',
    };

    if (type === 'video') setLongVideos([...longVideos, newItem]);
    else if (type === 'short') setShorts([...shorts, newItem]);
    else if (type === 'client') setClients([...clients, { ...newItem, name: '', photo_url: '', subscribers: '', is_verified: false }]);
    else if (type === 'pricing') setPricing([...pricing, { ...newItem, name_en: '', name_pt: '', description_en: '', description_pt: '', price: 0, features_en: [], features_pt: [], is_custom: false }]);
    else if (type === 'faq') setFaqs([...faqs, { ...newItem, question_en: '', question_pt: '', answer_en: '', answer_pt: '' }]);
  };

  const deleteItem = async (type: string, id: string) => {
    if (id.startsWith('temp-')) {
      if (type === 'video') setLongVideos(longVideos.filter(v => v.id !== id));
      else if (type === 'short') setShorts(shorts.filter(v => v.id !== id));
      else if (type === 'client') setClients(clients.filter(c => c.id !== id));
      else if (type === 'pricing') setPricing(pricing.filter(p => p.id !== id));
      else if (type === 'faq') setFaqs(faqs.filter(f => f.id !== id));
      return;
    }

    const tables: Record<string, string> = {
      video: 'long_videos',
      short: 'shorts',
      client: 'clients',
      pricing: 'pricing_packages',
      faq: 'faq_items',
    };

    await supabase.from(tables[type]).delete().eq('id', id);
    loadData();
    showMessage('Item deleted successfully!');
  };

  const saveItems = async (type: string) => {
    setLoading(true);
    const tables: Record<string, string> = {
      video: 'long_videos',
      short: 'shorts',
      client: 'clients',
      pricing: 'pricing_packages',
      faq: 'faq_items',
    };

    const items = type === 'video' ? longVideos : type === 'short' ? shorts : type === 'client' ? clients : type === 'pricing' ? pricing : faqs;

    for (const item of items) {
      const { id, ...data } = item;
      if (id.startsWith('temp-')) {
        await supabase.from(tables[type]).insert([data]);
      } else {
        await supabase.from(tables[type]).update(data).eq('id', id);
      }
    }

    showMessage('Items saved successfully!');
    loadData();
  };

  const tabs = [
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'videos' as Tab, label: 'Long Videos', icon: Video },
    { id: 'shorts' as Tab, label: 'Shorts', icon: Video },
    { id: 'clients' as Tab, label: 'Clients', icon: Users },
    { id: 'pricing' as Tab, label: 'Pricing', icon: DollarSign },
    { id: 'faq' as Tab, label: 'FAQ', icon: HelpCircle },
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
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Portfolio Settings</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp Link</label>
                    <input
                      type="text"
                      value={settings.whatsapp_link}
                      onChange={(e) => setSettings({ ...settings, whatsapp_link: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="https://wa.me/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Discord Link</label>
                    <input
                      type="text"
                      value={settings.discord_link}
                      onChange={(e) => setSettings({ ...settings, discord_link: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">About Image URL</label>
                    <input
                      type="text"
                      value={settings.about_image_url}
                      onChange={(e) => setSettings({ ...settings, about_image_url: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">About Text (English)</label>
                  <textarea
                    value={settings.about_text_en}
                    onChange={(e) => setSettings({ ...settings, about_text_en: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">About Text (Portuguese)</label>
                  <textarea
                    value={settings.about_text_pt}
                    onChange={(e) => setSettings({ ...settings, about_text_pt: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Section Visibility</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {['show_long_videos', 'show_shorts', 'show_clients', 'show_about', 'show_pricing', 'show_faq'].map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span className="capitalize">{key.replace('show_', '').replace('_', ' ')}</span>
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

            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Long Videos</h2>
                  <button
                    onClick={() => addItem('video')}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Video
                  </button>
                </div>

                <div className="space-y-4">
                  {longVideos.map((video, index) => (
                    <div key={video.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="YouTube URL"
                          value={video.youtube_url}
                          onChange={(e) => {
                            const updated = [...longVideos];
                            updated[index].youtube_url = e.target.value;
                            setLongVideos(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Order"
                          value={video.order_index}
                          onChange={(e) => {
                            const updated = [...longVideos];
                            updated[index].order_index = parseInt(e.target.value);
                            setLongVideos(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Title (English)"
                          value={video.title_en}
                          onChange={(e) => {
                            const updated = [...longVideos];
                            updated[index].title_en = e.target.value;
                            setLongVideos(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Title (Portuguese)"
                          value={video.title_pt}
                          onChange={(e) => {
                            const updated = [...longVideos];
                            updated[index].title_pt = e.target.value;
                            setLongVideos(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
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
                          onClick={() => deleteItem('video', video.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems('video')}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Videos
                </button>
              </div>
            )}

            {activeTab === 'shorts' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Shorts</h2>
                  <button
                    onClick={() => addItem('short')}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Short
                  </button>
                </div>

                <div className="space-y-4">
                  {shorts.map((short, index) => (
                    <div key={short.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="YouTube URL"
                          value={short.youtube_url}
                          onChange={(e) => {
                            const updated = [...shorts];
                            updated[index].youtube_url = e.target.value;
                            setShorts(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Order"
                          value={short.order_index}
                          onChange={(e) => {
                            const updated = [...shorts];
                            updated[index].order_index = parseInt(e.target.value);
                            setShorts(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Title (English)"
                          value={short.title_en}
                          onChange={(e) => {
                            const updated = [...shorts];
                            updated[index].title_en = e.target.value;
                            setShorts(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Title (Portuguese)"
                          value={short.title_pt}
                          onChange={(e) => {
                            const updated = [...shorts];
                            updated[index].title_pt = e.target.value;
                            setShorts(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
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
                          onClick={() => deleteItem('short', short.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems('short')}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Shorts
                </button>
              </div>
            )}

            {activeTab === 'clients' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Clients</h2>
                  <button
                    onClick={() => addItem('client')}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Client
                  </button>
                </div>

                <div className="space-y-4">
                  {clients.map((client, index) => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          placeholder="Name"
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
                          placeholder="Photo URL"
                          value={client.photo_url}
                          onChange={(e) => {
                            const updated = [...clients];
                            updated[index].photo_url = e.target.value;
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
                          type="number"
                          placeholder="Order"
                          value={client.order_index}
                          onChange={(e) => {
                            const updated = [...clients];
                            updated[index].order_index = parseInt(e.target.value);
                            setClients(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
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
                          onClick={() => deleteItem('client', client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems('client')}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Clients
                </button>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Pricing Packages</h2>
                  <button
                    onClick={() => addItem('pricing')}
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
                          placeholder="Name (English)"
                          value={pkg.name_en}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].name_en = e.target.value;
                            setPricing(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Name (Portuguese)"
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
                          placeholder="Description (English)"
                          value={pkg.description_en}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].description_en = e.target.value;
                            setPricing(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Description (Portuguese)"
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
                        <input
                          type="number"
                          placeholder="Order"
                          value={pkg.order_index}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].order_index = parseInt(e.target.value);
                            setPricing(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Features (English) - one per line</label>
                        <textarea
                          value={Array.isArray(pkg.features_en) ? pkg.features_en.join('\n') : ''}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].features_en = e.target.value.split('\n').filter(f => f.trim());
                            setPricing(updated);
                          }}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Features (Portuguese) - one per line</label>
                        <textarea
                          value={Array.isArray(pkg.features_pt) ? pkg.features_pt.join('\n') : ''}
                          onChange={(e) => {
                            const updated = [...pricing];
                            updated[index].features_pt = e.target.value.split('\n').filter(f => f.trim());
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
                          onClick={() => deleteItem('pricing', pkg.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems('pricing')}
                  disabled={loading}
                  className="mt-6 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save className="w-5 h-5" />
                  Save All Packages
                </button>
              </div>
            )}

            {activeTab === 'faq' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">FAQ Items</h2>
                  <button
                    onClick={() => addItem('faq')}
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
                        <div>
                          <label className="block text-sm font-medium mb-2">Question (English)</label>
                          <input
                            type="text"
                            value={faq.question_en}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].question_en = e.target.value;
                              setFaqs(updated);
                            }}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Question (Portuguese)</label>
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
                          <label className="block text-sm font-medium mb-2">Answer (English)</label>
                          <textarea
                            value={faq.answer_en}
                            onChange={(e) => {
                              const updated = [...faqs];
                              updated[index].answer_en = e.target.value;
                              setFaqs(updated);
                            }}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Answer (Portuguese)</label>
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
                        <input
                          type="number"
                          placeholder="Order"
                          value={faq.order_index}
                          onChange={(e) => {
                            const updated = [...faqs];
                            updated[index].order_index = parseInt(e.target.value);
                            setFaqs(updated);
                          }}
                          className="px-4 py-2 border rounded-lg"
                        />
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
                          onClick={() => deleteItem('faq', faq.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveItems('faq')}
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