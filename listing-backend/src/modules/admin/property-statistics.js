export async function getPropertyStatistics(propertyModel, now = new Date()) {
  const newListingsSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [totalProperties, soldProperties, availableProperties, newListings] = await Promise.all([
    propertyModel.count(),
    propertyModel.count({ where: { status: 'SOLD' } }),
    propertyModel.count({ where: { status: 'ACTIVE', listingType: 'SALE' } }),
    propertyModel.count({ where: { createdAt: { gte: newListingsSince } } })
  ]);

  return {
    totalProperties,
    soldProperties,
    availableProperties,
    newListings,
    newListingsPeriodDays: 30
  };
}
