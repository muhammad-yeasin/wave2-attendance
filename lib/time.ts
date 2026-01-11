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
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const second = Number(get("second"));
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const timeString = `${pad(hour)}:${pad(minute)}:${pad(second)}`;
  return { year, month, day, hour, minute, second, dateString, timeString };
}

export function isAttendanceWindowOpen(now = new Date()): boolean {
  const { hour } = getBangladeshTimeParts(now);
  // Allow between 20:00 and 23:59 inclusive.
  return hour >= 20 && hour <= 23;
}
