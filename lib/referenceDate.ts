// Returns the first Friday on or before the 15th of the month prior to startDate.
// This is Amazon's reference date for the 30-trading-day trailing average.
export function getAmazonReferenceDate(startDate: Date): Date {
  const priorMonth15 = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 15);
  const dow = priorMonth15.getDay(); // 0=Sun … 6=Sat
  const daysBack = (dow - 5 + 7) % 7; // days to subtract to land on Friday
  priorMonth15.setDate(priorMonth15.getDate() - daysBack);
  return priorMonth15;
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}
