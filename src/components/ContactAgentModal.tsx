import React, { useState } from 'react';
import { X, MessageSquare, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWhatsAppLink, getTelLink, formatUGX } from '../utils/format';

export const ContactAgentModal: React.FC = () => {
  const { contactModalProperty, setContactModalProperty, addEnquiry, currentUser } = useApp();

  const [name, setName] = useState(currentUser.name || 'Phillip Mwanaweika');
  const [email, setEmail] = useState(currentUser.email || 'phillipmwanaweika@gmail.com');
  const [phone, setPhone] = useState(currentUser.phone || '+256 700 123 456');
  const [message, setMessage] = useState(
    'Hello, I am interested in this listing and would like to confirm its current availability and price terms.'
  );
  const [submitted, setSubmitted] = useState(false);

  if (!contactModalProperty) return null;

  const agent = contactModalProperty.agent;
  const whatsappUrl = getWhatsAppLink(agent.whatsapp, contactModalProperty.title);
  const telUrl = getTelLink(agent.phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEnquiry({
      propertyId: contactModalProperty.id,
      propertyTitle: contactModalProperty.title,
      userName: name,
      userEmail: email,
      userPhone: phone,
      message
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactModalProperty(null);
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setContactModalProperty(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setContactModalProperty(null)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Agent Info Banner */}
        <div className="flex items-center gap-4 pb-4 mb-4 border-b border-neutral-100">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-neutral-900">{agent.name}</h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                Verified Agent
              </span>
            </div>
            <p className="text-xs text-neutral-500">{agent.company}</p>
            <p className="text-[11px] text-neutral-400">Specialty: {agent.areaSpecialty}</p>
          </div>
        </div>

        {/* Direct One-Click Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={telUrl}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Phone className="w-4 h-4" />
            <span>Direct Call ({agent.phone.slice(-6)})</span>
          </a>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-neutral-900">Enquiry Dispatched!</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              {agent.name} has received your inquiry and will reach out via phone or email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
              Regarding: <strong>{contactModalProperty.title}</strong> (
              {formatUGX(contactModalProperty.price, contactModalProperty.listingType)})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Your Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Message
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Send Message to Agent</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
