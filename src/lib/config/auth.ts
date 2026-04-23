/**
 * Authentication Configuration
 * Centralized configuration for authentication-related settings
 */

export const AUTH_CONFIG = {
  // Default passwords from environment variables
  defaultStudentPassword: process.env.DEFAULT_STUDENT_PASSWORD || 'default123',
  defaultStaffPassword: process.env.DEFAULT_STAFF_PASSWORD || 'foster@123',
  
  // Password requirements
  passwordMinLength: 8,
  requirePasswordChange: false, // Set to true to force password change on first login
  
  // Session settings
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

/**
 * Get the default password for a given role
 * @param role - User role number (19 for student, 6 for faculty, 8 for admin)
 * @returns Default password for the role
 */
export function getDefaultPassword(role: number): string {
  if (role === 19) {
    return AUTH_CONFIG.defaultStudentPassword;
  }
  // Faculty (6) and Admin (8) use the same default password
  return AUTH_CONFIG.defaultStaffPassword;
}
