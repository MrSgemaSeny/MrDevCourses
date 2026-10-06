import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Download,
  Video,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'ui' | 'brand' | 'promo';
  categoryLabel: string;
  description: string;
  src: string;
  badge: string;
  resolution: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'hero-preview',
    title: 'Главная страница и видео-курс Вайбкодинг',
    category: 'ui',
    categoryLabel: 'Интерфейс',
    description: 'Скриншот платформы: практическая разработка промышленных систем, каталог курсов и интерактивный курс по вайбкодингу (уроки 1-25).',
    src: `${import.meta.env.BASE_URL}gallery/hero-preview.png`,
    badge: 'Web UI / Скриншот',
    resolution: '1920 × 890',
  },
  {
    id: 'how-to-enter-it-horizontal',
    title: 'Как войти в IT-индустрию с нуля (YouTube)',
    category: 'promo',
    categoryLabel: 'Промо и медиа',
    description: 'Официальная промо-обложка YouTube-выпуска блога Mr Developer: «Как войти в IT-индустрию с нуля? Это проще, чем ты думаешь» с маскотом и кодом.',
    src: `${import.meta.env.BASE_URL}gallery/how-to-enter-it-horizontal.jpg`,
    badge: 'YouTube Cover / 16:9',
    resolution: '1280 × 720',
  },
  {
    id: 'how-to-enter-it-vertical',
    title: 'Как войти в IT-индустрию с нуля (Reels & Stories)',
    category: 'promo',
    categoryLabel: 'Промо и медиа',
    description: 'Вертикальный постер блога Mr Developer для Instagram Reels, Shorts и Stories: «Реальный путь в IT с нуля» с маскотом и архитектурой проекта.',
    src: `${import.meta.env.BASE_URL}gallery/how-to-enter-it-vertical.png`,
    badge: 'Reels & Stories / 9:16',
    resolution: '1080 × 1920',
  },
  {
    id: 'author-avatar',
    title: 'Фирменный стиль и маскот Mr Developer',
    category: 'brand',
    categoryLabel: 'Бренд и арт',
    description: 'Официальный маскот и визуальный стиль бренда Mr Developer Вайбкодинг в эстетике темного интерфейса.',
    src: `${import.meta.env.BASE_URL}author-avatar.png`,
    badge: 'Mascot / Brand',
    resolution: '1024 × 1024',
  },
];

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ui' | 'brand' | 'promo'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Handle keyboard navigation for modal lightbox
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredItems.findIndex((it) => it.id === selectedItem.id);
        if (currentIndex !== -1 && currentIndex < filteredItems.length - 1) {
          setSelectedItem(filteredItems[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredItems.findIndex((it) => it.id === selectedItem.id);
        if (currentIndex > 0) {
          setSelectedItem(filteredItems[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, filteredItems]);

  const currentIndex = selectedItem
    ? filteredItems.findIndex((it) => it.id === selectedItem.id)
    : -1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setSelectedItem(filteredItems[currentIndex - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== -1 && currentIndex < filteredItems.length - 1) {
      setSelectedItem(filteredItems[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 75% Main Column aligned to left */}
      <div className="w-full lg:w-[75%] max-w-[1080px] space-y-8">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-sm bg-[#0e0e11] border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-wider font-bold">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Медиатека платформы</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Галерея
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Визуальные материалы, скриншоты интерфейса и дизайн-артефакты образовательной платформы MrDevCourses.
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
              }`}
            >
              Все материалы ({GALLERY_ITEMS.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('ui')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'ui'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Интерфейс</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('brand')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'brand'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Бренд и арт</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('promo')}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'promo'
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-zinc-400" />
              <span>Промо и медиа</span>
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-mono hidden sm:block">
            {filteredItems.length} {filteredItems.length === 1 ? 'объект' : 'объекта'}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-sm bg-[#0e0e11] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              {/* Image Container with Preview Hover */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedItem(item);
                  }
                }}
                className="relative aspect-video bg-[#050507] overflow-hidden cursor-pointer border-b border-white/5 flex items-center justify-center"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="px-3 py-1.5 rounded bg-black/80 border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Увеличить</span>
                  </div>
                </div>

                {/* Resolution Pill */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 border border-white/10 text-zinc-400 backdrop-blur-sm">
                  {item.resolution}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.categoryLabel}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="px-3 py-1.5 rounded-sm bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Просмотр</span>
                  </button>

                  <a
                    href={item.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Открыть оригинал в новой вкладке"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal Viewer */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#0e0e11] border border-white/10 rounded-sm overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 bg-[#0a0a0c] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-zinc-300 shrink-0">
                  {selectedItem.badge}
                </span>
                <h3 className="text-sm font-semibold text-white truncate">
                  {selectedItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedItem.src}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Скачать изображение"
                >
                  <Download className="w-4 h-4" />
                </a>
                <a
                  href={selectedItem.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Открыть в новой вкладке"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Закрыть окно"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[460px] bg-[#050507] flex items-center justify-center p-4 overflow-hidden">
              <img
                src={selectedItem.src}
                alt={selectedItem.title}
                className="max-h-[70vh] max-w-full object-contain rounded-sm"
              />

              {/* Prev Button */}
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black border border-white/15 text-white transition-colors cursor-pointer"
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {currentIndex < filteredItems.length - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black border border-white/15 text-white transition-colors cursor-pointer"
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Footer Description */}
            <div className="p-4 bg-[#0a0a0c] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
              <p className="max-w-2xl leading-relaxed">
                {selectedItem.description}
              </p>
              <div className="font-mono text-[11px] text-zinc-500 shrink-0">
                Разрешение: {selectedItem.resolution}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
