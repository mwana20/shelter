import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_AMENITIES } from '../data/mockProperties';
import { mockAgents } from '../data/mockAgents';
import { ListingType, PropertyType, MukonoArea } from '../types';

export const ListPropertyPage: React.FC = () => {
  const { addProperty, currentUser, setCurrentPage } = useApp();

  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('Sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState<MukonoArea>('Seeta');
  const [locationDetails, setLocationDetails] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [parkingSpaces, setParkingSpaces] = useState('2');
  const [sqft, setSqft] = useState('2000');
  const [plotSize, setPlotSize] = useState('50 x 100 ft (12 Decimals)');
  const [titleDeedStatus, setTitleDeedStatus] = useState<any>('Ready Private Mailo');
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Water availability',
    'Electricity',
    'Security',
    'Fence'
  ]);
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85'
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const samplePhotoPresets = [
    { label: 'Modern Bungalow Exterior', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85' },
    { label: 'Spacious Living Room', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85' },
    { label: 'Granite Counter Kitchen', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85' },
    { label: 'Green Compound & Garden', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=85' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Coordinates fallback for selected Mukono area
    const coordsMap: Record<string, { lat: number; lng: number }> = {
      'Mukono Municipality': { lat: 0.3533, lng: 32.7554 },
      'Mukono Town': { lat: 0.3533, lng: 32.7554 },
      'Seeta': { lat: 0.3582, lng: 32.7093 },
      'Namugongo': { lat: 0.3951, lng: 32.6582 },
      'Sonde': { lat: 0.3842, lng: 32.6951 },
      'Kyetume': { lat: 0.3245, lng: 32.7789 },
      'Namanoga': { lat: 0.2841, lng: 32.7412 },
      'Goma': { lat: 0.3701, lng: 32.7214 },
      'Katosi': { lat: 0.1472, lng: 32.7981 },
      'Nakisunga': { lat: 0.2981, lng: 32.7621 },
      'Wantoni': { lat: 0.3491, lng: 32.7611 }
    };

    const targetCoords = coordsMap[area] || { lat: 0.3533, lng: 32.7554 };

    // Create property with status 'Pending' for admin moderation
    addProperty({
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      listingType,
      propertyType,
      status: 'Pending', // Moderation workflow requirement
      verified: false,
      featured: false,
      isNew: true,
      price: Number(price),
      area,
      locationDetails: locationDetails || `${area}, Mukono`,
      coordinates: targetCoords,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      sqft: sqft ? Number(sqft) : undefined,
      plotSize,
      description,
      features: selectedFeatures,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'],
      titleDeedStatus,
      agent: {
        id: 'agent-owner',
        name: currentUser.name,
        company: 'Private Property Owner',
        phone: currentUser.phone,
        whatsapp: currentUser.phone.replace(/[^0-9]/g, ''),
        email: currentUser.email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        verified: false,
        activeListingsCount: 1,
        experienceYears: 1,
        bio: 'Property owner listed on Sheltered Mukono.',
        areaSpecialty: area
      }
    });

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Building className="w-3.5 h-3.5" />
            <span>Marketplace Submission Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display">
            Have a Property to Sell or Rent?
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Reach people actively looking for homes in Mukono. Advertise directly to local families, university faculty, corporate renters, and investors.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-neutral-200/90 shadow-xl space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900 font-serif-display">
                Your property has been submitted for review.
              </h2>
              <p className="text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                Thank you for listing on Sheltered. Our local team in Mukono verifies land ownership and property integrity before publishing listings to maintain platform trust.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl max-w-md mx-auto text-xs text-neutral-500 space-y-1 border border-neutral-200 text-left">
              <p className="font-bold text-neutral-800">What happens next?</p>
              <p>1. Our Mukono verification desk confirms your title deed and phone number.</p>
              <p>2. You receive an SMS/WhatsApp confirmation once approved.</p>
              <p>3. Your listing goes live on Sheltered search and map results!</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={() => setCurrentPage('admin')}
                className="bg-slate-950 text-white text-xs font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition"
              >
                Review in Admin Portal (Simulate Approval)
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTitle('');
                  setDescription('');
                }}
                className="border border-neutral-200 text-neutral-700 text-xs font-semibold py-3 px-6 rounded-xl hover:bg-neutral-50 transition"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-sm space-y-8">
            {/* 1. Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                <span>1. Property Information</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern 4-Bedroom Family Home with Servant Quarters"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-3 px-3.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Sale or Rent *
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Land">Land / Plot</option>
                    <option value="Commercial Property">Commercial Property</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Price in UGX *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={listingType === 'Sale' ? 'e.g. 450000000' : 'e.g. 800000'}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    {listingType === 'Sale' ? 'Total selling price in UGX' : 'Monthly rent in UGX'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mukono Area / Locality *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value as MukonoArea)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Mukono Municipality">Mukono Municipality</option>
                    <option value="Mukono Town">Mukono Town</option>
                    <option value="Seeta">Seeta</option>
                    <option value="Namugongo">Namugongo</option>
                    <option value="Sonde">Sonde</option>
                    <option value="Kyetume">Kyetume</option>
                    <option value="Namanoga">Namanoga</option>
                    <option value="Goma">Goma</option>
                    <option value="Katosi">Katosi</option>
                    <option value="Nakisunga">Nakisunga</option>
                    <option value="Wantoni">Wantoni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Neighborhood / Street Details *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seeta, Nabuti Road near Kampala University"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Parking Spaces</label>
                  <input
                    type="number"
                    min="0"
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">House Size (sq ft)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2400"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Plot / Land Size (e.g. 50x100 or Decimals)
                  </label>
                  <input
                    type="text"
                    value={plotSize}
                    onChange={(e) => setPlotSize(e.target.value)}
                    placeholder="e.g. 50 x 100 ft (12 Decimals) or 25 Decimals"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Land Title Status
                  </label>
                  <select
                    value={titleDeedStatus}
                    onChange={(e) => setTitleDeedStatus(e.target.value)}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Ready Private Mailo">Ready Private Mailo Title</option>
                    <option value="Freehold">Freehold Title</option>
                    <option value="Leasehold">Leasehold Title</option>
                    <option value="Customary">Customary / Kibanja with Sales Agreement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the architectural layout, water reserve tanks, power backup, security gate, compound greenery..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
            </div>

            {/* 2. Features & Amenities Checklist */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                2. Property Features & Amenities
              </h3>
              <p className="text-xs text-neutral-500">
                Check all features available in this compound or residential unit.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_AMENITIES.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100/70 cursor-pointer text-xs font-medium text-neutral-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(amenity)}
                      onChange={() => toggleFeature(amenity)}
                      className="rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Photographs */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span>3. Property Photographs</span>
                <span className="text-xs font-normal text-neutral-400">({images.length} added)</span>
              </h3>

              {/* Current Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden h-28 border border-neutral-200 bg-neutral-100">
                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Cover Photo
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Image URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste property image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                >
                  Add Image
                </button>
              </div>

              {/* Preset Sample Photos for Fast Testing */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-neutral-500 mb-2">Or pick from sample Mukono architecture photos:</p>
                <div className="flex flex-wrap gap-2">
                  {samplePhotoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImages((prev) => [...prev, preset.url])}
                      className="text-[11px] font-medium py-1 px-2.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Moderation Notice & Submit */}
            <div className="pt-4 border-t border-neutral-100 space-y-4">
              <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Sheltered Moderation Policy</p>
                  <p>
                    All submissions undergo initial ownership screening before appearing on the public marketplace. You can review your listing status anytime inside the administrator portal or your user dashboard.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm py-4 rounded-xl shadow-lg transition"
              >
                Submit Property for Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
