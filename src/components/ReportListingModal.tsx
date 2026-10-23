import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportListingModal: React.FC = () => {
  const { reportModalProperty, setReportModalProperty, showNotification } = useApp();

  const [reason, setReason] = useState('Suspected fraudulent or unverified title');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!reportModalProperty) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      showNotification('Thank you. Our compliance team in Mukono is reviewing this listing.', 'success');
      setSubmitted(false);
      setReportModalProperty(null);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setReportModalProperty(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setReportModalProperty(null)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-rose-600 mb-2">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-base font-bold text-neutral-900">Report Property Listing</h3>
        </div>

        <p className="text-xs text-neutral-500 mb-4">
          Reporting: <strong>{reportModalProperty.title}</strong>
        </p>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-900">Report Received</h4>
            <p className="text-xs text-neutral-500">
              Our safety board will investigate this listing and contact the owner if necessary.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="Suspected fraudulent or unverified title">
                  Suspected fraudulent or unverified title
                </option>
                <option value="Property already sold or rented">
                  Property is already sold or rented
                </option>
                <option value="Inaccurate pricing or hidden charges">
                  Inaccurate pricing or hidden charges
                </option>
                <option value="Misleading photos or physical location">
                  Misleading photos or physical location
                </option>
                <option value="Agent asked for upfront payment before inspection">
                  Agent requested deposit before physical inspection
                </option>
                <option value="Other concern">Other concern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what you observed during contact or inspection..."
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11px] text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Safety reminder: Never send mobile money or cash to anyone claiming to be a caretaker or agent before visiting the property in person and verifying land title at Mukono Zonal Land Office.
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs"
            >
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
