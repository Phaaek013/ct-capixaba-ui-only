export const TIMEZONE = 'America/Sao_Paulo';

function normalizeInputDate(input: Date | string): Date {
  if (input instanceof Date) {
    return new Date(input);
  }

  // Expect ISO date (yyyy-mm-dd); default to noon UTC to avoid DST issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Data inválida: ${input}`);
  }
  return parsed;
}

export function getDayRangeInTZ(input: Date | string, tz: string): { startUtc: Date; endUtc: Date } {
  const base = normalizeInputDate(input);
  const tzBase = new Date(base.toLocaleString('en-US', { timeZone: tz }));
  const diff = base.getTime() - tzBase.getTime();

  const startLocal = new Date(tzBase);
  startLocal.setHours(0, 0, 0, 0);
  const endLocal = new Date(tzBase);
  endLocal.setHours(23, 59, 59, 999);

  return {
    startUtc: new Date(startLocal.getTime() + diff),
    endUtc: new Date(endLocal.getTime() + diff)
  };
}

export function getTodayRangeInTZ(tz: string): { startUtc: Date; endUtc: Date } {
  return getDayRangeInTZ(new Date(), tz);
}

export function startOfDayInTZ(input: Date | string, tz: string): Date {
  return getDayRangeInTZ(input, tz).startUtc;
}
