import { X } from "lucide-react";
import { extractVideoId } from "../lib/youtubeUtils";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
}: VideoPlayerModalProps) {
  if (!isOpen) return null;

  const videoId = extractVideoId(videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-black max-w-4xl w-full aspect-video rounded-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no vídeo feche o modal
      >
        <button
          onClick={onClose}
          className="absolute -top-10 -right-10 z-10 text-white hover:text-gray-300 transition-all"
        >
          <X className="w-8 h-8" />
        </button>
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Video Player"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            URL do vídeo inválida.
          </div>
        )}
      </div>
    </div>
  );
}
