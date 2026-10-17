import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { companySettings } from '../config/company';
import { getTelLink, getWhatsAppLink } from '../utils/format';

export const ContactPage: React.FC = () => {
  const { showNotification } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Property Inquiries');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companySettings.contactFormEndpoint) return;

    setIsSending(true);
    try {
      const response = await fetch(companySettings.contactFormEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message })
      });
      if (!response.ok) throw new Error('Contact request failed');
      setSubmitted(true);
      showNotification('Your message was accepted by the configured contact service.', 'success');
    } catch {
      showNotification('The message could not be sent. Please try again later.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span>Customer Care & Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif-display">
            Contact Sheltered
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto">
            Contact our team by phone, email, WhatsApp, or through our social channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Details (5 cols) */}
          <div className="md:col-span-5 bg-slate-950 text-white rounded-3xl p-8 space-y-8 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-serif-display text-white">Headquarters · {companySettings.headquarters}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  The headquarters location is shown separately from the locations of listed properties.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Office address:</strong>
                    <p className="text-slate-400">{companySettings.officeAddress || 'Address not provided'}</p>
                  </div>
                </div>

                {companySettings.phoneNumbers.length > 0 && <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Telephone:</strong>
                    {companySettings.phoneNumbers.map((number) => (
                      <p key={number}>
                        <a href={getTelLink(number)} className="text-slate-400 hover:text-white">{number}</a>
                      </p>
                    ))}
                  </div>
                </div>}

                {companySettings.whatsappNumber && <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">WhatsApp:</strong>
                    <p>
                      <a
                        href={getWhatsAppLink(companySettings.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white"
                      >
                        Message us directly
                      </a>
                    </p>
                  </div>
                </div>}

                {companySettings.email && <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Email:</strong>
                    <p>
                      <a href={`mailto:${companySettings.email}`} className="text-slate-400 hover:text-white">
                        {companySettings.email}
                      </a>
                    </p>
                  </div>
                </div>}

                {Object.entries(companySettings.socialLinks).some(([, url]) => url) && (
                  <div className="flex items-start gap-3">
                    <Share2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Follow us:</strong>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        {Object.entries(companySettings.socialLinks).map(([platform, url]) => url && (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white capitalize"
                          >
                            {platform === 'twitter' ? 'Twitter / X' : platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(companySettings.supportHours || companySettings.phoneNumbers.length === 0 && !companySettings.email && !companySettings.whatsappNumber) && <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
              {companySettings.supportHours && <p>Operating hours: {companySettings.supportHours}</p>}
              {companySettings.phoneNumbers.length === 0 && !companySettings.email && !companySettings.whatsappNumber && <p>Contact details have not been configured.</p>}
            </div>}
          </div>

          {/* Contact Form (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs">
            {submitted ? (
              <div className="py-16 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-neutral-900">Message Delivered</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  A Sheltered representative will review your message and reach out within 2 business hours.
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
                    placeholder="Provide details about the property, your preferred location, or your question..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!companySettings.contactFormEndpoint || isSending}
                  className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-bold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSending ? 'Sending...' : companySettings.contactFormEndpoint ? 'Send Message' : 'Contact form not configured'}</span>
                </button>
                {!companySettings.contactFormEndpoint && <p className="text-xs text-neutral-500" role="status">This form will be available after a contact service endpoint is configured.</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
