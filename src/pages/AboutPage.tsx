import React from 'react';
import { ShieldCheck, MapPin, CheckCircle2, Award, FileText, Phone, Globe, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';

export const AboutPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sheltered Global Marketplace · HQ Mbale, Uganda</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 font-serif-display">
            Find Your Place in the World.
          </h1>
          <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Sheltered is a premier international property marketplace connecting property buyers, diaspora investors, landlords, and licensed brokers worldwide, headquartered from <strong>Mbale City, Uganda</strong>.
          </p>
        </div>

        {/* Global Mission Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Global Operations & Headquarters</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-white">
            Connecting Real Estate Markets Worldwide
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Headquartered at {SHELTERED_COMPANY_CONFIG.hqAddress}, Sheltered bridges local East African real estate with high-value international property corridors in the United Arab Emirates, the United Kingdom, the United States, Kenya, South Africa, and Tanzania.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Whether a diaspora professional acquiring titled land in Uganda or Kenya, or an international investor securing a luxury penthouse in Dubai or London, Sheltered provides verified title deed information, high-definition photography, video walkthroughs, and seamless multi-currency support.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Title Deed & Ownership Due Diligence</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We uphold uncompromising title transparency across Freehold, Mailo, Leasehold, and Torrens title registers. Buyers and investors view verified deed documentation before committing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Worldwide Multi-Currency & Language</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Browse listings with real-time currency conversions (UGX, USD, GBP, EUR, KES, TZS, ZAR) and seamless multilingual interfaces with right-to-left layout support for Arabic speakers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Verified Seller & Broker Directory</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Connect directly with verified property owners, licensed real estate agents, and registered corporate brokers without predatory fee structures.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Complete Property Spectrum</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              From family houses and urban condominiums to industrial warehouses, agricultural plantations, commercial retail plazas, and luxury holiday villas.
            </p>
          </div>
        </div>

        {/* Global HQ Office Box */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Corporate Headquarters</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 font-serif-display">
            Mbale City, Uganda Global Headquarters
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Sheltered Real Estate Marketplace Ltd<br />
            {SHELTERED_COMPANY_CONFIG.hqAddress}<br />
            Telephone: {SHELTERED_COMPANY_CONFIG.primaryPhone} · {SHELTERED_COMPANY_CONFIG.secondaryPhone}<br />
            Official Email: {SHELTERED_COMPANY_CONFIG.officialEmail}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setCurrentPage('contact')}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Contact Global Advisory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
