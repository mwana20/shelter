import React from 'react';
import { ShieldCheck, FileText, ArrowLeft, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';

export const TermsOfServicePage: React.FC = () => {
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
            Legal & Regulatory Agreement
          </span>
          <h1 className="text-3xl font-bold text-neutral-900 font-serif-display">
            Terms of Service
          </h1>
          <p className="text-xs text-neutral-500">
            Last Updated: March 2026 · Sheltered Global Marketplace Ltd · Registered in Uganda ({SHELTERED_COMPANY_CONFIG.registrationNumber})
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">1. Acceptance of Terms & Jurisdiction</h2>
            <p>
              By accessing or utilizing the Sheltered marketplace platform (&quot;Sheltered&quot;, &quot;we&quot;, &quot;our&quot;), whether as a visitor, property buyer, tenant, landlord, or licensed broker, you agree to be bound by these Terms of Service. Sheltered is headquartered in Mbale City, Uganda ({SHELTERED_COMPANY_CONFIG.hqAddress}). Real estate transactions and property conveyancing conducted through this platform are subject to the property registration laws of the country in which the property is physically situated.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">2. Accuracy of Property Information & Title Deeds</h2>
            <p>
              All property sellers, brokers, and landlords posting houses, land parcels, commercial premises, or agricultural estates represent and warrant that all uploaded images, dimensions, coordinates, and title deed representations (Freehold, Mailo, Leasehold, Certificate of Title) are authentic and legally held. Misrepresenting property boundaries or encumbrances constitutes grounds for immediate delisting and legal notification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">3. Multi-Currency Display & Indicative Exchange Rates</h2>
            <p>
              Prices shown in alternative currencies are calculated against indicative benchmark exchange rates for convenience. Official final purchase agreements, earnest money deposits, and escrow transfers shall be settled in the currency agreed upon in the definitive sale contract or lease agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">4. Physical Inspection & Legal Conveyancing</h2>
            <p>
              Sheltered encourages all prospective buyers and diaspora purchasers to conduct independent physical surveys, boundary opening verifications, and official searches with the respective national or zonal land registry before exchanging final consideration.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-neutral-900">5. Contact Information</h2>
            <p>
              For legal inquiries, official service of notice, or compliance verifications, contact Sheltered Global Headquarters at {SHELTERED_COMPANY_CONFIG.officialEmail} or write to: Sheltered Real Estate Marketplace Ltd, Plot 14-16 Republic Street, Central Business District, Mbale City, Uganda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
