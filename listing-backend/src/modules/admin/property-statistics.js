export async function getPropertyStatistics(propertyModel, queryRaw, now = new Date()) {
  const newListingsSince = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [totalProperties, soldProperties, availableProperties, newListings, monthlyCounts] = await Promise.all([
    propertyModel.count(),
    propertyModel.count({ where: { status: 'SOLD' } }),
    propertyModel.count({ where: { status: 'ACTIVE', listingType: 'SALE' } }),
    propertyModel.count({ where: { createdAt: { gte: newListingsSince } } }),
    queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
             COUNT(*)::int AS count
      FROM "properties"
      GROUP BY 1
      ORDER BY 1 ASC
    `
  ]);

  const monthlyCountByMonth = new Map(
    monthlyCounts.map(({ month, count }) => [month, Number(count)])
  );
  const firstMonth = monthlyCounts[0]?.month;
  const cumulativeListings = [];
  if (firstMonth) {
    const [firstYear, firstMonthNumber] = firstMonth.split('-').map(Number);
    const cursor = new Date(Date.UTC(firstYear, firstMonthNumber - 1, 1));
    const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    let cumulativeTotal = 0;

    while (cursor <= lastMonth) {
      const month = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
      cumulativeTotal += monthlyCountByMonth.get(month) || 0;
      cumulativeListings.push({ month, totalProperties: cumulativeTotal });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }

  return {
    totalProperties,
    soldProperties,
    availableProperties,
    newListings,
    newListingsPeriodDays: 30,
    cumulativeListings
  };
}
