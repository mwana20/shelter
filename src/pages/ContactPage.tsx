import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
    showNotification('Thank you. Your message has been received by our Mukono office.', 'success');
  };

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span>Customer Care & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            Contact Sheltered Mukono
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto">
            Have questions about listing your home, scheduling an inspection, or verifying a property deed? Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details (5 cols) */}
          <div className="md:col-span-5 bg-slate-950 text-white rounded-3xl p-8 space-y-8 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif-display text-white">Our Mukono Office</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Visit us in person for assisted property consultations and physical title checks.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Physical Location:</strong>
                    <p className="text-slate-400">Bishop Tucker Road, Near UCU Main Campus, Mukono Municipality, Uganda</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Direct Phone Lines:</strong>
                    <p className="text-slate-400">+256 701 442 890 (Mukono Central)</p>
                    <p className="text-slate-400">+256 772 889 123 (Seeta & Sonde)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">WhatsApp Desk:</strong>
                    <p className="text-slate-400">+256 701 442 890 (Instant Support)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Official Email:</strong>
                    <p className="text-slate-400">support@sheltered.co.ug</p>
                    <p className="text-slate-400">listings@sheltered.co.ug</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
              <p>Operating Hours: Monday – Saturday, 8:00 AM – 6:00 PM (EAT)</p>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs">
            {submitted ? (
              <div className="py-16 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-neutral-900">Message Delivered</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  A Sheltered representative in Mukono will review your message and reach out within 2 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-slate-900 underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-900">Send an Online Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phillip Mwanaweika"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+256 7XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Inquiry Topic</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    >
                      <option value="Property Inquiries">Inquiring About a Specific Home</option>
                      <option value="List a Property">Advertising My House/Plot</option>
                      <option value="Title Verification">Land Title Verification Help</option>
                      <option value="Agent Partnership">Agent / Broker Registration</option>
                      <option value="General Support">General Platform Inquiries</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about the property, your preferred location in Mukono, or your question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
