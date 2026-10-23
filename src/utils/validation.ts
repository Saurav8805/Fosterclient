/**
 * Form Validation Utilities
 * Centralized validation functions for common input fields
 */

// ============================================================================
// MOBILE NUMBER VALIDATION
// ============================================================================

/**
 * Validates Indian mobile number (10 digits, starts with 6-9)
 * Rejects numbers with all repeated digits for data quality
 * @param mobile - Mobile number string
 * @returns true if valid, error message if invalid
 */
export const validateMobile = (mobile: string): { valid: boolean; error?: string } => {
  // Remove spaces and special characters
  const cleaned = mobile.replace(/[\s\-\(\)]/g, '');
  
  // Check if empty
  if (!cleaned) {
    return { valid: false, error: 'Mobile number is required' };
  }
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Mobile number must contain only digits' };
  }
  
  // Check length (must be exactly 10 digits)
  if (cleaned.length !== 10) {
    return { valid: false, error: 'Mobile number must be exactly 10 digits' };
  }
  
  // Check if starts with valid digit (6, 7, 8, or 9 for Indian numbers)
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, error: 'Mobile number must start with 6, 7, 8, or 9' };
  }
  
  // REJECT numbers with all same digits (e.g., 9999999999, 8888888888)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return { valid: false, error: 'Mobile number cannot have all same digits' };
  }
  
  // All checks passed - mobile number is valid
  return { valid: true };
};

/**
 * Formats mobile number as user types (adds spaces for readability)
 * Example: 9876543210 -> 98765 43210
 */
export const formatMobileInput = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.substring(0, 10);
  
  if (limited.length <= 5) {
    return limited;
  }
  
  return `${limited.substring(0, 5)} ${limited.substring(5)}`;
};

/**
 * Cleans mobile number (removes formatting)
 */
export const cleanMobile = (mobile: string): string => {
  return mobile.replace(/[\s\-\(\)]/g, '');
};

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validates email address format
 * @param email - Email address string
 * @returns true if valid, error message if invalid
 */
export const validateEmail = (email: string, required: boolean = false): { valid: boolean; error?: string } => {
  // If not required and empty, it's valid
  if (!required && !email) {
    return { valid: true };
  }
  
  // Check if empty when required
  if (required && !email) {
    return { valid: false, error: 'Email is required' };
  }
  
  // Trim whitespace
  const trimmed = email.trim();
  
  // Check basic format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = trimmed.split('@')[1]?.toLowerCase();
  
  // Check for suspicious patterns
  if (domain) {
    // Check for double dots
    if (domain.includes('..')) {
      return { valid: false, error: 'Invalid email format (double dots)' };
    }
    
    // Check for missing TLD
    if (!domain.includes('.')) {
      return { valid: false, error: 'Email must include domain extension (e.g., .com)' };
    }
  }
  
  return { valid: true };
};

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Validates date field
 * @param date - Date string (YYYY-MM-DD format)
 * @param options - Validation options
 * @returns true if valid, error message if invalid
 */
export const validateDate = (
  date: string,
  options: {
    required?: boolean;
    minDate?: Date | string;
    maxDate?: Date | string;
    futureOnly?: boolean;
    pastOnly?: boolean;
    label?: string;
  } = {}
): { valid: boolean; error?: string } => {
  const label = options.label || 'Date';
  
  // Check if required
  if (options.required && !date) {
    return { valid: false, error: `${label} is required` };
  }
  
  // If not required and empty, valid
  if (!options.required && !date) {
    return { valid: true };
  }
  
  // Parse date
  const parsedDate = new Date(date);
  
  // Check if valid date
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: `Invalid ${label.toLowerCase()} format` };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if future only
  if (options.futureOnly && parsedDate < today) {
    return { valid: false, error: `${label} must be in the future` };
  }
  
  // Check if past only
  if (options.pastOnly && parsedDate > today) {
    return { valid: false, error: `${label} cannot be in the future` };
  }
  
  // Check minimum date
  if (options.minDate) {
    const minDate = new Date(options.minDate);
    minDate.setHours(0, 0, 0, 0);
    if (parsedDate < minDate) {
      return { 
        valid: false, 
        error: `${label} must be after ${minDate.toLocaleDateString()}` 
      };
    }
  }
  
  // Check maximum date
  if (options.maxDate) {
    const maxDate = new Date(options.maxDate);
    maxDate.setHours(0, 0, 0, 0);
    if (parsedDate > maxDate) {
      return { 
        valid: false, 
        error: `${label} must be before ${maxDate.toLocaleDateString()}` 
      };
    }
  }
  
  return { valid: true };
};

