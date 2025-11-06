import { useEffect, useState } from "react";
import { supabase, Client } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { CheckCircle2 } from "lucide-react";

export default function Clients() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (data) {
      setClients(data);
    }
    setLoading(false);
  };

  if (loading || clients.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          {t("clients_title")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          {clients.map((client) => {
            const Wrapper = client.channel_link
              ? (props: { children: React.ReactNode; className?: string }) => (
                  <a
                    href={client.channel_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                )
              : (props: { children: React.ReactNode; className?: string }) => (
                  <div {...props} />
                );

            return (
              <Wrapper
                key={client.id}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-gray-200 group-hover:ring-emerald-400 transition-all duration-300 transform group-hover:scale-110">
                    {client.photo_url ? (
                      <img
                        src={client.photo_url}
                        alt={client.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                        {client.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {client.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 mb-1 text-lg">
                  {client.name}
                </h3>
                {client.subscribers && (
                  <p className="text-sm text-gray-600">
                    {client.subscribers} {t("subscribers")}
                  </p>
                )}
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
