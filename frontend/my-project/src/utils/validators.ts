export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

export const validateFile = (
  file: File,
  maxSize: number,
  allowedTypes: string[]
): { valid: boolean; message?: string } => {
  if (file.size > maxSize) {
    return { valid: false, message: `File size must be less than ${maxSize / (1024 * 1024)}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Invalid file type' };
  }

  return { valid: true };
};