/**
 * Validates Date of Birth
 * @param dob - Date of Birth string
 * @param minAge - Minimum age requirement (optional)
 * @param maxAge - Maximum age limit (optional)
 */
export const validateDOB = (
  dob: string,
  minAge?: number,
  maxAge?: number
): { valid: boolean; error?: string; age?: number } => {
  // Basic date validation
  const dateResult = validateDate(dob, {
    required: true,
    pastOnly: true,
    label: 'Date of Birth'
  });
  
  if (!dateResult.valid) {
    return dateResult;
  }
  
  // Calculate age
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Check minimum age
  if (minAge !== undefined && age < minAge) {
    return { 
      valid: false, 
      error: `Student must be at least ${minAge} years old (currently ${age})`,
      age 
    };
  }
  
  // Check maximum age
  if (maxAge !== undefined && age > maxAge) {
    return { 
      valid: false, 
      error: `Age cannot exceed ${maxAge} years (currently ${age})`,
      age 
    };
  }
  
  return { valid: true, age };
};

/**
 * Validates due date (must be in future)
 */
export const validateDueDate = (dueDate: string): { valid: boolean; error?: string } => {
  return validateDate(dueDate, {
    required: true,
    futureOnly: true,
    label: 'Due date'
  });
};

/**
 * Validates joining date (can be past or present)
 */
export const validateJoiningDate = (joiningDate: string): { valid: boolean; error?: string } => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3); // Allow up to 3 months in future
  
  return validateDate(joiningDate, {
    required: false,
    maxDate: maxDate,
    label: 'Joining date'
  });
};

// ============================================================================
// COMBINED VALIDATION
// ============================================================================

/**
 * Validate entire form and return all errors
 */
