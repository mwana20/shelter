import React from 'react';
import { Home, ShieldCheck, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { companySettings } from '../config/company';
import { mockAreas } from '../data/mockAreas';
import { useTranslation } from '../i18n/translations';

export const Footer: React.FC = () => {
  const t = useTranslation();
  const { setCurrentPage, applyQuickSearch, setFilters } = useApp();
  const featuredLocations = [
    ...mockAreas.filter((location) => location.country === 'Uganda').slice(0, 3),
    ...mockAreas.filter((location) => location.country !== 'Uganda').slice(0, 3)
  ];

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust & Safety Warning Banner */}
        <div className="mb-12 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white text-base font-bold flex items-center gap-2">
                <span>{t('Check every property independently')}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded uppercase">
                  {t('Safety')}
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {t('Visit the property and confirm ownership with the relevant local authority before making a payment. Marketplace listings are not a guarantee of ownership, condition, or transaction outcome.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('about')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shrink-0 transition"
          >
            {t('Read Buyer Safety Guide')}
          </button>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Home className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-white font-serif-display uppercase">
                  {companySettings.name.toUpperCase()}
                </span>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-400">
                  {t('Find a place to call home.')}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('A global property marketplace connecting buyers, sellers, and renters across Uganda and supported markets around the world.')}
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('Headquarters:')} {companySettings.headquarters}</span>
              </div>
              {companySettings.officeAddress && <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{companySettings.officeAddress}</span>
              </div>}
              {companySettings.phoneNumbers.map((phone) => (
                <div className="flex items-center gap-2.5" key={phone}>
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
                </div>
              ))}
              {companySettings.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`mailto:${companySettings.email}`} className="hover:text-white">{companySettings.email}</a>
                </div>
              )}
            </div>
          </div>

          {/* Col: Featured locations */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">
              {t('Featured Locations')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {featuredLocations.map((location) => (
                <li key={`${location.country}:${location.id}`}>
                  <button
                    onClick={() => applyQuickSearch({ country: location.country, area: location.id })}
                    className="hover:text-white transition"
                  >
                    {location.name}, {location.country}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigateTo('areas')}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  {t('View All Locations →')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col: Property Types */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">
              {t('Property Categories')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, propertyType: 'House' }));
                    navigateTo('search');
                  }}
                  className="hover:text-white transition"
                >
                  {t('Standalone Houses')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, propertyType: 'Apartment' }));
                    navigateTo('search');
                  }}
                  className="hover:text-white transition"
                >
                  {t('Modern Apartments')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, propertyType: 'Villa' }));
                    navigateTo('search');
                  }}
                  className="hover:text-white transition"
                >
                  {t('Luxury Hillside Villas')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, propertyType: 'Bungalow' }));
                    navigateTo('search');
                  }}
                  className="hover:text-white transition"
                >
                  {t('Family Bungalows')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, propertyType: 'Land' }));
                    navigateTo('search');
                  }}
                  className="hover:text-white transition"
                >
                  {t('Titled Land & Decimals')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, propertyType: 'Commercial Property' }));
                    navigateTo('search');
                  }}
                  className="hover:text-white transition"
                >
                  {t('Commercial & Retail Plots')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col: Platform Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">
              {t('Quick Links')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => navigateTo('list-property')} className="hover:text-white transition">
                  {t('Advertise Your Property')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('saved')} className="hover:text-white transition">
                  {t('My Saved Homes')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('agents')} className="hover:text-white transition">
                  {t('Agent Directory (Preview)')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('my-sheltered')} className="hover:text-white transition">
                  {t('My Viewing Appointments')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition">
                  {t('About Our Platform')}
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition">
                  {t('Customer Support')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Sheltered. {t('All rights reserved.')} {t('Global property marketplace.')}
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-500" />
              {t('Standard Currency: Listed in local market currency')}
            </span>
            <button onClick={() => navigateTo('terms')} className="hover:text-white">{t('Terms of Service')}</button>
            <button onClick={() => navigateTo('privacy')} className="hover:text-white">{t('Privacy Policy')}</button>
            <button onClick={() => navigateTo('marketplace-policy')} className="hover:text-white">{t('Marketplace Policy')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
