import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, Mail, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/format';

export const ScheduleViewingModal: React.FC = () => {
  const {
    scheduleModalProperty,
    setScheduleModalProperty,
    addViewingRequest,
    currentUser
  } = useApp();

  const [date, setDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:30 AM');
  const [name, setName] = useState(currentUser.name || 'Phillip Mwanaweika');
  const [phone, setPhone] = useState(currentUser.phone || '+256 700 123 456');
  const [email, setEmail] = useState(currentUser.email || 'phillipmwanaweika@gmail.com');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!scheduleModalProperty) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      addViewingRequest({
        propertyId: scheduleModalProperty.id,
        propertyTitle: scheduleModalProperty.title,
        propertyPrice: scheduleModalProperty.price,
        propertyImage: scheduleModalProperty.images[0],
        listingType: scheduleModalProperty.listingType,
        date,
        timeSlot,
        userName: name,
        userPhone: phone,
        userEmail: email,
        notes
      });
      setSubmitting(false);
      setScheduleModalProperty(null);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setScheduleModalProperty(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setScheduleModalProperty(null)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Schedule Physical Viewing</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            Book an Inspection in Mukono
          </h3>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
            {scheduleModalProperty.title} · {formatUGX(scheduleModalProperty.price, scheduleModalProperty.listingType)}
          </p>
        </div>

        {/* Property preview card */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl mb-5 border border-neutral-100">
          <img
            src={scheduleModalProperty.images[0]}
            alt={scheduleModalProperty.title}
            className="w-16 h-14 object-cover rounded-lg shrink-0"
          />
          <div className="text-xs">
            <p className="font-semibold text-neutral-800 line-clamp-1">{scheduleModalProperty.title}</p>
            <p className="text-neutral-500">📍 {scheduleModalProperty.area}, Mukono</p>
            <p className="text-emerald-700 font-bold">{formatUGX(scheduleModalProperty.price, scheduleModalProperty.listingType)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Preferred Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Preferred Time
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="09:00 AM - 10:30 AM">Morning (09:00 - 10:30 AM)</option>
                <option value="11:00 AM - 12:30 PM">Late Morning (11:00 - 12:30 PM)</option>
                <option value="02:00 PM - 03:30 PM">Afternoon (02:00 - 03:30 PM)</option>
                <option value="04:00 PM - 05:30 PM">Late Afternoon (04:00 - 05:30 PM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Phillip Mwanaweika"
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 7XX XXX XXX"
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

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
              className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Special Requests or Questions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Would like to inspect boundary marks, check NWSC water meter, or verify title copy..."
              className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Sheltered viewing guarantee: Free accompanied site visits with accredited Mukono local brokers. No advance inspection fees requested.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl shadow-md transition"
          >
            {submitting ? 'Confirming Appointment...' : 'Confirm Viewing Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};
