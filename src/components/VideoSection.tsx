import { useEffect, useState } from "react";
import { supabase, LongVideo, Short } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { Play } from "lucide-react";
import VideoPlayerModal from "./VideoPlayerModal";

interface VideoSectionProps {
  type: "long" | "short";
}

export default function VideoSection({ type }: VideoSectionProps) {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<(LongVideo | Short)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

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

  if (loading || videos.length === 0) return null;

  return (
    <>
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
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideoUrl(video.youtube_url)}
                className="group relative bg-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div
                  className={`relative ${
                    type === "long" ? "aspect-video" : "aspect-[9/16]"
                  } bg-gray-900`}
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt="Video thumbnail"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-70"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      Thumbnail indisponível
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-emerald-500/80 rounded-full p-4 shadow-lg">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <VideoPlayerModal
        isOpen={!!selectedVideoUrl}
        onClose={() => setSelectedVideoUrl(null)}
        videoUrl={selectedVideoUrl || ""}
      />
    </>
  );
}
