import React, { useMemo } from 'react';
import { Video, AlertCircle, CheckCircle2 } from 'lucide-react';

interface YouTubeValidatorProps {
  url: string;
  onChange: (url: string) => void;
}

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;
  const match = url.trim().match(regExp);
  return match ? match[1] : null;
}

export const YouTubeValidator: React.FC<YouTubeValidatorProps> = ({ url, onChange }) => {
  const videoId = useMemo(() => extractYouTubeId(url), [url]);
  const isValid = Boolean(videoId);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">
          YouTube Video URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 font-mono pr-8"
          />
          <div className="absolute right-2.5 top-2.5">
            {url.trim().length > 0 && (
              isValid ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <AlertCircle className="w-4 h-4 text-zinc-400" />
              )
            )}
          </div>
        </div>
      </div>

      {url.trim().length > 0 && !isValid && (
        <div className="p-2.5 rounded-sm bg-zinc-900 border border-white/20 text-zinc-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-zinc-400" />
          <span>Укажите корректный URL видео YouTube (youtube.com/watch?v=ID или youtu.be/ID).</span>
        </div>
      )}

      {isValid && videoId && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-zinc-300" />
              Предпросмотр видео (ID: {videoId})
            </span>
          </div>
          <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black border border-white/10">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
};
