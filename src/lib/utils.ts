import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Arabic
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format time to Arabic
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-TN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format date and time to Arabic
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format currency (Tunisian Dinar)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-TN', {
    style: 'currency',
    currency: 'TND',
  }).format(amount);
}

/**
 * Format duration in seconds to readable Arabic
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة ${secs > 0 ? ` ${secs} ثانية` : ''}`;
  } else {
    return `${secs} ثانية`;
  }
}

/**
 * Get grade level display name in Arabic
 */
export function getGradeName(grade: 'grade_5' | 'grade_6' | 'grade_7'): string {
  const gradeNames = {
    grade_5: 'السنة الخامسة',
    grade_6: 'السنة السادسة',
    grade_7: 'السنة السابعة',
  };
  return gradeNames[grade];
}

/**
 * Get user role display name in Arabic
 */
export function getRoleName(role: 'student' | 'parent' | 'teacher' | 'admin'): string {
  const roleNames = {
    student: 'طالب',
    parent: 'ولي أمر',
    teacher: 'معلم',
    admin: 'مدير',
  };
  return roleNames[role];
}

/**
 * Validate Tunisian phone number
 */
export function isValidTunisianPhone(phone: string): boolean {
  // Tunisian phone: +216 XX XXX XXX or XX XXX XXX
  const phoneRegex = /^(\+216)?[2-9]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('216')) {
    return `+216 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

/**
 * Calculate file size in readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Get initials from Arabic name
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
