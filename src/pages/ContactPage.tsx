import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SHELTERED_COMPANY_CONFIG } from '../config/company';

export const ContactPage: React.FC = () => {
  const { showNotification } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Property Inquiries');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showNotification('Thank you. Your message has been received by our global headquarters advisory team.', 'success');
  };

  return (
    <div className="bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Real Estate Advisory & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            Contact Sheltered Global
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto">
            Have questions about listing international property, diaspora land verification, or scheduling inspection tours? Our headquarters advisory team in Mbale, Uganda is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details (5 cols) */}
          <div className="md:col-span-5 bg-slate-950 text-white rounded-3xl p-8 space-y-8 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif-display text-white">Global Headquarters</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Plot 14-16 Republic Street, Central Business District, Mbale City, Uganda
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Corporate Location:</strong>
                    <p className="text-slate-400">{SHELTERED_COMPANY_CONFIG.hqAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Direct Phone Lines:</strong>
                    <p className="text-slate-400">{SHELTERED_COMPANY_CONFIG.primaryPhone} (Headquarters)</p>
                    <p className="text-slate-400">{SHELTERED_COMPANY_CONFIG.secondaryPhone} (International Relay)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Official Correspondence:</strong>
                    <p className="text-slate-400">{SHELTERED_COMPANY_CONFIG.officialEmail}</p>
                    <p className="text-slate-400">{SHELTERED_COMPANY_CONFIG.supportEmail}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://wa.me/256701884902?text=Hello%20Sheltered%2C%20I%20am%20interested%20in%20property%20listings%20and%20advisory."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <span>Instant WhatsApp Chat (+256 701 884 902)</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-white block">Advisory Hours (EAT / UTC+3):</span>
              <p>Monday – Friday: 8:00 AM – 6:30 PM</p>
              <p>Saturday: 9:00 AM – 4:00 PM</p>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Message Dispatched</h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Sheltered Global Marketplace. An advisory consultant from our Mbale headquarters team will respond within 24 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Send an Advisory Inquiry</h3>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wasswa Emmanuel"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+256 701 000 000"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs bg-white"
                  >
                    <option value="Property Inquiries">Property Inquiries & Purchase</option>
                    <option value="Listing Verification">List Property & Verification Support</option>
                    <option value="Broker Registration">Agent & Broker Registration</option>
                    <option value="Diaspora Advisory">Diaspora Title & Land Due Diligence</option>
                    <option value="Commercial Development">Commercial & Agricultural Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the property or location you are inquiring about..."
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Advisory Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
