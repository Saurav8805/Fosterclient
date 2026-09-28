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

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current language from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return '';
    };

    const googtrans = getCookie('googtrans');
    if (googtrans) {
      const langCode = googtrans.split('/')[2];
      const lang = languages.find(l => l.code === langCode);
      if (lang) setCurrentLanguage(lang);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: Language) => {
    // Set Google Translate cookies
    const domain = window.location.hostname;
    const cookieValue = lang.code === 'en' ? '' : `/en/${lang.code}`;
    
    // Clear existing cookies
    document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    // Set new cookies
    if (cookieValue) {
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
      document.cookie = `googtrans=${cookieValue}; path=/`;
    }
    
    setCurrentLanguage(lang);
    setIsOpen(false);
    
    // Reload page to apply translation
    window.location.reload();
  };

  return (
    <>
      {/* Language Switcher Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 text-gray-700 hover:bg-purple-50 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-transparent hover:border-purple-200 active:scale-95"
          aria-label="Change language"
        >
          <Languages className="w-6 h-6" strokeWidth={2} />
          
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
              <p className="text-[10px] text-gray-600 mt-0.5">Page will reload to apply translation</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    currentLanguage.code === lang.code
                      ? 'bg-purple-100 text-purple-900 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
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

      {/* Google Translate Script Loader */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function loadGoogleTranslate() {
              if (window.google && window.google.translate) return;
              
              var script = document.createElement('script');
              script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
              document.body.appendChild(script);
              
              window.googleTranslateElementInit = function() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi,mr,gu,ta,te,kn,bn',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
              };
            }
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', loadGoogleTranslate);
            } else {
              loadGoogleTranslate();
            }
          `,
        }}
      />

      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Hide Google Translate UI */}
      <style jsx global>{`
        /* Hide Google Translate toolbar */
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
        iframe.skiptranslate {
          display: none !important;
        }
        body > .skiptranslate {
          display: none !important;
        }
        /* Hide the widget */
        #google_translate_element {
          display: none !important;
        }
        .goog-te-gadget {
          display: none !important;
        }
        .goog-te-combo {
          display: none !important;
        }
        /* Prevent body shift */
        body.translated-ltr,
        body.translated-rtl {
          top: 0 !important;
          margin-top: 0 !important;
        }
        .goog-te-spinner-pos {
          display: none !important;
        }
      `}</style>
    </>
  );
}
