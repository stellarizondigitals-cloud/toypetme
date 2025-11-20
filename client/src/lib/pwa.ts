export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered successfully');
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            const existingWorker = navigator.serviceWorker.controller;
            
            if (newWorker && existingWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && registration.waiting) {
                  if (confirm('A new version is available! Reload to update?')) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready.then((registration) => {
      return registration.unregister();
    });
  }
  return Promise.resolve(false);
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}
