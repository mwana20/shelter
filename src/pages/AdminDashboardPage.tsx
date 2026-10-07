import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Heart,
  TrendingUp,
  Clock,
  Home,
  Tag,
  Plus,
  Edit2,
  BarChart3,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUGX, formatCompactUGX } from '../utils/format';
import { PropertyStatus } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    properties,
    approveProperty,
    rejectProperty,
    deleteProperty,
    updatePropertyStatus,
    toggleVerifiedStatus,
    viewingRequests,
    updateViewingStatus,
    enquiries,
    setCurrentPage,
    openPropertyDetail
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'moderation' | 'viewings' | 'analytics'>('inventory');

  // Stats calculation
  const totalProperties = properties.length;
  const propertiesForSale = properties.filter((p) => p.listingType === 'Sale').length;
  const propertiesForRent = properties.filter((p) => p.listingType === 'Rent').length;
  const availableCount = properties.filter((p) => p.status === 'Available').length;
  const soldCount = properties.filter((p) => p.status === 'Sold').length;
  const rentedCount = properties.filter((p) => p.status === 'Rented').length;
  const pendingCount = properties.filter((p) => p.status === 'Pending').length;

  const pendingListings = properties.filter((p) => p.status === 'Pending');

  // Analytics rankings
  const topViewed = [...properties].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);
  const topSaved = [...properties].sort((a, b) => b.savesCount - a.savesCount).slice(0, 5);

  return (
    <div className="bg-neutral-50/50 py-10 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Mukono District Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
              Sheltered Admin Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage marketplace inventory, moderate user property submissions, review scheduled viewings, and monitor platform traffic.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage('list-property')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Listing</span>
            </button>
          </div>
        </div>

        {/* Top 8 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-left">
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Total Listings</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{totalProperties}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">For Sale</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{propertiesForSale}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">For Rent</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{propertiesForRent}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Available</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{availableCount}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Sold</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{soldCount}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Rented</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{rentedCount}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-xs">
            <p className="text-xs text-amber-800 font-bold">Pending Review</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-xs">
            <p className="text-xs text-neutral-500 font-medium">Viewings</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{viewingRequests.length}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-neutral-200 space-x-6 text-xs font-bold text-neutral-500">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'inventory' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Marketplace Inventory ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'moderation' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Moderation ({pendingCount})</span>
          </button>

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
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 flex items-center gap-2 transition relative ${
              activeTab === 'analytics' ? 'text-slate-950 border-b-2 border-slate-950' : 'hover:text-neutral-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Analytics & Trends</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT TABLE */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">All Mukono Properties</h3>
              <span className="text-xs text-neutral-500">Showing {properties.length} listings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Property</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Metrics</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-neutral-50/60 transition">
                      <td className="p-3.5 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.images[0]}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg shrink-0 cursor-pointer"
                            onClick={() => openPropertyDetail(prop.id)}
                          />
                          <div>
                            <p
                              onClick={() => openPropertyDetail(prop.id)}
                              className="font-bold text-neutral-900 hover:text-emerald-700 cursor-pointer line-clamp-1"
                            >
                              {prop.title}
                            </p>
                            <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                              {prop.listingType} · {prop.propertyType}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-neutral-900 whitespace-nowrap">
                        {formatCompactUGX(prop.price, prop.listingType)}
                      </td>

                      <td className="p-3.5 text-neutral-600 whitespace-nowrap">
                        {prop.area}
                      </td>

                      <td className="p-3.5">
                        <select
                          value={prop.status}
                          onChange={(e) => updatePropertyStatus(prop.id, e.target.value as PropertyStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition ${
                            prop.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : prop.status === 'Sold'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : prop.status === 'Rented'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : prop.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Pending">Pending</option>
                          <option value="Sold">Sold</option>
                          <option value="Rented">Rented</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => toggleVerifiedStatus(prop.id)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition ${
                            prop.verified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:text-neutral-800'
                          }`}
                        >
                          {prop.verified ? '✓ Verified Title' : 'Unverified'}
                        </button>
                      </td>

                      <td className="p-3.5 text-neutral-500 text-[11px]">
                        <span className="inline-block mr-2">👁️ {prop.viewsCount}</span>
                        <span>❤️ {prop.savesCount}</span>
                      </td>

                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => openPropertyDetail(prop.id)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProperty(prop.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENDING MODERATION */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  Submissions Awaiting Administrative Review
                </h3>
                <p className="text-xs text-neutral-500">
                  Verify land title and contact property owner before publishing to the live marketplace.
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {pendingListings.length} In Queue
              </span>
            </div>

            {pendingListings.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs">
                No properties currently pending moderation. All submissions are processed!
              </div>
            ) : (
              <div className="space-y-4">
                {pendingListings.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={prop.images[0]}
                        alt=""
                        className="w-24 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                        onClick={() => openPropertyDetail(prop.id)}
                      />
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            {prop.listingType}
                          </span>
                          <span className="text-neutral-500">{prop.propertyType} in {prop.area}</span>
                        </div>
                        <h4
                          onClick={() => openPropertyDetail(prop.id)}
                          className="font-bold text-neutral-900 text-sm hover:underline cursor-pointer"
                        >
                          {prop.title}
                        </h4>
                        <p className="text-emerald-700 font-extrabold">{formatUGX(prop.price, prop.listingType)}</p>
                        <p className="text-neutral-400 text-[11px]">
                          Submitted by: {prop.agent?.name} ({prop.agent?.phone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveProperty(prop.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                      <button
                        onClick={() => rejectProperty(prop.id)}
                        className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VIEWINGS */}
        {activeTab === 'viewings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-neutral-900">Site Viewing Appointments Log</h3>
            <div className="space-y-3">
              {viewingRequests.map((vr) => (
                <div
                  key={vr.id}
                  className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-neutral-900 text-sm">{vr.propertyTitle}</p>
                    <p className="text-neutral-600">
                      Client: <strong>{vr.userName}</strong> ({vr.userPhone} · {vr.userEmail})
                    </p>
                    <p className="text-neutral-500">
                      Requested: <strong>{vr.date}</strong> at <strong>{vr.timeSlot}</strong>
                    </p>
                    {vr.notes && <p className="italic text-neutral-400">Note: "{vr.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={vr.status}
                      onChange={(e) => updateViewingStatus(vr.id, e.target.value as any)}
                      className="text-xs font-bold border border-neutral-300 rounded-lg p-2 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & MARKETPLACE TRENDS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Viewed Homes */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Most Viewed Properties</span>
              </div>
              <div className="space-y-3">
                {topViewed.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-neutral-400 w-4">{idx + 1}.</span>
                      <span className="font-semibold text-neutral-900 truncate">{p.title}</span>
                    </div>
                    <span className="font-extrabold text-emerald-700 shrink-0 ml-2">
                      {p.viewsCount} views
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Saved Homes */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <Heart className="w-4 h-4 text-rose-600" />
                <span>Most Saved Properties</span>
              </div>
              <div className="space-y-3">
                {topSaved.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-neutral-400 w-4">{idx + 1}.</span>
                      <span className="font-semibold text-neutral-900 truncate">{p.title}</span>
                    </div>
                    <span className="font-extrabold text-rose-600 shrink-0 ml-2">
                      {p.savesCount} saves
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Locations */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>High-Demand Mukono Localities</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>1. Seeta & Bajjo Road Corridor</span>
                  <span className="font-bold text-neutral-800">38% of inquiries</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>2. Sonde Hill & Misindye Ridge</span>
                  <span className="font-bold text-neutral-800">26% of inquiries</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>3. Mukono Municipality (UCU/Bishop Tucker)</span>
                  <span className="font-bold text-neutral-800">21% of inquiries</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>4. Kyetume & Katosi Corridor</span>
                  <span className="font-bold text-neutral-800">15% of inquiries</span>
                </div>
              </div>
            </div>

            {/* Popular Property Types */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span>Property Types in Demand</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span>Standalone 3-4 Bedroom Houses</span>
                  <span className="font-bold text-neutral-800">45% searches</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>50x100 Titled Residential Plots</span>
                  <span className="font-bold text-neutral-800">30% searches</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>2-3 Bedroom Rental Apartments</span>
                  <span className="font-bold text-neutral-800">18% searches</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Commercial & Highway Land</span>
                  <span className="font-bold text-neutral-800">7% searches</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
