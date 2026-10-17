import React from 'react';
import { ShieldCheck, MapPin, CheckCircle2, Award, FileText, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/translations';

export const AboutPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const t = useTranslation();

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>{t('Global property marketplace')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 font-serif-display">
            {t('Find a place to call home.')}
          </h1>
          <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            {t('Sheltered is building a global property marketplace for people searching across borders, from Uganda to other countries and major metro areas.')}
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <h2 className="text-2xl font-bold font-serif-display text-emerald-400">
            {t('A marketplace built for every country')}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('Our goal is to make property discovery clearer for buyers, tenants, owners, and agents. Property locations are separate from our company headquarters, and available markets will depend on approved listings and configured local services.')}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('Listings shown in this preview are sample data and have not been independently verified. Before making a decision, visit the property, check documents with the appropriate local authorities, and use independent professional advice.')}
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">{t('Independent due diligence')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t("Confirm ownership, boundaries, permitted use, and any restrictions with the appropriate authorities and qualified professionals in the property's jurisdiction.")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">{t('Careful in-person inspections')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t('Inspect a property before committing funds. Confirm any viewing arrangements and fees directly with the listing contact.')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">{t('Location-aware discovery')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t('Administrative areas and local requirements vary by country. Supported listings depend on approved local data and active administrator-managed locations.')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">{t('Verify listing contacts')}</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {t("Check an agent's identity, professional credentials, and authority to represent a property independently. A profile or badge on a website is not proof of ownership.")}
            </p>
          </div>
        </div>

        {/* Safety Guide for Land Buyers in Uganda */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <FileText className="w-5 h-5 text-amber-700" />
            <span>{t("Buyer's Checklist for Buying Land or Houses Safely")}</span>
          </div>
          <ul className="text-xs text-amber-900/90 space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>{t('Physical Site Visit:')}</strong> {t('Never buy land based only on photos or video clips. Inspect the ground, terrain, access road, and boundaries.')}
            </li>
            <li>
              <strong>{t('Search the official land registry:')}</strong> {t('Confirm that the seller’s name matches the official records and that there are no mortgages, caveats, or restrictions.')}
            </li>
            <li>
              <strong>{t('Boundary Opening by Registered Surveyor:')}</strong> {t('Hire an independent registered surveyor to confirm deed coordinates against ground beacons.')}
            </li>
            <li>
              <strong>{t('LC1 Chairperson & Neighbors Check:')}</strong> {t('Consult local village leadership (LC1) to ensure the seller is known and there are no family disputes.')}
            </li>
          </ul>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentPage('search')}
            className="bg-slate-950 text-white font-bold text-xs py-3.5 px-8 rounded-xl hover:bg-slate-800 transition shadow-md"
          >
            {t('Start Exploring Global Homes')}
          </button>
        </div>
      </div>
    </div>
  );
};
