import { CumulativeListingPoint } from '../components/CumulativeBarChart';

export function buildCumulativeListingHistory(
  creationDates: readonly string[],
  now: Date = new Date()
): CumulativeListingPoint[] {
  if (creationDates.length === 0) return [];

  const monthlyCounts = new Map<string, number>();
  for (const creationDate of creationDates) {
    const date = new Date(creationDate);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid property creation date: ${creationDate}`);
    }
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);
  }

  const firstMonth = [...monthlyCounts.keys()].sort()[0];
  const [firstYear, firstMonthNumber] = firstMonth.split('-').map(Number);
  let year = firstYear;
  let month = firstMonthNumber - 1;
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const history: CumulativeListingPoint[] = [];
  let totalProperties = 0;

  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    totalProperties += monthlyCounts.get(monthKey) || 0;
    history.push({ month: monthKey, totalProperties });
    month += 1;
    if (month === 12) {
      month = 0;
      year += 1;
    }
  }

  return history;
}
