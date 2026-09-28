'use client';

import { useState, useEffect, useRef } from 'react';
import { Languages } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    const lang = languages.find(l => l.code === savedLang) || languages[0];
    setCurrentLanguage(lang);

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="translate.google.com"]');
    if (existingScript || scriptLoadedRef.current) {
      setIsScriptLoaded(true);
      return;
    }

    // Load Google Translate script
    scriptLoadedRef.current = true;
    
    // Initialize Google Translate callback
    window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,gu,ta,te,kn,bn',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsScriptLoaded(true);
        console.log('✅ Google Translate initialized successfully');
        
        // Apply saved language after initialization
        setTimeout(() => {
          if (savedLang !== 'en') {
            triggerTranslation(savedLang);
          }
        }, 1000);
      } catch (error) {
        console.error('❌ Google Translate initialization error:', error);
      }
    };

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      console.error('❌ Failed to load Google Translate script');
      scriptLoadedRef.current = false;
    };
    document.body.appendChild(script);

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const triggerTranslation = (langCode: string) => {
    // Method 1: Try using the select element
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      console.log('🔄 Triggering translation via select element to:', langCode);
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    // Method 2: Try using iframe approach
    const iframe = document.querySelector('iframe.goog-te-menu-frame') as HTMLIFrameElement;
    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const langLink = iframeDoc.querySelector(`a[data-language-code="${langCode}"]`) as HTMLElement;
          if (langLink) {
            console.log('🔄 Triggering translation via iframe link to:', langCode);
            langLink.click();
            return true;
          }
        }
      } catch (error) {
        console.error('Cannot access iframe:', error);
      }
    }

    // Method 3: Direct cookie manipulation
    console.log('🔄 Triggering translation via cookie to:', langCode);
    const cookieValue = langCode === 'en' ? '' : `/en/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    
    // Reload to apply translation
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
    return true;
  };

  const changeLanguage = (lang: Language) => {
    console.log('🌐 Changing language to:', lang.name, '(' + lang.code + ')');
    setIsTranslating(true);
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang.code);

    if (!isScriptLoaded) {
      console.warn('⚠️ Google Translate not loaded yet');
      alert('Translation service is loading. Please try again in a moment.');
      setIsTranslating(false);
      return;
    }

    // Try to trigger translation
    const success = triggerTranslation(lang.code);
    
    if (!success) {
      console.error('❌ Failed to trigger translation');
    }
    
    // Wait for translation to complete
    setTimeout(() => {
      setIsTranslating(false);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div 
        id="google_translate_element" 
        style={{ display: 'none' }}
      />

      {/* Language Switcher Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 text-gray-700 hover:bg-purple-50 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-transparent hover:border-purple-200 active:scale-95"
          aria-label="Change language"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Languages className="w-6 h-6" strokeWidth={2} />
          )}
          
          {/* Current Language Badge */}
          <span className="absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 bg-purple-600 text-white text-[8px] font-bold rounded-full shadow-md border border-white">
            {currentLanguage.code.toUpperCase()}
          </span>
        </button>

        {/* Language Dropdown */}
        {isOpen && (
          <div className="fixed top-20 right-4 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 z-[99999] overflow-hidden animate-scale-in">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-600" />
                Select Language
              </h4>
              <p className="text-[10px] text-gray-600 mt-0.5">Choose your preferred language</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang)}
                  disabled={isTranslating}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    currentLanguage.code === lang.code
                      ? 'bg-purple-100 text-purple-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-sm flex-1">{lang.name}</span>
                  {currentLanguage.code === lang.code && (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-gray-200 bg-gray-50">
              <p className="text-[10px] text-gray-500 text-center">
                Powered by Google Translate
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hide Google Translate toolbar and elements */}
      <style jsx global>{`
        .goog-te-banner-frame {
          display: none !important;
        }
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0 !important;
          position: static !important;
        }
        .skiptranslate {
          display: none !important;
        }
        .goog-logo-link {
          display: none !important;
        }
        .goog-te-gadget {
          color: transparent !important;
          font-size: 0 !important;
        }
        .goog-te-gadget > span {
          display: none !important;
        }
        .goog-te-combo {
          display: none !important;
        }
        #google_translate_element {
          display: none !important;
        }
        .goog-te-spinner-pos {
          display: none !important;
        }
        /* Hide the translation menu frame */
        iframe.goog-te-menu-frame {
          display: none !important;
        }
        /* Force body to stay in place */
        body.translated-ltr {
          top: 0 !important;
        }
        body.translated-rtl {
          top: 0 !important;
        }
      `}</style>
    </>
  );
}
