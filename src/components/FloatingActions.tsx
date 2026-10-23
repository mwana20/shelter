import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';

export const FloatingActions: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear immediately upon any scroll past top (> 10px)
      setShowBackToTop(window.scrollY > 10);
    };

    handleScroll(); // Trigger check immediately on mount
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // WhatsApp quick direct chat link
  const cleanPhone = (SHELTERED_COMPANY_CONFIG.primaryPhone || '+256701884902').replace(/[^0-9]/g, '');
  const prefilledMessage = encodeURIComponent(
    'Hello Sheltered Global Real Estate, I am interested in inquiring about property listings and advisory.'
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${prefilledMessage}`;

  return (
    <div className="fixed bottom-6 right-5 sm:right-6 z-40 flex flex-col items-center gap-2.5">
      {/* 1. Back To Top Arrow Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className={`w-11 h-11 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-lg border border-slate-700/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-5 h-5 text-slate-200 group-hover:text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* 2. Fixed WhatsApp Quick Chat Icon */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Sheltered Global HQ"
        title="Chat on WhatsApp with Sheltered Global Support"
        className="relative group flex items-center justify-center w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ring-4 ring-emerald-600/20"
      >
        {/* Pulsing presence indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
        </span>

        {/* WhatsApp Icon */}
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.81 1.56 5.37L2.1 22.06l4.82-1.42c1.48.88 3.2 1.39 5.111 1.39 5.536 0 10.031-4.495 10.031-10.031S17.567 2 12.031 2zm5.79 14.39c-.24.68-1.39 1.3-1.95 1.39-.5.08-1.13.11-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36.2 0 .39.01.55.02.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.51-.1.19-.15.31-.29.47-.14.17-.3.38-.43.51-.14.14-.3.3-.13.59.17.29.75 1.24 1.61 2 1.1.99 2.04 1.29 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.27.1 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
        </svg>

        {/* Hover Tooltip for desktop */}
        <span className="hidden md:group-hover:flex absolute right-16 top-1/2 -translate-y-1/2 items-center bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in duration-150 border border-slate-700 pointer-events-none">
          Quick Chat on WhatsApp
        </span>
      </a>
    </div>
  );
};
