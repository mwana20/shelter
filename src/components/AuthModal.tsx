import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, currentUser, setCurrentUser, showNotification } = useApp();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState(currentUser.name || 'Phillip Mwanaweika');
  const [email, setEmail] = useState(currentUser.email || 'phillipmwanaweika@gmail.com');
  const [phone, setPhone] = useState(currentUser.phone || '+256 700 123 456');
  const [role, setRole] = useState<any>(currentUser.role || 'buyer');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      id: 'user-' + Date.now(),
      name,
      email,
      phone,
      role
    });
    showNotification(
      mode === 'signin' ? `Signed in as ${name}` : `Welcome to Sheltered Mukono, ${name}!`,
      'success'
    );
    setAuthModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Mukono Property Account</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            {mode === 'signin' ? 'Sign In to Sheltered' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Save searches, track viewing appointments, and contact Mukono landlords directly.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-neutral-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mode === 'signin' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
              mode === 'register' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number (Uganda)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 7XX XXX XXX"
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="buyer">Home Hunter / Tenant</option>
              <option value="landlord">Property Owner / Landlord</option>
              <option value="agent">Licensed Property Broker</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                defaultValue="password123"
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl transition shadow-md mt-2"
          >
            {mode === 'signin' ? 'Sign In to Account' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
