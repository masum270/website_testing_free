export interface VideoLesson {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  youtubeUrl: string;
  duration?: string;
  instructor?: string;
  thumbnailUrl?: string;
}

export function getEmbedUrl(youtubeUrl: string): string {
  if (!youtubeUrl) return '';
  if (youtubeUrl.includes('embed/')) return youtubeUrl;
  
  let videoId = '';
  if (youtubeUrl.includes('v=')) {
    videoId = youtubeUrl.split('v=')[1]?.split('&')[0] || '';
  } else if (youtubeUrl.includes('youtu.be/')) {
    videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : youtubeUrl;
}
