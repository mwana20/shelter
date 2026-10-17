const splitPublicContacts = (value: string | undefined) =>
  value?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];

const phoneNumbers = splitPublicContacts(import.meta.env.VITE_COMPANY_PHONES);

export const companySettings = {
  name: import.meta.env.VITE_COMPANY_NAME ?? 'Sheltered',
  headquarters: 'Global operations with Uganda headquarters',
  defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE ?? 'en',
  officeAddress: import.meta.env.VITE_COMPANY_ADDRESS ?? '',
  phoneNumbers,
  whatsappNumber: import.meta.env.VITE_COMPANY_WHATSAPP || phoneNumbers[0] || '',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'info@sheltered.com',
  supportHours: import.meta.env.VITE_COMPANY_SUPPORT_HOURS ?? '',
  contactFormEndpoint: import.meta.env.VITE_CONTACT_FORM_ENDPOINT ?? '',
  authApiUrl: (import.meta.env.VITE_AUTH_API_URL ?? '').replace(/\/$/, ''),
  mediaUploadEndpoint: import.meta.env.VITE_MEDIA_UPLOAD_ENDPOINT ?? '',
  listingSubmissionEndpoint: import.meta.env.VITE_LISTING_SUBMISSION_ENDPOINT ?? '',
  socialLinks: {
    twitter: import.meta.env.VITE_COMPANY_TWITTER ?? '',
    facebook: import.meta.env.VITE_COMPANY_FACEBOOK ?? '',
    instagram: import.meta.env.VITE_COMPANY_INSTAGRAM ?? '',
    linkedin: import.meta.env.VITE_COMPANY_LINKEDIN ?? ''
  }
};