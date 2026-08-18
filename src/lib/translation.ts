/**
 * Translation Client
 * 
 * Handles translation of notifications between English and Marathi
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Language = 'en' | 'mr';

export interface TranslationPreference {
  language: Language;
  label: string;
  flag: string;
}

export const LANGUAGES: Record<Language, TranslationPreference> = {
  en: {
    language: 'en',
    label: 'English',
    flag: '🇬🇧'
  },
  mr: {
    language: 'mr',
    label: 'मराठी',
    flag: '🇮🇳'
  }
};

/**
 * Get user's language preference from localStorage
 */
export function getLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('notificationLanguage') as Language) || 'en';
}

/**
 * Set user's language preference
 */
export function setLanguagePreference(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('notificationLanguage', lang);
}

/**
 * Toggle between English and Marathi
 */
export function toggleLanguage(): Language {
  const current = getLanguagePreference();
  const newLang: Language = current === 'en' ? 'mr' : 'en';
  setLanguagePreference(newLang);
  return newLang;
}

/**
 * Translate single text
 */
export async function translateText(text: string, targetLang: Language = 'mr'): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/translate/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLang })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.translated;
    }
    
    // Return original if translation fails
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

/**
 * Translate notifications array
 */
export async function translateNotifications(
  notifications: any[],
  targetLang: Language = 'mr'
): Promise<any[]> {
  try {
    // If target is English, return originals
    if (targetLang === 'en') {
      return notifications;
    }

    const response = await fetch(`${API_URL}/translate/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notifications, targetLang })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data.notifications;
    }
    
    // Return originals if translation fails
    return notifications;
  } catch (error) {
    console.error('Notifications translation error:', error);
    return notifications;
  }
}

/**
 * Check if translation service is available
 */
export async function isTranslationAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/translate/status`);
    const data = await response.json();
    return data.success && data.data?.enabled;
  } catch (error) {
    console.error('Translation status check error:', error);
    return false;
  }
}
