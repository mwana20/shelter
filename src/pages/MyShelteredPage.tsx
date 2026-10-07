import React, { useState } from 'react';
import {
  User,
  Heart,
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Bell,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/format';

export const MyShelteredPage: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    savedPropertyIds,
    properties,
    viewingRequests,
    updateViewingStatus,
    enquiries,
    openPropertyDetail,
    setCurrentPage,
    showNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'viewings' | 'enquiries' | 'saved' | 'profile'>('viewings');

  // Profile edit state
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);

  const savedProperties = properties.filter((p) => savedPropertyIds.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      name,
      phone,
      email
    });
    showNotification('Profile updated successfully', 'success');
  };

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Greeting Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-neutral-900 font-serif-display">
                  My Sheltered Dashboard
                </h1>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full capitalize">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {currentUser.name} · {currentUser.email} · {currentUser.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('search')}
              className="bg-slate-950 text-white text-xs font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-800 transition"
            >
              Browse New Homes
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 space-x-6 text-xs font-bold text-neutral-500">
          <button
            onClick={() => setActiveTab('viewings')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'viewings' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Viewing Appointments ({viewingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'enquiries' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enquiries & Messages ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'saved' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Homes ({savedPropertyIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'profile' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Profile</span>
          </button>
        </div>

        {/* TAB 1: VIEWING APPOINTMENTS */}
        {activeTab === 'viewings' && (
          <div className="space-y-4">
            {viewingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 text-neutral-500 text-xs">
                No scheduled viewing appointments yet. Click "Schedule a Viewing" on any property.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="flex gap-4">
                      <img
                        src={req.propertyImage}
                        alt=""
                        className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                        onClick={() => openPropertyDetail(req.propertyId)}
                      />
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status}
                          </span>
                          <span className="text-neutral-400">· Scheduled Inspection</span>
                        </div>
                        <h4
                          onClick={() => openPropertyDetail(req.propertyId)}
                          className="font-bold text-neutral-900 cursor-pointer hover:underline line-clamp-1"
                        >
                          {req.propertyTitle}
                        </h4>
                        <p className="text-emerald-700 font-bold">
                          {formatUGX(req.propertyPrice, req.listingType)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl space-y-1 text-xs text-neutral-600 border border-neutral-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Date: <strong>{req.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Time: <strong>{req.timeSlot}</strong></span>
                      </div>
                      {req.notes && (
                        <p className="text-[11px] text-neutral-500 italic pt-1">
                          Note: "{req.notes}"
                        </p>
                      )}
                    </div>

                    {req.status !== 'Cancelled' && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 text-xs">
                        <button
                          onClick={() => updateViewingStatus(req.id, 'Cancelled')}
                          className="text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            {enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 text-neutral-500 text-xs">
                No messages sent to agents yet.
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-neutral-900 text-sm">
                          Regarding: {enq.propertyTitle}
                        </span>
                        <p className="text-neutral-400 text-[11px]">
                          Sent on {new Date(enq.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {enq.status}
                      </span>
                    </div>
                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-neutral-700 italic">
                      "{enq.message}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED HOMES SHORTCUT */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {savedProperties.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openPropertyDetail(p.id)}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xs cursor-pointer hover:shadow-md transition"
                >
                  <img src={p.images[0]} alt="" className="w-full h-36 object-cover" />
                  <div className="p-4 space-y-1 text-xs">
                    <p className="font-bold text-neutral-900 text-sm">{formatUGX(p.price, p.listingType)}</p>
                    <p className="font-semibold text-neutral-800 line-clamp-1">{p.title}</p>
                    <p className="text-neutral-500">📍 {p.area}, Mukono</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-8 border border-neutral-200/90 max-w-lg space-y-4 shadow-xs">
            <h3 className="text-lg font-bold text-neutral-900">Personal Information</h3>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="bg-slate-950 text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-slate-800 transition shadow-xs"
            >
              Update Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
