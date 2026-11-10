import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_AMENITIES } from '../data/mockProperties';
import { ListingType, PropertyType } from '../types';
import { CurrencyCode, RentalPeriod, formatPrice } from '../utils/currency';
import { GLOBAL_LOCATIONS, COUNTRY_ADMIN_CONFIGS, POPULAR_COUNTRIES } from '../data/mockLocations';
import { createPropertyWithBackend } from '../services/propertyApi';
import { PropertyMediaUploader, UploadedMediaSelection } from '../components/PropertyMediaUploader';

export const ListPropertyPage: React.FC = () => {
  const { addProperty, currentUser, setCurrentPage, openPropertyDetail, showNotification } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Basic & Location
  const [title, setTitle] = useState('');
  const [listingType, setListingType] = useState<ListingType>('Sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('House');
  const [country, setCountry] = useState('Uganda');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [isManualLocation, setIsManualLocation] = useState(false);

  // Step 2: Pricing & Specs
  const [price, setPrice] = useState('450000');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>('month');
  const [priceNegotiable, setPriceNegotiable] = useState(true);
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [parkingSpaces, setParkingSpaces] = useState('2');
  const [sqft, setSqft] = useState('2400');
  const [plotSize, setPlotSize] = useState('50 x 100 ft');
  const [titleDeedStatus, setTitleDeedStatus] = useState<any>('Title Deed Verified');
  const [description, setDescription] = useState(
    'Exceptional modern residence designed with premium architectural finishes, open-concept living spaces, gourmet kitchen, landscaped gardens, and high security.'
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    '24/7 Security & CCTV',
    'Perimeter Wall & Fence',
    'High-Speed Internet / Fiber',
    'Private Garden',
    'Dedicated Parking'
  ]);

  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaSelection | null>(null);

  const adminConfig = COUNTRY_ADMIN_CONFIGS[country] || COUNTRY_ADMIN_CONFIGS.Uganda;
  const countryNode = GLOBAL_LOCATIONS.find((n) => n.name.toLowerCase() === country.toLowerCase());

  const availableRegions = countryNode?.children || [];
  const selectedRegionNode = availableRegions.find((r) => r.name === region);
  const availableDistricts = selectedRegionNode?.children || [];
  const selectedDistrictNode = availableDistricts.find((d) => d.name === district);
  const availableNeighborhoods = selectedDistrictNode?.children || [];

  const handleCountryChange = (c: string) => {
    setCountry(c);
    setRegion('');
    setDistrict('');
    setNeighborhood('');
    const newCfg = COUNTRY_ADMIN_CONFIGS[c];
    if (newCfg?.currency) {
      setCurrency(newCfg.currency as CurrencyCode);
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handlePublish = async (status: 'Published' | 'Draft' = 'Published') => {
    if (!title.trim()) {
      showNotification('Please enter a listing title.', 'error');
      setCurrentStep(1);
      return;
    }
    if (!uploadedMedia) {
      showNotification('Upload four property images and one MP4 video before submitting.', 'error');
      setCurrentStep(3);
      return;
    }

    const numericPrice = parseFloat(price.replace(/,/g, '')) || 0;
    const finalLocation = `${neighborhood || district || region}, ${country}`;

    const backendResult = await createPropertyWithBackend({
      title: title.trim(),
      description,
      propertyType,
      listingType: (listingType === 'Rent' ? 'RENT' : listingType === 'Lease' ? 'LEASE' : 'SALE') as 'SALE' | 'RENT' | 'LEASE',
      price: numericPrice,
      currency,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseFloat(bathrooms) || 0,
      landSizeSqFt: parseInt(sqft) || undefined,
      country,
      region: region || 'Metropolitan Area',
      district: district || region || 'Central District',
      neighborhood: neighborhood || undefined,
      exactAddress: streetAddress || undefined,
      latitude: 1.0784,
      longitude: 34.1756,
      propertyId: uploadedMedia.propertyId,
      mediaBatchId: uploadedMedia.batchId,
      mediaRefs: uploadedMedia.mediaRefs
    });

    if (!backendResult.success) {
      showNotification(backendResult.error || 'Property submission failed. Retry after checking your connection.', 'error');
      return;
    }

    const backendMedia = [...(backendResult.property?.media || [])].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    const imageMedia = backendMedia.filter((media: any) => media.kind === 'IMAGE');
    const videoMedia = backendMedia.find((media: any) => media.kind === 'VIDEO');
    if (imageMedia.length !== 4 || !videoMedia?.publicUrl) {
      showNotification('The backend did not confirm the complete property media set.', 'error');
      return;
    }
    showNotification('Property and media submitted to backend for admin review.', 'success');

    addProperty({
      id: backendResult.property.id,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      listingType,
      propertyType,
      status: status === 'Draft' ? 'Draft' : 'Available',
      verified: currentUser.verificationStatus === 'Verified',
      featured: false,
      isNew: true,
      price: numericPrice,
      currency,
      rentalPeriod: listingType === 'Rent' || listingType === 'Lease' ? rentalPeriod : undefined,
      priceNegotiable,
      country,
      region: region || 'Metropolitan Area',
      district: district || region || 'Central District',
      neighborhood: neighborhood || undefined,
      locationDetails: streetAddress ? `${streetAddress}, ${finalLocation}` : finalLocation,
      coordinates: { lat: 1.0784, lng: 34.1756 }, // Default center near Mbale HQ for demo
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      parkingSpaces: parseInt(parkingSpaces) || 0,
      sqft: parseInt(sqft) || undefined,
      plotSize: plotSize || undefined,
      description,
      features: selectedFeatures,
      images: imageMedia.map((media: any) => media.publicUrl),
      imageThumbnails: imageMedia.map((media: any) => media.thumbnailUrl || media.publicUrl),
      videoUrl: videoMedia.publicUrl,
      videoPosterUrl: videoMedia.thumbnailUrl || undefined,
      videoType: 'mp4',
      titleDeedStatus,
      agent: {
        id: currentUser.id,
        name: currentUser.name,
        company: currentUser.companyName || 'Independent Real Estate Seller',
        phone: currentUser.phone,
        whatsapp: currentUser.phone.replace(/\D/g, ''),
        email: currentUser.email,
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        verified: currentUser.verificationStatus === 'Verified',
        activeListingsCount: 1,
        experienceYears: 5,
        bio: currentUser.bio || 'Verified property advisor on Sheltered Global Marketplace.',
        areaSpecialty: `${country} Specialist`,
        city: currentUser.city || 'Mbale City (HQ)',
        country
      }
    });

    showNotification(status === 'Draft' ? 'Property saved as draft!' : 'Property successfully published!', 'success');
    setCurrentPage('seller-dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Indicator Header */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sheltered Marketplace · HQ Mbale, Uganda
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                List Your Property Worldwide
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('seller-dashboard')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { num: 1, label: 'Location & Type' },
              { num: 2, label: 'Pricing & Specs' },
              { num: 3, label: 'Media & Walkthrough' },
              { num: 4, label: 'Review & Publish' },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num as any)}
                className={`py-2 px-1 text-xs font-semibold border-b-2 transition-colors ${
                  currentStep === s.num
                    ? 'border-slate-900 text-slate-900'
                    : currentStep > s.num
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="hidden sm:inline">Step {s.num}: </span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: LOCATION & TYPE */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Step 1: Property Category & Geographic Hierarchy</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern 4-Bedroom Villa with Swimming Pool"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Listing Type
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                    <option value="Lease">Commercial Lease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Property Category
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="House">House / Family Home</option>
                    <option value="Apartment">Apartment & Condominium</option>
                    <option value="Villa">Villa & Luxury Residence</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Residential Land">Residential Land / Building Plot</option>
                    <option value="Commercial Property">Commercial Office & Plaza</option>
                    <option value="Shop & Retail">Shop & Retail Premises</option>
                    <option value="Farm & Agricultural Land">Farm & Agricultural Land</option>
                    <option value="Industrial Property">Industrial Warehouse</option>
                    <option value="Holiday Home">Holiday Home & Vacation Rental</option>
                  </select>
                </div>
              </div>

              {/* Country Selection */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-slate-700" />
                    <span>Country & Administrative Location</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualLocation(!isManualLocation)}
                    className="text-xs text-slate-600 hover:text-slate-900 underline"
                  >
                    {isManualLocation ? 'Use Guided Dropdowns' : 'Manual Location Entry'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      {POPULAR_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {isManualLocation ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        State, Region or City
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="Enter province or region..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {adminConfig.labels.level1}
                      </label>
                      <select
                        value={region}
                        onChange={(e) => {
                          setRegion(e.target.value);
                          setDistrict('');
                          setNeighborhood('');
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="">Select {adminConfig.labels.level1}</option>
                        {availableRegions.map((r) => (
                          <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {!isManualLocation && region && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {adminConfig.labels.level2}
                      </label>
                      <select
                        value={district}
                        onChange={(e) => {
                          setDistrict(e.target.value);
                          setNeighborhood('');
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="">Select {adminConfig.labels.level2}</option>
                        {availableDistricts.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {adminConfig.labels.level4}
                      </label>
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option value="">Select {adminConfig.labels.level4}</option>
                        {availableNeighborhoods.map((n) => (
                          <option key={n.id} value={n.name}>{n.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address / Plot Number / Directions
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. Plot 18 Republic Street, Senior Quarters"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                <span>Continue to Specs & Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING & SPECS */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Step 2: Pricing, Sizing & Amenities</h2>

            <div className="space-y-4">
              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Asking Price
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="450000"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="UGX">UGX (Shilling)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="KES">KES (Kenya)</option>
                    <option value="TZS">TZS (Tanzania)</option>
                    <option value="ZAR">ZAR (Rand)</option>
                  </select>
                </div>
              </div>

              {(listingType === 'Rent' || listingType === 'Lease') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rental Period
                  </label>
                  <select
                    value={rentalPeriod}
                    onChange={(e) => setRentalPeriod(e.target.value as RentalPeriod)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="month">Per Month (/mo)</option>
                    <option value="week">Per Week (/wk)</option>
                    <option value="night">Per Night (/night)</option>
                    <option value="year">Per Year (/yr)</option>
                  </select>
                </div>
              )}

              {/* Rooms & Sizing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parking</label>
                  <input
                    type="number"
                    min={0}
                    value={parkingSpaces}
                    onChange={(e) => setParkingSpaces(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Building Sq Ft</label>
                  <input
                    type="number"
                    min={0}
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Land / Plot Dimensions
                </label>
                <input
                  type="text"
                  value={plotSize}
                  onChange={(e) => setPlotSize(e.target.value)}
                  placeholder="e.g. 50 x 100 ft (12 decimals) or 1.5 Acres"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title Deed & Ownership Status
                </label>
                <select
                  value={titleDeedStatus}
                  onChange={(e) => setTitleDeedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Title Deed Verified">Title Deed Verified</option>
                  <option value="Freehold">Freehold Title</option>
                  <option value="Ready Private Mailo">Ready Private Mailo (Uganda)</option>
                  <option value="Leasehold">Leasehold Title</option>
                  <option value="Certificate of Occupancy">Certificate of Occupancy</option>
                  <option value="Deed Pending Verification">Deed Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Property Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm leading-relaxed"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Property Amenities & Features
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_AMENITIES.map((feat) => (
                    <label
                      key={feat}
                      className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feat)}
                        onChange={() => toggleFeature(feat)}
                        className="rounded border-slate-300 text-slate-900"
                      />
                      <span className="text-slate-700">{feat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                <span>Continue to Media Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MEDIA & VIDEO */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Step 3: Property media</h2>
            <PropertyMediaUploader onUploadChange={setUploadedMedia} />

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={!uploadedMedia}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Preview Listing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & PUBLISH */}
        {currentStep === 4 && (
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Step 4: Review Listing Preview</h2>

            {/* Preview Card */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-neutral-50 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex h-40 w-full items-center justify-center rounded-lg bg-slate-100 text-center text-sm font-medium text-slate-600 md:w-56">
                  4 optimized images and 1 MP4 video uploaded
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    {country} · {propertyType} for {listingType}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{title || 'Untitled Property Listing'}</h3>
                  <div className="text-sm font-extrabold text-slate-900">
                    {formatPrice(parseFloat(price) || 0, currency, listingType, rentalPeriod)}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{description}</p>
                  <div className="text-xs text-slate-500 pt-1">
                    {bedrooms} Beds · {bathrooms} Baths · {sqft || '—'} sq ft · {plotSize || 'Standard Plot'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span className="font-bold text-slate-900">Marketplace Terms:</span> By publishing, you certify that all property titles, land documentation, and seller permissions comply with local property registration regulations.
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePublish('Draft')}
                  disabled={!uploadedMedia}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish('Published')}
                  disabled={!uploadedMedia}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shadow-xs disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Publish to Marketplace</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
