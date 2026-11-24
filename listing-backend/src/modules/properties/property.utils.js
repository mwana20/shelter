/**
 * Filters property fields based on whether the requester is authorized
 * to view confidential exact location and owner contact details.
 *
 * CRITICAL RULE:
 * The backend MUST withhold exact location data until payment is successfully verified.
 * Do not rely only on frontend hiding.
 */
export const sanitizePropertyLocation = (
  property,
  isAuthorizedToViewExact,
  isAuthorizedToViewOwnerContact = false
) => {
  const sanitizedOwner = property?.owner && !isAuthorizedToViewOwnerContact
    ? { ...property.owner, email: null, phone: null }
    : property?.owner;

  if (isAuthorizedToViewExact) {
    return {
      ...property,
      owner: sanitizedOwner,
      isLocationLocked: false
    };
  }

  // Sanitize and withhold confidential exact coordinates & addresses
  const {
    exactAddress,
    latitude,
    longitude,
    directionsGuide,
    cadastralPlotNumber,
    ...publicFields
  } = property;

  return {
    ...publicFields,
    owner: sanitizedOwner,
    isLocationLocked: true,
    exactAddress: null,
    latitude: null,
    longitude: null,
    directionsGuide: null,
    cadastralPlotNumber: null,
    lockNotice: 'Exact location is locked. Pay to unlock full address, GPS coordinates, and directions.'
  };
};

export const canViewProperty = (property, user) =>
  property.status === 'ACTIVE' || user?.role === 'ADMIN' || user?.id === property.ownerId;
