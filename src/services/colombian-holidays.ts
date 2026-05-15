function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function nextMonday(d: Date): Date {
  const result = new Date(d);
  const dow = result.getDay();
  if (dow !== 1) {
    result.setDate(result.getDate() + (7 - dow + 1) % 7 || 7);
  }
  return result;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function getColombianHolidays(year: number): Date[] {
  const fixedHolidays: [number, number, boolean][] = [
    [1, 1, false],
    [5, 1, false],
    [7, 20, false],
    [8, 7, false],
    [12, 8, false],
    [12, 25, false],
    [1, 6, true],
    [3, 19, true],
    [6, 29, true],
    [8, 15, true],
    [10, 12, true],
    [11, 1, true],
    [11, 11, true],
  ];

  const easter = easterDate(year);

  const movableHolidays: Date[] = [
    addDays(easter, -3),
    addDays(easter, -2),
    addDays(easter, 43),
    addDays(easter, 64),
    addDays(easter, 71),
  ];

  const holidays: Date[] = [];

  for (const [month, day, emiliani] of fixedHolidays) {
    const d = new Date(year, month - 1, day);
    if (emiliani) {
      holidays.push(nextMonday(d));
    } else {
      const dow = d.getDay();
      if (dow === 0 || dow === 6) {
        holidays.push(nextMonday(d));
      } else {
        holidays.push(d);
      }
    }
  }

  for (const d of movableHolidays) {
    holidays.push(d);
  }

  return holidays.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
}

const holidayCache = new Map<number, Set<string>>();

function getHolidaySet(year: number): Set<string> {
  if (holidayCache.has(year)) return holidayCache.get(year)!;
  const holidays = getColombianHolidays(year);
  const set = new Set(holidays.map(d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`));
  holidayCache.set(year, set);
  return set;
}

export function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const set = getHolidaySet(year);
  return set.has(`${year}-${date.getMonth() + 1}-${date.getDate()}`);
}
