import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  Globe,
  ArrowRight,
  UserPlus,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { POPULAR_COUNTRIES, GLOBAL_LOCATIONS } from '../data/mockLocations';
import { calculateAge, validatePasswordStrength } from '../services/backendApi';
import { registerWithBackend } from '../services/authApi';
import { propertyImages } from '../assets/propertyImages';

export const RegisterPage: React.FC = () => {
  const { setCurrentPage, setCurrentUser, showNotification, t } = useApp();

  const [role, setRole] = useState<UserRole>('owner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [agencyLicense, setAgencyLicense] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Maximum allowed birth date for 18 years old
  const maxDobDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  // Real-time calculated age
  const calculatedAge = useMemo(() => {
    if (!dob) return null;
    return calculateAge(dob);
  }, [dob]);

  const isUnderage = calculatedAge !== null && calculatedAge < 18;
  const countryNode = GLOBAL_LOCATIONS.find((node) => node.name === country);
  const regions = countryNode?.children || [];
  const regionNode = regions.find((node) => node.name === region);
  const districts = regionNode?.children || [];
  const districtNode = districts.find((node) => node.name === district);
  const neighborhoods = districtNode?.children || [];

  // Real-time password requirement checklist
  const pwStrength = useMemo(() => {
    return validatePasswordStrength(password);
  }, [password]);

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Agree terms
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    // 2. Name validation
    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    // 3. Email validation & trimming & lowercasing
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    // 4. Age Restriction Check: Must be >= 18
    if (!dob) {
      setError('Date of birth is required.');
      return;
    }
    const age = calculateAge(dob);
    if (age < 18) {
      setError('You must be at least 18 years old to create an account.');
      return;
    }

    // 5. Password matching & complexity
    if (!pwStrength.isValid) {
      setError(pwStrength.errorMessage || 'Please ensure your password meets all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithBackend({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        dob,
        password,
        confirmPassword,
        role,
        country,
        region,
        district,
        neighborhood,
        companyName: role === 'agent' || role === 'broker' ? companyName.trim() : undefined,
        agencyLicense: role === 'agent' || role === 'broker' ? agencyLicense.trim() : undefined
      });

      showNotification(result.message || 'Registration successful! Please verify your email.', 'success');
      setCurrentUser({
          id: result.userId,
          name: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          dob,
          age,
          role,
          country,
          region,
          district,
          neighborhood,
          companyName: role === 'agent' || role === 'broker' ? companyName : undefined,
          agencyLicense: role === 'agent' || role === 'broker' ? agencyLicense : undefined,
          emailVerified: false,
          phoneVerified: false,
          preferredLanguage: 'en',
          preferredCurrency: 'USD',
          termsAccepted: true,
          privacyAcknowledged: true
      });

      setCurrentPage('email-verification', result.token);
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center overflow-hidden">
      {/* Background Photography with Ambient Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={propertyImages.authBackground}
          alt="Luxury Architectural Estate"
          className="w-full h-full object-cover object-center scale-102 transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/80 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wider uppercase mb-3 shadow-sm">
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('brand_name')} Membership</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-serif-display">
            {t('create_account_heading')}
          </h2>
          <p className="mt-2 text-sm text-slate-200 drop-shadow-xs">
            {t('create_account_desc')}
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-slate-900/45 backdrop-blur-2xl border border-white/25 shadow-2xl rounded-2xl p-6 sm:p-8 text-white">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/25 border border-rose-400/50 text-xs text-rose-200 backdrop-blur-md flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                {t('account_type_label')}:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'owner', label: t('role_seller'), desc: 'Private Seller' },
                  { id: 'landlord', label: 'Landlord', desc: 'Portfolios' },
                  { id: 'agent', label: t('role_agent'), desc: 'Licensed Advisor' },
                  { id: 'buyer', label: t('role_buyer'), desc: 'Investor' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as UserRole)}
                    className={`p-3 text-left border rounded-xl transition-all cursor-pointer backdrop-blur-md ${
                      role === item.id
                        ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md ring-1 ring-emerald-400/50'
                        : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate text-white">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 ${role === item.id ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('full_name_label')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wasswa Emmanuel"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('email_label')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth (Age Restriction: >= 18) & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    Date of Birth <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-300 font-medium">Must be 18+</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dob}
                    max={maxDobDate}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition scheme-dark"
                  />
                </div>

                {/* Age immediate feedback */}
                {dob && (
                  <div className="mt-1.5">
                    {isUnderage ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-300 font-semibold bg-rose-500/20 p-2 rounded-lg border border-rose-400/30">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>You must be at least 18 years old to create an account.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Age verified: {calculatedAge} years old (Eligible for registration)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('phone_label')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 701 000 000"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Location */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Preferred Location</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t('country_label')}</label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setRegion('');
                      setDistrict('');
                      setNeighborhood('');
                    }}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    {POPULAR_COUNTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Region / State</label>
                  {regions.length > 0 ? (
                    <select
                      value={region}
                      onChange={(e) => { setRegion(e.target.value); setDistrict(''); setNeighborhood(''); }}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:bg-slate-900 [&>option]:text-white"
                    >
                      <option value="">Select a region</option>
                      {regions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                    </select>
                  ) : (
                    <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region / State" className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400" />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">City / District</label>
                  {districts.length > 0 ? (
                    <select
                      value={district}
                      onChange={(e) => { setDistrict(e.target.value); setNeighborhood(''); }}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:bg-slate-900 [&>option]:text-white"
                    >
                      <option value="">Select a city / district</option>
                      {districts.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                    </select>
                  ) : (
                    <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="City / District" className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400" />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Neighborhood</label>
                  {neighborhoods.length > 0 ? (
                    <select
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:bg-slate-900 [&>option]:text-white"
                    >
                      <option value="">Any neighborhood</option>
                      {neighborhoods.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                    </select>
                  ) : (
                    <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Neighborhood / Locality" className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Agency / Company Name if agent or broker */}
            {(role === 'agent' || role === 'broker') && (
              <div className="p-4 bg-white/10 border border-white/15 backdrop-blur-md rounded-xl space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Agency &amp; Brokerage Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Company / Agency Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Elgon Crest Properties"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      License / Board Registration (Optional)
                    </label>
                    <input
                      type="text"
                      value={agencyLicense}
                      onChange={(e) => setAgencyLicense(e.target.value)}
                      placeholder="e.g. UG-REA-2026"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  {t('password_label')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 backdrop-blur-md transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Password Requirements Card */}
            {password.length > 0 && (
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/15 space-y-2 text-xs">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${pwStrength.hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {pwStrength.hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${pwStrength.hasUppercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {pwStrength.hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${pwStrength.hasLowercase ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {pwStrength.hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>At least 1 lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${pwStrength.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {pwStrength.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>At least 1 numeric digit (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${pwStrength.hasSpecialChar ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {pwStrength.hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>At least 1 special character (!@#$%)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Privacy */}
            <div className="text-xs text-slate-300 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400"
                />
                <span>
                  {t('agree_terms')}{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentPage('terms')}
                    className="font-medium text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                  >
                    {t('terms_of_service')}
                  </button>{' '}
                  &amp;{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentPage('privacy')}
                    className="font-medium text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
                  >
                    {t('privacy_policy')}
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isUnderage}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>{t('create_account_submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/15 pt-5 text-center text-xs text-slate-300">
            <span>{t('already_have_account')} </span>
            <button
              type="button"
              onClick={() => setCurrentPage('sign-in')}
              className="font-semibold text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer transition ml-1"
            >
              {t('nav_sign_in')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
