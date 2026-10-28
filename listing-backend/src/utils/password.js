import bcrypt from 'bcryptjs';

export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!minLength) return { isValid: false, message: 'Password must be at least 8 characters long' };
  if (!hasUpper) return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  if (!hasLower) return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  if (!hasNumber) return { isValid: false, message: 'Password must contain at least one number' };
  if (!hasSpecial) return { isValid: false, message: 'Password must contain at least one special character' };

  return { isValid: true };
};
