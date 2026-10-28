/**
 * Filters property fields based on whether the requester is authorized
 * to view the confidential exact location.
 *
 * CRITICAL RULE:
 * The backend MUST withhold exact location data until payment is successfully verified.
 * Do not rely only on frontend hiding.
 */
export const sanitizePropertyLocation = (property, isAuthorizedToViewExact) => {
  if (isAuthorizedToViewExact) {
    return {
      ...property,
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
    isLocationLocked: true,
    exactAddress: null,
    latitude: null,
    longitude: null,
    directionsGuide: null,
    cadastralPlotNumber: null,
    lockNotice: 'Exact location is locked. Pay to unlock full address, GPS coordinates, and directions.'
  };
};
