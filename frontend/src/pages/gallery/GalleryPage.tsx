import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  ExternalLink,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Film,
  Smile,
  Layers,
  Sparkles,
  Play,
} from 'lucide-react';
import {
  GALLERY_ITEMS,
  GALLERY_FOLDERS,
  GalleryItem,
} from './galleryData';

export const GalleryPage: React.FC = () => {
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Filter items based on active folder and search query
  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item) => {
      // Folder filter
      if (activeFolderId === 'full_folder') {
        if (!item.isFromFull) return false;
      } else if (activeFolderId !== 'all') {
        if (item.folderId !== activeFolderId) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesFile = item.fileName.toLowerCase().includes(q);
        const matchesFolder = item.folderName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesFile && !matchesFolder) return false;
      }

      return true;
    });
  }, [activeFolderId, searchQuery]);

  const [visibleCount, setVisibleCount] = useState<number>(32);

  // Reset pagination when folder or search changes
  useEffect(() => {
    setVisibleCount(32);
  }, [activeFolderId, searchQuery]);

  const activeFolder = useMemo(() => {
    return GALLERY_FOLDERS.find((f) => f.id === activeFolderId) || GALLERY_FOLDERS[0];
  }, [activeFolderId]);

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  // Keyboard navigation for Lightbox
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

  const getFolderIcon = (folderId: string) => {
    switch (folderId) {
      case 'stickers':
        return <Smile className="w-3.5 h-3.5" />;
      case 'youtube':
        return <Film className="w-3.5 h-3.5" />;
      case 'animations':
        return <Play className="w-3.5 h-3.5" />;
      case 'poses':
        return <Layers className="w-3.5 h-3.5" />;
      case 'artworks':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Folder className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="w-full lg:w-[85%] max-w-[1200px] space-y-8">
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
              Архив визуальных материалов, стикерпак MrDev, арт-концепты Ryo, YouTube-обложки и анимации.
            </p>
          </div>
        </div>

        {/* Folder Explorer Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
              <FolderOpen className="w-4 h-4 text-zinc-300" />
              <span>Папки и альбомы</span>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {GALLERY_FOLDERS.length} разделов
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {GALLERY_FOLDERS.map((folder) => {
              const isActive = activeFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => {
                    setActiveFolderId(folder.id);
                  }}
                  className={`px-3 py-1.5 rounded-sm text-xs font-medium font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white bg-[#0e0e11] border border-white/5'
                  }`}
                >
                  {getFolderIcon(folder.id)}
                  <span>{folder.name}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-black/10 text-black' : 'bg-white/5 text-zinc-500'
                    }`}
                  >
                    {folder.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Folder Info & Search Bar */}
        <div className="p-4 rounded-sm bg-[#0e0e11] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                Папка
              </span>
              <h2 className="text-sm font-bold text-white">
                {activeFolder.name}
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              {activeFolder.description}
            </p>
          </div>

          {/* Search inside folder */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск по файлам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141418] border border-white/10 rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                aria-label="Очистить поиск"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono pb-2 border-b border-white/5">
          <span>
            Показано: {filteredItems.length} {filteredItems.length === 1 ? 'файл' : 'файлов'}
          </span>
          {activeFolderId !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveFolderId('all')}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Сбросить фильтр папки
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-sm bg-[#0e0e11] border border-white/5 space-y-3">
            <Folder className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">В этой папке ничего не найдено</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Попробуйте изменить поисковый запрос или переключиться на другую папку.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {visibleItems.map((item) => {
                const fullSrc = `${import.meta.env.BASE_URL}${item.src}`;

                return (
                  <div
                    key={item.id}
                    className="rounded-sm bg-[#0e0e11] border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    {/* Media Viewport */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedItem(item);
                        }
                      }}
                      className="relative aspect-square bg-[#050507] overflow-hidden cursor-pointer border-b border-white/5 flex items-center justify-center"
                    >
                      {item.fileType === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-black">
                          <video
                            src={fullSrc}
                            muted
                            playsInline
                            className="w-full h-full object-contain pointer-events-none"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                              <Play className="w-4 h-4 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={fullSrc}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        <div className="px-2.5 py-1 rounded bg-black/80 border border-white/20 text-white text-[11px] font-medium flex items-center gap-1 shadow-lg backdrop-blur-sm">
                          <Maximize2 className="w-3 h-3" />
                          <span>Открыть</span>
                        </div>
                      </div>

                      {/* Badge */}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 border border-white/10 text-zinc-400 backdrop-blur-sm">
                        {item.badge}
                      </div>
                    </div>

                    {/* Card Title & Meta */}
                    <div className="p-3 space-y-1.5 flex flex-col justify-between flex-1">
                      <div>
                        <h3
                          className="text-xs font-semibold text-white truncate group-hover:text-zinc-200 transition-colors"
                          title={item.title}
                        >
                          {item.title}
                        </h3>
                        <p className="text-[10px] font-mono text-zinc-500 truncate">
                          {item.folderName}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="text-[10px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>Просмотр</span>
                        </button>

                        <a
                          href={fullSrc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          title="Открыть оригинал"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredItems.length && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 32)}
                  className="px-5 py-2 rounded-sm bg-[#141418] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Показать еще (осталось {filteredItems.length - visibleCount})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {selectedItem.title}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">
                    {selectedItem.fileName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`${import.meta.env.BASE_URL}${selectedItem.src}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Скачать файл"
                >
                  <Download className="w-4 h-4" />
                </a>
                <a
                  href={`${import.meta.env.BASE_URL}${selectedItem.src}`}
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

            {/* Modal Viewport */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[480px] bg-[#050507] flex items-center justify-center p-4 overflow-hidden">
              {selectedItem.fileType === 'video' ? (
                <video
                  src={`${import.meta.env.BASE_URL}${selectedItem.src}`}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="max-h-[72vh] max-w-full rounded-sm"
                />
              ) : (
                <img
                  src={`${import.meta.env.BASE_URL}${selectedItem.src}`}
                  alt={selectedItem.title}
                  className="max-h-[72vh] max-w-full object-contain rounded-sm"
                />
              )}

              {/* Prev Button */}
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black border border-white/15 text-white transition-colors cursor-pointer"
                  aria-label="Предыдущий файл"
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
                  aria-label="Следующий файл"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#0a0a0c] border-t border-white/10 flex items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
              <span className="text-[11px] text-zinc-500">
                Папка: {selectedItem.folderName}
              </span>
              <span className="text-[11px] text-zinc-500">
                {currentIndex + 1} из {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
