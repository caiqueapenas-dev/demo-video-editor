import { useEffect, useState } from "react";
import { supabase, LongVideo, Short } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";

interface VideoSectionProps {
  type: "long" | "short";
}

export default function VideoSection({ type }: VideoSectionProps) {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<(LongVideo | Short)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [type]);

  const loadVideos = async () => {
    setLoading(true);
    const table = type === "long" ? "long_videos" : "shorts";
    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (data) {
      setVideos(data);
    }
    setLoading(false);
  };

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\?\/]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  if (loading || videos.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          {type === "long" ? t("long_videos_title") : t("shorts_title")}
        </h2>

        <div
          className={`grid gap-8 ${
            type === "long"
              ? "md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {videos.map((video) => {
            const videoId = extractVideoId(video.youtube_url);
            const title = language === "en" ? video.title_en : video.title_pt;

            return (
              <div
                key={video.id}
                className="group relative bg-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`relative ${
                    type === "long" ? "aspect-video" : "aspect-[9/16]"
                  } bg-gray-200`}
                >
                  {videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={title || "Video"}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Invalid URL
                    </div>
                  )}
                </div>
                {title && (
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {title}
                    </h3>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