export const validateForm = (
  fields: Array<{
    name: string;
    value: any;
    type: 'mobile' | 'email' | 'date' | 'dob' | 'text';
    required?: boolean;
    options?: any;
  }>
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  fields.forEach(field => {
    let result: { valid: boolean; error?: string };
    
    switch (field.type) {
      case 'mobile':
        if (field.required || field.value) {
          result = validateMobile(field.value);
          if (!result.valid) errors[field.name] = result.error!;
        }
        break;
        
      case 'email':
        result = validateEmail(field.value, field.required);
        if (!result.valid) errors[field.name] = result.error!;
        break;
        
      case 'date':
        result = validateDate(field.value, { required: field.required, ...field.options });
        if (!result.valid) errors[field.name] = result.error!;
        break;
        
      case 'dob':
        result = validateDOB(field.value, field.options?.minAge, field.options?.maxAge);
        if (!result.valid) errors[field.name] = result.error!;
        break;
        
      case 'text':
        if (field.required && !field.value?.trim()) {
          errors[field.name] = `${field.name} is required`;
        }
        break;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Show validation error message in UI
 */
export const showError = (fieldName: string, error: string): void => {
  // Can be extended to show toast notifications
  console.error(`Validation error for ${fieldName}:`, error);
};

/**
 * Get today's date in YYYY-MM-DD format (for date inputs)
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get date X days from now in YYYY-MM-DD format
 */
export const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Get date X years ago in YYYY-MM-DD format (useful for DOB)
 */
export const getPastDate = (years: number): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().split('T')[0];
};

// ============================================================================
// AADHAR NUMBER VALIDATION
// ============================================================================

/**
 * Validates Aadhar number (12 digits)
 * @param aadhar - Aadhar number string
 * @param required - Whether the field is required
 * @returns validation result
 */
export const validateAadhar = (aadhar: string, required: boolean = false): { valid: boolean; error?: string } => {
  // If not required and empty, it's valid
  if (!required && !aadhar) {
    return { valid: true };
  }
  
  // Check if empty when required
  if (required && !aadhar) {
    return { valid: false, error: 'Aadhar number is required' };
  }
  
  // Remove spaces and special characters
  const cleaned = aadhar.replace(/[\s\-]/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Aadhar must contain only digits' };
  }
  
  // Check length (must be exactly 12 digits)
  if (cleaned.length !== 12) {
    return { valid: false, error: 'Aadhar must be exactly 12 digits' };
  }
  
  // Check for all same digits (invalid Aadhar)
  if (/^(\d)\1{11}$/.test(cleaned)) {
    return { valid: false, error: 'Invalid Aadhar number' };
  }
  
  return { valid: true };
};

/**
 * Format Aadhar number with spaces (XXXX XXXX XXXX)
 */
export const formatAadhar = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.substring(0, 12);
  
  const parts: string[] = [];
  for (let i = 0; i < limited.length; i += 4) {
    parts.push(limited.substring(i, i + 4));
  }
  
  return parts.join(' ');
};

// ============================================================================
// PINCODE VALIDATION
// ============================================================================

/**
 * Validates Indian pincode (6 digits)
 * @param pincode - Pincode string
 * @param required - Whether the field is required
 * @returns validation result
 */
export const validatePincode = (pincode: string, required: boolean = true): { valid: boolean; error?: string } => {
  // If not required and empty, it's valid
  if (!required && !pincode) {
    return { valid: true };
  }
  
  // Check if empty when required
  if (required && !pincode) {
    return { valid: false, error: 'Pincode is required' };
  }
  
  // Remove spaces
  const cleaned = pincode.replace(/\s/g, '');
  
  // Check if contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Pincode must contain only digits' };
  }
  
  // Check length (must be exactly 6 digits)
  if (cleaned.length !== 6) {
    return { valid: false, error: 'Pincode must be exactly 6 digits' };
  }
  
  // Check if starts with 0 (invalid)
  if (cleaned.startsWith('0')) {
    return { valid: false, error: 'Invalid pincode format' };
  }
  
  return { valid: true };
};

// ============================================================================
// ROLL NUMBER VALIDATION
// ============================================================================

/**
 * Validates roll number
 * @param rollNo - Roll number string or number
 * @param required - Whether the field is required
 * @returns validation result
 */
export const validateRollNo = (rollNo: string | number, required: boolean = false): { valid: boolean; error?: string } => {
  const rollNoStr = String(rollNo).trim();
  
  // If not required and empty, it's valid
  if (!required && !rollNoStr) {
    return { valid: true };
  }
  
  // Check if empty when required
  if (required && !rollNoStr) {
    return { valid: false, error: 'Roll number is required' };
  }
  
  // Check if valid number
  const rollNoNum = Number(rollNoStr);
  if (isNaN(rollNoNum)) {
    return { valid: false, error: 'Roll number must be a number' };
  }
  
  // Check if positive integer
  if (rollNoNum <= 0 || !Number.isInteger(rollNoNum)) {
    return { valid: false, error: 'Roll number must be a positive integer' };
  }
  
  // Check reasonable range (1-999)
  if (rollNoNum > 999) {
    return { valid: false, error: 'Roll number cannot exceed 999' };
  }
  
  return { valid: true };
};

// ============================================================================
// LIVE VALIDATION HELPERS
// ============================================================================

/**
 * Live validation for mobile number with real-time feedback
 */
export const liveValidateMobile = (
  value: string,
  setError: (error: string | null) => void
): void => {
  if (!value) {
    setError(null);
    return;
  }
  
  const cleaned = value.replace(/\D/g, '');
  
  // Show real-time errors
  if (cleaned.length > 0 && !/^[6-9]/.test(cleaned)) {
    setError('Must start with 6, 7, 8, or 9');
  } else if (cleaned.length > 0 && cleaned.length < 10) {
    setError(`Enter ${10 - cleaned.length} more digit${10 - cleaned.length > 1 ? 's' : ''}`);
  } else if (cleaned.length === 10 && /^(\d)\1{9}$/.test(cleaned)) {
    setError('Cannot have all same digits');
  } else if (cleaned.length === 10) {
    setError(null); // Valid!
  } else {
    setError(null);
  }
};

/**
 * Live validation for Aadhar number
 */
export const liveValidateAadhar = (
  value: string,
  setError: (error: string | null) => void
): void => {
  if (!value) {
    setError(null);
    return;
  }
  
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length > 0 && cleaned.length < 12) {
    setError(`Enter ${12 - cleaned.length} more digit${12 - cleaned.length > 1 ? 's' : ''}`);
  } else if (cleaned.length === 12 && /^(\d)\1{11}$/.test(cleaned)) {
    setError('Invalid Aadhar number');
  } else if (cleaned.length === 12) {
    setError(null); // Valid!
  } else {
    setError(null);
  }
};

/**
 * Live validation for Pincode
 */
export const liveValidatePincode = (
  value: string,
  setError: (error: string | null) => void
): void => {
  if (!value) {
    setError(null);
    return;
  }
  
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    setError('Pincode cannot start with 0');
  } else if (cleaned.length > 0 && cleaned.length < 6) {
    setError(`Enter ${6 - cleaned.length} more digit${6 - cleaned.length > 1 ? 's' : ''}`);
  } else if (cleaned.length === 6) {
    setError(null); // Valid!
  } else {
    setError(null);
  }
};
