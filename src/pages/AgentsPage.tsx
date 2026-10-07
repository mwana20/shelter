import React from 'react';
import { ShieldCheck, Phone, MessageSquare, Mail, Award, ArrowRight } from 'lucide-react';
import { mockAgents } from '../data/mockAgents';
import { useApp } from '../context/AppContext';
import { getWhatsAppLink, getTelLink } from '../utils/format';

export const AgentsPage: React.FC = () => {
  const { applyQuickSearch } = useApp();

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Award className="w-4 h-4" />
            <span>Accredited Mukono Realtors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            Verified Property Agents & Consultants
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Work with accredited, local real-estate professionals who understand Mukono land registry, zoning ordinances, and fair property valuations.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockAgents.map((agent) => {
            const whatsappUrl = getWhatsAppLink(agent.whatsapp);
            const telUrl = getTelLink(agent.phone);

            return (
              <div
                key={agent.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-lg transition"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-neutral-900">{agent.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-xs text-neutral-500 font-medium">{agent.company}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                        Specialty: {agent.areaSpecialty}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                    {agent.bio}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs py-3 border-y border-neutral-100">
                    <div>
                      <span className="font-extrabold text-neutral-900 text-sm">{agent.experienceYears} Years</span>
                      <p className="text-[10px] text-neutral-400">Experience</p>
                    </div>
                    <div>
                      <span className="font-extrabold text-neutral-900 text-sm">{agent.activeListingsCount}</span>
                      <p className="text-[10px] text-neutral-400">Active Listings</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={telUrl}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Direct</span>
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      applyQuickSearch({ area: agent.areaSpecialty.split('&')[0].trim() });
                    }}
                    className="w-full text-xs font-bold text-neutral-800 hover:text-emerald-700 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition flex items-center justify-center gap-1.5"
                  >
                    <span>View {agent.name.split(' ')[0]}'s Listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
