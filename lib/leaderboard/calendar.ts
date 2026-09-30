export const SEASON_TIME_ZONE = "Asia/Jakarta";

const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export interface SeasonDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getSeasonDateParts(date: Date = new Date()): SeasonDateParts {
  const values = new Intl.DateTimeFormat("en-GB", {
    timeZone: SEASON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) => Number(values.find((part) => part.type === type)?.value || 0);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

export function getSeasonKey(date: Date = new Date()) {
  const { year, month } = getSeasonDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getSeasonName(date: Date = new Date()) {
  const { year, month } = getSeasonDateParts(date);
  return `Season ${INDONESIAN_MONTHS[month - 1]} ${year}`;
}

export function getSeasonNameFromKey(seasonKey: string) {
  const [yearValue, monthValue] = seasonKey.split("-").map(Number);
  const year = Number.isFinite(yearValue) ? yearValue : getSeasonDateParts().year;
  const month = Number.isFinite(monthValue) && monthValue >= 1 && monthValue <= 12 ? monthValue : 1;
  return `Season ${INDONESIAN_MONTHS[month - 1]} ${year}`;
}

export function getPreviousSeasonKey(date: Date = new Date()) {
  const { year, month } = getSeasonDateParts(date);
  return getSeasonKey(new Date(Date.UTC(year, month - 2, 15, 12)));
}

export function getSeasonCountdown(date: Date = new Date()) {
  const parts = getSeasonDateParts(date);
  const currentWholeSecond = date.getTime() - date.getUTCMilliseconds();
  const localWallClock = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  const zoneOffset = localWallClock - currentWholeSecond;
  const nextMonthStart = Date.UTC(parts.year, parts.month, 1) - zoneOffset;
  const diffMs = Math.max(0, nextMonthStart - date.getTime());

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const daysInMonth = new Date(Date.UTC(parts.year, parts.month, 0)).getUTCDate();
  const elapsed = (parts.day - 1 + (parts.hour * 3600 + parts.minute * 60 + parts.second) / 86400) / daysInMonth;

  return {
    seasonKey: `${parts.year}-${String(parts.month).padStart(2, "0")}`,
    seasonName: `Season ${INDONESIAN_MONTHS[parts.month - 1]} ${parts.year}`,
    days,
    hours,
    minutes,
    seconds,
    progress: Math.min(100, Math.max(0, Math.round(elapsed * 100))),
    endOfMonth: new Date(nextMonthStart),
    formatted: `${String(days).padStart(2, "0")} Hari ${String(hours).padStart(2, "0")} Jam ${String(minutes).padStart(2, "0")} Menit`,
  };
}