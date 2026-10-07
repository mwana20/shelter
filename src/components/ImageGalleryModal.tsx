import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ImageGalleryModal: React.FC = () => {
  const { galleryModalData, setGalleryModalData } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (galleryModalData) {
      setCurrentIndex(galleryModalData.initialIndex || 0);
    }
  }, [galleryModalData]);

  if (!galleryModalData) return null;

  const images = galleryModalData.images || [];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in"
      onClick={() => setGalleryModalData(null)}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wider text-neutral-300">
            Photo {currentIndex + 1} of {images.length}
          </span>
        </div>
        <button
          onClick={() => setGalleryModalData(null)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center py-4 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`Property image ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition backdrop-blur-sm shadow-lg"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition backdrop-blur-sm shadow-lg"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10 max-w-4xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-14 w-20 rounded-md overflow-hidden shrink-0 border-2 transition ${
                idx === currentIndex ? 'border-emerald-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
