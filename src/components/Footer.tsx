import React from 'react';
import { Home, ShieldCheck, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentPage, applyQuickSearch, setFilters } = useApp();

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
                <span>Safe Property Transactions in Mukono</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded uppercase">
                  Buyer Protection
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Always conduct a physical site inspection and verify the Private Mailo or Freehold title deed at the <strong>Mukono Ministry Zonal Land Office (MZO)</strong> before issuing any commitment fee or purchase deposit. Sheltered verified listings have gone through independent ownership check.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('about')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shrink-0 transition"
          >
            Read Buyer Safety Guide
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
                  SHELTERED
                </span>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-emerald-400">
                  Find a place to call home.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier digital real-estate marketplace dedicated specifically to Mukono, Uganda. Connecting verified property owners, brokers, buyers, and tenants across Seeta, Sonde, Mukono Central, and the Lake Victoria corridor.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bishop Tucker Road, Mukono Municipality, Uganda</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+256 701 442 890 / +256 772 889 123</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>listings@sheltered.co.ug</span>
              </div>
            </div>
          </div>

          {/* Col: Explore Mukono Areas */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">
              Mukono Localities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    applyQuickSearch({ area: 'Seeta' });
                  }}
                  className="hover:text-white transition"
                >
                  Seeta Residential Homes
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    applyQuickSearch({ area: 'Sonde' });
                  }}
                  className="hover:text-white transition"
                >
                  Sonde Executive Estates
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    applyQuickSearch({ area: 'Mukono Municipality' });
                  }}
                  className="hover:text-white transition"
                >
                  Mukono Town & Central
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    applyQuickSearch({ area: 'Namugongo' });
                  }}
                  className="hover:text-white transition"
                >
                  Namugongo - Mukono Border
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    applyQuickSearch({ area: 'Kyetume' });
                  }}
                  className="hover:text-white transition"
                >
                  Kyetume Plots & Bungalows
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    applyQuickSearch({ area: 'Katosi' });
                  }}
                  className="hover:text-white transition"
                >
                  Katosi Lakefront Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('areas')}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  View All Mukono Areas →
                </button>
              </li>
            </ul>
          </div>

          {/* Col: Property Types */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">
              Property Categories
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
                  Standalone Houses
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
                  Modern Apartments
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
                  Luxury Hillside Villas
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
                  Family Bungalows
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
                  Titled Land & Decimals
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
                  Commercial & Retail Plots
                </button>
              </li>
            </ul>
          </div>

          {/* Col: Platform Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 text-emerald-400">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => navigateTo('list-property')} className="hover:text-white transition">
                  Advertise Your Property
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('saved')} className="hover:text-white transition">
                  My Saved Homes
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('agents')} className="hover:text-white transition">
                  Verified Mukono Agents
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('my-sheltered')} className="hover:text-white transition">
                  My Viewing Appointments
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="text-amber-400 hover:text-amber-300 transition font-semibold">
                  Administrator Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-white transition">
                  About Our Platform
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-white transition">
                  Customer Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Sheltered Uganda. All rights reserved. Mukono District Real Estate Exchange.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-500" />
              Standard Currency: Uganda Shillings (UGX)
            </span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
