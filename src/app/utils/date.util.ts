/**
 * `yyyy-mm-dd` in LOCAL time — the only format a native `<input type="date">`
 * accepts. Anything else (a `Date` object, a full ISO datetime) makes the input
 * render blank, silently, which is how a populated form ends up looking empty.
 *
 * Local getters on purpose: the API stores dates at UTC midnight, and reading
 * them back in UTC+8 gives the intended day. Returns `''` for a missing or
 * unparseable value so the field just shows empty.
 */
export const toISODateOnly = (value?: Date | string | null): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const convertToAmericanFormat = (date: Date) => date.toLocaleString().split(',')[0];

export const get24HourTime = (
  isodate: string = new Date().toISOString(),
  roundToHour: boolean = true,
  addHours: number = 0
) => {
  const date = new Date(isodate);

  if (roundToHour) {
    date.setUTCMinutes(0, 0, 0); // 18:25 → 18:00
  }

  if (addHours) {
    date.setUTCHours(date.getUTCHours() + addHours);
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Combines a `yyyy-mm-dd` date with an `HH:mm` time into a UTC ISO timestamp.
 *
 * The parts are fed to the `Date` constructor rather than `new Date(date)`,
 * because `new Date('2026-08-31')` is parsed as midnight **UTC** — which is
 * still the previous day anywhere west of Greenwich, so `setHours` would then
 * land on the wrong date. Passing the numbers builds it in local time, which is
 * what the user picked.
 */
export const concatDateAndTime = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
};
