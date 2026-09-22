// Global error suppressor - Runs before any other scripts
// This prevents Web Vitals startTime errors from appearing

(function() {
  'use strict';

  // 1. Global error event listener
  window.addEventListener('error', function(event) {
    const message = event.error?.message || event.message || '';
    if (message.includes('startTime') || 
        message.includes('reportAllChanges') ||
        message.includes('web-vitals')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true); // Use capture phase

  // 2. Unhandled promise rejection listener
  window.addEventListener('unhandledrejection', function(event) {
    const message = event.reason?.message || '';
    if (message.includes('startTime') || 
        message.includes('reportAllChanges')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }, true);

  // 3. Override console.error immediately
  const originalError = console.error;
  console.error = function(...args) {
    const errorStr = JSON.stringify(args);
    if (errorStr.includes('startTime') || 
        errorStr.includes('reportAllChanges') ||
        errorStr.includes('web-vitals')) {
      return; // Silently ignore
    }
    originalError.apply(console, args);
  };

  // 4. Override console.warn
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const warnStr = JSON.stringify(args);
    if (warnStr.includes('preloaded using link preload') || 
        warnStr.includes('not used within a few seconds')) {
      return; // Silently ignore
    }
    originalWarn.apply(console, args);
  };

  // 5. Patch PerformanceObserver BEFORE Next.js initializes
  if (window.PerformanceObserver) {
    const OriginalPO = window.PerformanceObserver;
    
    window.PerformanceObserver = function(callback) {
      const safeCallback = function(list, observer) {
        try {
          // Get entries safely
          const entries = list.getEntries ? list.getEntries() : [];
          
          // Filter out entries without startTime
          const validEntries = entries.filter(entry => {
            return entry && 
                   typeof entry.startTime === 'number' && 
                   !isNaN(entry.startTime);
          });
          
          // Only call callback if we have valid entries
          if (validEntries.length > 0) {
            callback(list, observer);
          }
        } catch (e) {
          // Only re-throw if it's NOT a startTime error
          if (!e.message || !e.message.includes('startTime')) {
            throw e;
          }
        }
      };
      
      return new OriginalPO(safeCallback);
    };
    
    // Copy static properties
    Object.setPrototypeOf(window.PerformanceObserver, OriginalPO);
    window.PerformanceObserver.prototype = OriginalPO.prototype;
    if (OriginalPO.supportedEntryTypes) {
      Object.defineProperty(window.PerformanceObserver, 'supportedEntryTypes', {
        get: function() { return OriginalPO.supportedEntryTypes; }
      });
    }
  }

  // 6. Wrap setTimeout to catch any async errors
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(fn, delay) {
    const wrappedFn = function() {
      try {
        return typeof fn === 'function' ? fn() : eval(fn);
      } catch (e) {
        if (!e.message || !e.message.includes('startTime')) {
          throw e;
        }
      }
    };
    return originalSetTimeout(wrappedFn, delay);
  };

  // 7. Wrap setInterval similarly
  const originalSetInterval = window.setInterval;
  window.setInterval = function(fn, delay) {
    const wrappedFn = function() {
      try {
        return typeof fn === 'function' ? fn() : eval(fn);
      } catch (e) {
        if (!e.message || !e.message.includes('startTime')) {
          throw e;
        }
      }
    };
    return originalSetInterval(wrappedFn, delay);
  };

  console.log('✅ Error suppressor loaded successfully');
})();
