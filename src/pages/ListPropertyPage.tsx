import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  ChevronUp,
  ChevronDown,
  Film
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { companySettings } from '../config/company';
import { ALL_AMENITIES } from '../data/mockProperties';
import { ListingType, Property, PropertyType } from '../types';

interface MediaFile {
  file: File;
  preview: string;
}

export const ListPropertyPage: React.FC = () => {
  const { addProperty, currentUser, setCurrentPage, showNotification } = useApp();

  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('Sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [price, setPrice] = useState('');
  const [currencyCode, setCurrencyCode] = useState('UGX');
  const [country, setCountry] = useState('Uganda');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [parkingSpaces, setParkingSpaces] = useState('2');
  const [sqft, setSqft] = useState('2000');
  const [plotSize, setPlotSize] = useState('50 x 100 ft (12 Decimals)');
  const [titleDeedStatus, setTitleDeedStatus] = useState<Property['titleDeedStatus']>();
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Water availability',
    'Electricity',
    'Security',
    'Fence'
  ]);
  const [photos, setPhotos] = useState<(MediaFile | null)[]>(Array.from({ length: 5 }, () => null));
  const [video, setVideo] = useState<MediaFile | null>(null);
  const previewUrls = useRef<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const createMediaPreview = (file: File): MediaFile => {
    const preview = URL.createObjectURL(file);
    previewUrls.current.push(preview);
    return { file, preview };
  };

  const releaseMediaPreview = (media: MediaFile | null) => {
    if (!media) return;
    URL.revokeObjectURL(media.preview);
    previewUrls.current = previewUrls.current.filter((url) => url !== media.preview);
  };

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handlePhotoChange = (index: number, file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
      showNotification('Use a JPEG, PNG, or WebP photograph no larger than 15 MB.', 'error');
      return;
    }
    releaseMediaPreview(photos[index]);
    const selected = createMediaPreview(file);
    setPhotos((previous) => previous.map((photo, slot) => slot === index ? selected : photo));
  };

  const movePhoto = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= photos.length) return;
    setPhotos((previous) => {
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleVideoChange = (file?: File) => {
    if (!file) return;
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type) || file.size > 150 * 1024 * 1024) {
      showNotification('Use an MP4, WebM, or MOV video no larger than 150 MB.', 'error');
      return;
    }
    releaseMediaPreview(video);
    setVideo(createMediaPreview(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.some((photo) => photo === null) || !video) {
      showNotification('Add five property photographs and one property video before submitting.', 'error');
      return;
    }
    if (!companySettings.mediaUploadEndpoint || !companySettings.listingSubmissionEndpoint) {
      showNotification('Listing submission is unavailable until media storage and a listing service are configured.', 'error');
      return;
    }
    if (currentUser.id === 'guest') {
      showNotification('Sign in with a verified seller account before submitting a property.', 'error');
      return;
    }

    try {
      const mediaForm = new FormData();
      photos.forEach((photo) => mediaForm.append('photos', photo!.file));
      mediaForm.append('video', video.file);
      const mediaResponse = await fetch(companySettings.mediaUploadEndpoint, {
        method: 'POST',
        credentials: 'include',
        body: mediaForm
      });
      if (!mediaResponse.ok) throw new Error('Property media upload failed.');
      const mediaResult = await mediaResponse.json();
      if (!Array.isArray(mediaResult.images) || mediaResult.images.length !== 5 ||
          mediaResult.images.some((image: unknown) => typeof image !== 'string') ||
          typeof mediaResult.videoUrl !== 'string') {
        throw new Error('The media service returned an invalid media package.');
      }

    const targetCoords = { lat: 0, lng: 0 };

      const propertySubmission = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      listingType,
      propertyType,
      status: 'Pending' as const,
      verified: false,
      featured: false,
      isNew: true,
      price: Number(price),
      currencyCode,
      country,
      region,
      district,
      city,
      area,
      locationDetails: locationDetails || [area, city, district, country].filter(Boolean).join(', '),
      coordinates: targetCoords,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      sqft: sqft ? Number(sqft) : undefined,
      plotSize,
      description,
      features: selectedFeatures,
      images: mediaResult.images as string[],
      videoUrl: mediaResult.videoUrl as string,
      titleDeedStatus: country.trim().toLowerCase() === 'uganda' ? titleDeedStatus : undefined,
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
        bio: 'Property owner listed on Sheltered.',
        areaSpecialty: area
      }
      };

      const listingResponse = await fetch(companySettings.listingSubmissionEndpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertySubmission)
      });
      if (!listingResponse.ok) throw new Error('The listing service could not accept this submission.');
      addProperty(propertySubmission);

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Property submission failed. Please try again.', 'error');
    }
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
            Reach people searching for property in Uganda and supported markets around the world.
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
                The configured listing service accepted this submission. It remains pending until an authorized marketplace reviewer approves it.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl max-w-md mx-auto text-xs text-neutral-500 space-y-1 border border-neutral-200 text-left">
              <p className="font-bold text-neutral-800">What happens next?</p>
              <p>1. The listing must remain unavailable in public search while pending.</p>
              <p>2. An authorized marketplace reviewer must approve it before publication.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={() => setCurrentPage('admin')}
                className="bg-slate-950 text-white text-xs font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition"
              >
                Return to marketplace preview
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
                    Price *
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
                    {listingType === 'Sale' ? `Total selling price in ${currencyCode}` : `Monthly rent in ${currencyCode}`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Currency code *</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={3}
                    pattern="[A-Za-z]{3}"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    placeholder="e.g. UGX, USD, GBP"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Region / Province / State
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Region, province, or state"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">District / County *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District, county, or equivalent"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City, town, or village"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Neighborhood / Locality *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Neighborhood, ward, parish, or locality"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Street / Address Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, plot number, or other useful address detail"
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
                    Plot / Land Size
                  </label>
                  <input
                    type="text"
                    required={propertyType === 'Land'}
                    value={plotSize}
                    onChange={(e) => setPlotSize(e.target.value)}
                    placeholder="Enter the local measurement and unit"
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {country.trim().toLowerCase() === 'uganda' && <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Land Title Status
                  </label>
                  <select
                    value={titleDeedStatus}
                    onChange={(e) => setTitleDeedStatus(e.target.value as Property['titleDeedStatus'])}
                    className="w-full text-xs font-medium border border-neutral-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="">Not specified</option>
                    <option value="Ready Private Mailo">Ready Private Mailo Title</option>
                    <option value="Freehold">Freehold Title</option>
                    <option value="Leasehold">Leasehold Title</option>
                    <option value="Customary">Customary / Kibanja with Sales Agreement</option>
                  </select>
                </div>}
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

            {/* 3. Property media */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center justify-between">
                <span>3. Property Media</span>
                <span className="text-xs font-normal text-neutral-400">({photos.filter(Boolean).length}/5 photos · {video ? '1/1 video' : '0/1 video'})</span>
              </h3>
              <p className="text-xs text-neutral-500">Upload exactly five photographs and one video. The first photo is the cover; reorder with the arrows. Maximum 15 MB per photo and 150 MB per video.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo, index) => (
                  <div key={index} className="space-y-2 rounded-lg border border-neutral-200 p-3">
                    <div className="aspect-video overflow-hidden bg-neutral-100">
                      {photo ? <img src={photo.preview} alt={`Property photo ${index + 1}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-neutral-400">Photo {index + 1}</div>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="min-w-0 flex-1 cursor-pointer text-xs font-semibold text-emerald-800">
                        <span className="inline-flex items-center gap-1"><Upload className="h-3.5 w-3.5" />{photo ? 'Replace photo' : 'Choose photo'}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handlePhotoChange(index, event.target.files?.[0])} />
                      </label>
                      <button type="button" aria-label={`Move photo ${index + 1} up`} disabled={index === 0 || !photo} onClick={() => movePhoto(index, -1)} className="p-1 text-neutral-600 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                      <button type="button" aria-label={`Move photo ${index + 1} down`} disabled={index === photos.length - 1 || !photo} onClick={() => movePhoto(index, 1)} className="p-1 text-neutral-600 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                      <button type="button" aria-label={`Remove photo ${index + 1}`} disabled={!photo} onClick={() => {
                        releaseMediaPreview(photo);
                        setPhotos((previous) => previous.map((item, slot) => slot === index ? null : item));
                      }} className="p-1 text-rose-700 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    {index === 0 && <span className="text-[11px] font-semibold text-neutral-500">Cover photo</span>}
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-emerald-800">
                  <Film className="h-4 w-4" />
                  {video ? 'Replace property video' : 'Choose property video'}
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" onChange={(event) => handleVideoChange(event.target.files?.[0])} />
                </label>
                {video && <div className="flex items-center gap-3">
                  <video src={video.preview} controls className="max-h-40 max-w-full" />
                  <button type="button" onClick={() => { releaseMediaPreview(video); setVideo(null); }} className="p-2 text-rose-700" aria-label="Remove property video"><Trash2 className="h-4 w-4" /></button>
                </div>}
              </div>
            </div>

            {/* Moderation Notice & Submit */}
            <div className="pt-4 border-t border-neutral-100 space-y-4">
              <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Sheltered Moderation Policy</p>
                  <p>
                    Submission is enabled only when media storage and a listing service are configured. The server must enforce seller verification, file validation, pending status, and administrator approval.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!companySettings.mediaUploadEndpoint || !companySettings.listingSubmissionEndpoint || photos.some((photo) => !photo) || !video}
                className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-bold text-sm py-4 rounded-xl shadow-lg transition"
              >
                {!companySettings.mediaUploadEndpoint || !companySettings.listingSubmissionEndpoint ? 'Listing services not configured' : 'Submit for Review'}
              </button>
              {(!companySettings.mediaUploadEndpoint || !companySettings.listingSubmissionEndpoint) && <p className="text-xs text-neutral-500" role="status">Submission is disabled until secure media storage and a listing API are configured.</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
