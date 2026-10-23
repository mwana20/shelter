import React from 'react';
import {
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';

export const Footer: React.FC = () => {
  const { setCurrentPage, t } = useApp();

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 text-xs border-t border-slate-800">
      {/* Top Banner: Global HQ Presence */}
      <div className="border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8 bg-slate-900/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-lg font-serif-display shrink-0">
              S
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-wide">
                {t('brand_name')} {t('brand_tagline')}
              </div>
              <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('hq_banner_title')} · {SHELTERED_COMPANY_CONFIG.hqAddress}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="text-slate-200 font-semibold">{t('hq_banner_sub')}</span>
            <span>·</span>
            <span>{SHELTERED_COMPANY_CONFIG.primaryPhone}</span>
            <span>·</span>
            <span>{SHELTERED_COMPANY_CONFIG.officialEmail}</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Column 1: Buy & Invest */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer_buy_invest')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('buy')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_house')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('buy')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_villa')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('buy')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_apartment')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('search')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_land')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('search')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_farm')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Rent & Commercial */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer_rent_commercial')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('rent')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_apartment')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('rent')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_holiday')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('search')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_commercial')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('search')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('cat_industrial')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Global Destinations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer_destinations')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('areas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Mbale City (Global HQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('areas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Kampala Capital City
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('areas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Nairobi Metropolis, Kenya
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('areas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Dubai Marina & Palm, UAE
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('areas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  London & Kensington, UK
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('areas')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Miami & Florida, USA
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Marketplace & Sellers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer_marketplace')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('sign-in')}
                  className="hover:text-white transition text-emerald-400 font-semibold cursor-pointer"
                >
                  {t('nav_list_property')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('sign-in')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('nav_dashboard')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('agents')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('brokers_title')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('saved')}
                  className="hover:text-white transition cursor-pointer"
                >
                  {t('nav_saved')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('about')}
                  className="hover:text-white transition cursor-pointer"
                >
                  About Sheltered
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Global HQ Office */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer_hq_office')}
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <p className="leading-relaxed">
                {t('footer_hq_address')}
              </p>
              <p>{t('footer_hours')}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                >
                  {t('footer_contact_hq')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Official Online Platforms & Global Channels */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Connect Across Online Platforms
              </span>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Join our verified international property channels, watch video tours, and chat directly with our team.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* WhatsApp Quick Chat */}
              <a
                href="https://wa.me/256701884902?text=Hello%20Sheltered%2C%20I%20am%20interested%20in%20property%20listings."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-semibold transition hover:scale-102"
                title="Chat on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.97.57 3.81 1.56 5.37L2.1 22.06l4.82-1.42c1.48.88 3.2 1.39 5.111 1.39 5.536 0 10.031-4.495 10.031-10.031S17.567 2 12.031 2zm5.79 14.39c-.24.68-1.39 1.3-1.95 1.39-.5.08-1.13.11-1.82-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.77-.36.2 0 .39.01.55.02.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.51-.1.19-.15.31-.29.47-.14.17-.3.38-.43.51-.14.14-.3.3-.13.59.17.29.75 1.24 1.61 2 1.1.99 2.04 1.29 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.27.1 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="Connect on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.5 1.5 0 0 0 0-3 1.5 1.5 0 0 0 0 3m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="Follow on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="Watch on YouTube"
              >
                <svg className="w-3.5 h-3.5 fill-current text-rose-500" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="Follow on Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current text-pink-400" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="Follow on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current text-blue-400" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition"
                title="Join Telegram Channel"
              >
                <svg className="w-3.5 h-3.5 fill-current text-sky-400" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                </svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {t('footer_rights')}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo('terms')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              {t('terms_of_service')}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => navigateTo('privacy')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              {t('privacy_policy')}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              {t('legal_compliance')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
