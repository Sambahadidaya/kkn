// Helper Parser dan Embed URL YouTube Aman

export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;

  // Pola regex standar YouTube: watch?v=, youtu.be/, shorts/, embed/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}
