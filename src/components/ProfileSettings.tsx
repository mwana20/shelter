import React, { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfileWithBackend } from '../services/authApi';

interface ProfileSettingsProps {
  currentUser: UserProfile;
  onSaved: (user: UserProfile) => void;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

async function prepareProfileImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Profile images must be 5 MB or smaller.');
  }

  const imageUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
    });

    const maxDimension = 512;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process the selected image.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
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
    try {
      setAvatarUrl(await prepareProfileImage(file));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : 'Could not load this image.');
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
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile preview" className="h-20 w-20 rounded-full border border-slate-200 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
            {name.trim().charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <ImagePlus className="h-4 w-4" />
          Change photo
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
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
        disabled={isSaving}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
};
