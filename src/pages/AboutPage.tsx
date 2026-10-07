import React from 'react';
import { ShieldCheck, MapPin, CheckCircle2, Award, FileText, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <span>About Sheltered Uganda</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 font-serif-display">
            Find a place to call home.
          </h1>
          <p className="text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Sheltered is the premier property marketplace engineered specifically for <strong>Mukono, Uganda</strong>. Built to provide the technological speed and visual clarity of world-class real-estate platforms, grounded in local Ugandan land reality.
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-xl">
          <h2 className="text-2xl font-bold font-serif-display text-emerald-400">
            Our Purpose in Mukono
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Mukono has rapidly grown into Uganda’s most dynamic residential hub, linking the capital Kampala with the industrial energy of Jinja. Thousands of families, university scholars, corporate executives, and diaspora investors relocate to Seeta, Sonde, Goma, and Mukono Municipality every year.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Yet traditional property hunting has been riddled with unverified middlemen, hidden fees, duplicate listings, and land title uncertainty. Sheltered changes this by setting an unwavering standard: <strong>Every property must be physically inspectable, accurately photographed, and backed by authentic title credentials.</strong>
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Title Deed Due Diligence</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We guide buyers through official title searches at the Ministry Zonal Land Office in Mukono. Whether dealing with Mailo land or Freehold plots, transparency comes first.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Zero Upfront Inspection Fees</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We eliminate predatory viewing fees. Buyers and tenants inspect properties in person accompanied by licensed property consultants at no charge before deciding.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Hyper-Local Mukono Knowledge</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              From water pipeline proximity to Northern Bypass commute times, our agents live and work directly in Seeta, Sonde, Kyetume, and Mukono Central.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Accredited Brokers Only</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We do not fabricate agent credentials. Every broker operating on Sheltered has registered business credentials and a verified physical office address in Uganda.
            </p>
          </div>
        </div>

        {/* Safety Guide for Land Buyers in Uganda */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
            <FileText className="w-5 h-5 text-amber-700" />
            <span>Buyer's Checklist for Buying Land or Houses in Mukono</span>
          </div>
          <ul className="text-xs text-amber-900/90 space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              <strong>Physical Site Visit:</strong> Never buy land based only on photos or video clips. Inspect the ground, terrain, access road, and boundaries.
            </li>
            <li>
              <strong>Search at Mukono Zonal Land Office:</strong> Confirm that the seller’s name corresponds exactly with the white page at the MZO registry and that there are no mortgages or caveats.
            </li>
            <li>
              <strong>Boundary Opening by Registered Surveyor:</strong> Hire an independent registered surveyor to confirm deed coordinates against ground beacons.
            </li>
            <li>
              <strong>LC1 Chairperson & Neighbors Check:</strong> Consult local village leadership (LC1) to ensure the seller is known and there are no family disputes.
            </li>
          </ul>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentPage('search')}
            className="bg-slate-950 text-white font-bold text-xs py-3.5 px-8 rounded-xl hover:bg-slate-800 transition shadow-md"
          >
            Start Exploring Mukono Homes
          </button>
        </div>
      </div>
    </div>
  );
};
