// Authentication utilities for managing sessions and tokens

interface UserData {
  id: string;
  mobile: string;
  role: number;
  full_name?: string;
  designation?: string;
  assigned_class?: string;
  assigned_section?: string;
  staffId?: string;
  studentId?: string;
}

const SESSION_TOKEN_KEY = 'session_token';
const SESSION_EXPIRY_KEY = 'session_expiry';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Cookie helper functions
function setCookie(name: string, value: string, days: number = 30) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Generate a simple session token
function generateSessionToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Save authentication data
export function saveAuthData(userData: UserData): void {
  try {
    // Generate session token
    const sessionToken = generateSessionToken();
    const expiryTime = Date.now() + SESSION_DURATION;

    // Save to localStorage
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userMobile', userData.mobile);
    localStorage.setItem('userRole', userData.role.toString());
    localStorage.setItem('userName', userData.full_name || userData.mobile);
    localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());

    // Save additional data based on role
    if (userData.designation) {
      localStorage.setItem('userDesignation', userData.designation);
    }
    if (userData.assigned_class) {
      localStorage.setItem('userClass', userData.assigned_class);
    }
    if (userData.assigned_section) {
      localStorage.setItem('userSection', userData.assigned_section);
    }
    if (userData.staffId) {
      localStorage.setItem('staffId', userData.staffId);
    }
    if (userData.studentId) {
      localStorage.setItem('studentId', userData.studentId);
    }

    // Save to cookies for persistence
    setCookie(SESSION_TOKEN_KEY, sessionToken, 30);
    setCookie('userId', userData.id, 30);
    setCookie('userRole', userData.role.toString(), 30);

  } catch (error) {
    console.error('Error saving auth data:', error);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  try {
    // Check localStorage first
    const localToken = localStorage.getItem(SESSION_TOKEN_KEY);
    const localExpiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    
    if (localToken && localExpiry) {
      const expiryTime = parseInt(localExpiry, 10);
      if (Date.now() < expiryTime) {
        return true;
      }
    }

    // Check cookies as fallback
    const cookieToken = getCookie(SESSION_TOKEN_KEY);
    const cookieUserId = getCookie('userId');
    
    if (cookieToken && cookieUserId) {
      // Restore session from cookies to localStorage
      restoreSessionFromCookies();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Restore session from cookies to localStorage
function restoreSessionFromCookies(): void {
  try {
    const cookieToken = getCookie(SESSION_TOKEN_KEY);
    const cookieUserId = getCookie('userId');
    const cookieUserRole = getCookie('userRole');

    if (cookieToken && cookieUserId) {
      localStorage.setItem(SESSION_TOKEN_KEY, cookieToken);
      localStorage.setItem('userId', cookieUserId);
      
      if (cookieUserRole) {
        localStorage.setItem('userRole', cookieUserRole);
      }

      // Set new expiry
      const expiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    }
  } catch (error) {
    console.error('Error restoring session:', error);
  }
}

// Get current user data
export function getCurrentUser(): UserData | null {
  try {
    if (!isAuthenticated()) {
      return null;
    }

    const userId = localStorage.getItem('userId');
    const userMobile = localStorage.getItem('userMobile');
    const userRole = localStorage.getItem('userRole');

    if (!userId || !userMobile || !userRole) {
      return null;
    }

    return {
      id: userId,
      mobile: userMobile,
      role: parseInt(userRole, 10),
      full_name: localStorage.getItem('userName') || undefined,
      designation: localStorage.getItem('userDesignation') || undefined,
      assigned_class: localStorage.getItem('userClass') || undefined,
      assigned_section: localStorage.getItem('userSection') || undefined,
      staffId: localStorage.getItem('staffId') || undefined,
      studentId: localStorage.getItem('studentId') || undefined,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Clear all authentication data
export function clearAuthData(): void {
  try {
    // Clear localStorage
    const keysToRemove = [
      'userId',
      'userMobile',
      'userRole',
      'userName',
      'userDesignation',
      'userClass',
      'userSection',
      'staffId',
      'studentId',
      SESSION_TOKEN_KEY,
      SESSION_EXPIRY_KEY,
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear cookies
    deleteCookie(SESSION_TOKEN_KEY);
    deleteCookie('userId');
    deleteCookie('userRole');

  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

// Refresh session expiry
export function refreshSession(): void {
  try {
    if (isAuthenticated()) {
      const expiryTime = Date.now() + SESSION_DURATION;
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      
      const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
      if (sessionToken) {
        setCookie(SESSION_TOKEN_KEY, sessionToken, 30);
      }
    }
  } catch (error) {
    console.error('Error refreshing session:', error);
  }
}

// Get session token
export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY) || getCookie(SESSION_TOKEN_KEY);
}
