import { format, parse, isWithinInterval, parseISO, startOfDay, endOfDay, addMinutes, differenceInMinutes, isBefore, isAfter } from 'date-fns';

/**
 * Format HH:mm string into 12h (e.g., 08:00 -> 8:00 AM) or 24h format
 */
export function formatTimeDisplay(time24: string, format12h: boolean = true): string {
  if (!time24) return '';
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const date = parse(`${todayStr} ${time24}`, 'yyyy-MM-dd HH:mm', new Date());
    return format(date, format12h ? 'h:mm a' : 'HH:mm');
  } catch (e) {
    return time24;
  }
}

/**
 * Get current date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get current time string in HH:mm 24h format
 */
export function getCurrentTimeString(): string {
  return format(new Date(), 'HH:mm');
}

/**
 * Check if today is between startDate and optional endDate (inclusive)
 */
export function isDateInActiveRange(startDateStr: string, endDateStr?: string | null, targetDate: Date = new Date()): boolean {
  try {
    const start = startOfDay(parseISO(startDateStr));
    const target = startOfDay(targetDate);
    
    if (isBefore(target, start)) {
      return false;
    }
    
    if (endDateStr) {
      const end = endOfDay(parseISO(endDateStr));
      if (isAfter(target, end)) {
        return false;
      }
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Format YYYY-MM-DD to readable date like "Sep 9, 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format full date ISO string to readable time and date
 */
export function formatDateTimeDisplay(isoStr: string, format12h: boolean = true): string {
  if (!isoStr) return '';
  try {
    const date = parseISO(isoStr);
    const timeFmt = format12h ? 'h:mm a' : 'HH:mm';
    return format(date, `MMM d, ${timeFmt}`);
  } catch (e) {
    return isoStr;
  }
}

/**
 * Calculate minutes difference between current time and scheduled time today
 */
export function getMinutesPastScheduled(scheduledTimeHHmm: string): number {
  try {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const scheduledDate = parse(`${todayStr} ${scheduledTimeHHmm}`, 'yyyy-MM-dd HH:mm', new Date());
    return differenceInMinutes(now, scheduledDate);
  } catch (e) {
    return 0;
  }
}

/**
 * Get greeting based on time of day
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning 👋';
  if (hour < 17) return 'Good Afternoon ☀️';
  if (hour < 21) return 'Good Evening 🌙';
  return 'Good Night 💤';
}
