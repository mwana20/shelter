import React from 'react';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';

export const PrivacyPolicyPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-neutral-200/90 shadow-xs">
        <button
          type="button"
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="space-y-2 border-b border-neutral-100 pb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Data Protection & Confidentiality
          </span>
          <h1 className="text-3xl font-bold text-neutral-900 font-serif-display">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500">
            Effective: March 2026 · Sheltered Global Marketplace Ltd · Headquarters: Mbale City, Uganda
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">1. Data Controller & Collection Scope</h2>
            <p>
              Sheltered Global Marketplace operates in accordance with internationally recognized data protection principles and the Uganda Data Protection and Privacy Act. We collect information provided voluntarily by users, including names, contact numbers, email addresses, and verified identity documents required for title verification and broker authentication.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">2. Use of Inquiries & Buyer Communication</h2>
            <p>
              When a prospective buyer or tenant submits an inquiry regarding a listed villa, home, or plot, their contact details are shared exclusively with the verified listing agent or owner for the sole purpose of facilitating the property transaction or tour. We never sell user data to third-party telemarketers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">3. Local Preference Storage & Cookies</h2>
            <p>
              Sheltered persists your selected browsing language (e.g. English, French, Spanish, Portuguese, Arabic, German, Chinese, Swahili) and preferred display currency (UGX, USD, GBP, EUR, KES, TZS, ZAR) locally in your browser storage to provide a personalized browsing experience.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">4. Data Subject Rights & Inquiries</h2>
            <p>
              Users may request access to, correction of, or deletion of their account credentials and listed property records at any time by contacting our data protection officer at {SHELTERED_COMPANY_CONFIG.supportEmail} or via our registered headquarters in Mbale City, Uganda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
