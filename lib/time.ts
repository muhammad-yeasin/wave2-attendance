export type BangladeshTimeParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
  dateString: string; // YYYY-MM-DD
  timeString: string; // HH:mm:ss
};

export function getBangladeshTimeParts(date = new Date()): BangladeshTimeParts {
  // Bangladesh is UTC+6 (no DST)
  const BANGLADESH_OFFSET_MS = 6 * 60 * 60 * 1000;

  // Convert to Bangladesh time by adding offset
  const bdTime = new Date(date.getTime() + BANGLADESH_OFFSET_MS);

  // Get UTC components (which now represent BD time)
  const year = bdTime.getUTCFullYear();
  const month = bdTime.getUTCMonth() + 1; // 1-12
  const day = bdTime.getUTCDate();
  const hour = bdTime.getUTCHours();
  const minute = bdTime.getUTCMinutes();
  const second = bdTime.getUTCSeconds();

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const timeString = `${pad(hour)}:${pad(minute)}:${pad(second)}`;

  return { year, month, day, hour, minute, second, dateString, timeString };
}

export function isAttendanceWindowOpen(now = new Date()): boolean {
  const { hour } = getBangladeshTimeParts(now);
  // Allow between 20:00 (8 PM) and 23:59 (11:59 PM) inclusive.
  return hour >= 20 && hour <= 23;
}
