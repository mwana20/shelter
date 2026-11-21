import React, { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfileWithBackend } from '../services/authApi';
import defaultAvatar from '../assets/default-avatar.svg';
import { prepareProfileImage } from '../utils/profileImage';

interface ProfileSettingsProps {
  currentUser: UserProfile;
  onSaved: (user: UserProfile) => void;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  currentUser,
  onSaved,
  showNotification
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setAvatarUrl(currentUser.avatar || '');
  }, [currentUser.name, currentUser.phone, currentUser.avatar]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsProcessingImage(true);
    try {
      setAvatarUrl(await prepareProfileImage(file));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Could not load this image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updatedUser = await updateProfileWithBackend({
        fullName: name.trim(),
        phone,
        ...(avatarUrl ? { avatarUrl } : {})
      });
      onSaved(updatedUser);
      showNotification('Your profile settings have been saved.', 'success');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">Profile settings</h3>
        <p className="mt-1 text-xs text-slate-500">Update your name, profile photo, and contact number.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}

      <div className="flex items-center gap-4">
        <img src={avatarUrl || defaultAvatar} alt="Profile preview" className="h-20 w-20 rounded-full border border-slate-200 object-cover" />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <ImagePlus className="h-4 w-4" />
          {isProcessingImage ? 'Preparing photo...' : 'Change photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" aria-label="Change profile photo" />
        </label>
      </div>
      <p className="text-[11px] text-slate-500">JPG, PNG, or WebP; up to 5 MB. Images are resized before saving.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-700">
          Full name
          <input
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Phone / WhatsApp
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSaving || isProcessingImage}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessingImage ? 'Preparing photo...' : isSaving ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
};
