import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Generate a random password
export function generatePassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Hash a password
export async function hashPassword(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Compare a password with a hash
export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Generate a reset token
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}