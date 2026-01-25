import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Robust date formatter to replace 'formatDate'
 * Handles nulls and invalid strings from the backend
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (!isValid(d)) return 'N/A';
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (!isValid(d)) return 'some time ago';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
