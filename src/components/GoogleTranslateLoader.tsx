'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslateLoader() {
  useEffect(() => {
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,gu,ta,te,kn,bn',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_element'
        );
        console.log('✅ Google Translate initialized');
      }
    };
  }, []);

  return (
    <>
      {/* Hidden Google Translate widget */}
      <div 
        id="google_translate_element" 
        style={{ 
          display: 'none',
          visibility: 'hidden',
          position: 'fixed',
          top: '-9999px',
          left: '-9999px'
        }} 
      />

      {/* Load Google Translate script */}
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => console.log('📜 Google Translate script loaded')}
        onError={() => console.error('❌ Failed to load Google Translate')}
      />

      {/* Hide all Google Translate UI elements */}
      <style jsx global>{`
        /* Hide Google Translate banner and toolbar */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        
        .goog-te-banner-frame {
          display: none !important;
        }
        
        /* Prevent body shift when Google Translate loads */
        body {
          top: 0 !important;
          position: static !important;
        }
        
        body.translated-ltr,
        body.translated-rtl {
          top: 0 !important;
          margin-top: 0 !important;
        }
        
        /* Hide iframe and widgets */
        .skiptranslate {
          display: none !important;
        }
        
        iframe.skiptranslate {
          display: none !important;
        }
        
        iframe.goog-te-banner-frame {
          display: none !important;
        }
        
        iframe.goog-te-menu-frame {
          display: none !important;
        }
        
        /* Hide Google Translate widget elements */
        .goog-te-gadget {
          display: none !important;
        }
        
        .goog-te-combo {
          display: none !important;
        }
        
        .goog-logo-link {
          display: none !important;
        }
        
        .goog-te-spinner-pos {
          display: none !important;
        }
        
        #goog-gt-tt {
          display: none !important;
        }
        
        .goog-te-balloon-frame {
          display: none !important;
        }
        
        /* Hide Google Translate element completely */
        #google_translate_element {
          display: none !important;
        }
        
        /* Hide all Google branding */
        .goog-te-gadget span {
          display: none !important;
        }
        
        .goog-te-gadget img {
          display: none !important;
        }
        
        .goog-te-menu-value {
          display: none !important;
        }
        
        .goog-te-menu-value span {
          display: none !important;
        }
        
        /* Ensure proper z-index for translated content */
        body > .skiptranslate {
          display: none !important;
        }
      `}</style>
    </>
  );
}
