/**
 * Extrai o ID do vídeo de várias URLs do YouTube.
 */
export const extractVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

/**
 * Retorna a URL da thumbnail de alta qualidade (ou padrão)
 * com base no ID do vídeo.
 */
export const getYoutubeThumbnail = (url: string): string => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return ""; // Retorna string vazia se o ID não for encontrado
  }
  // hqdefault.jpg é uma boa qualidade. maxresdefault.jpg pode não existir.
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
