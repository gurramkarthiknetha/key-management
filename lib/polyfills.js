// Polyfills for server-side rendering
// This file should be imported in components that need browser APIs

// Only run polyfills in server environment
if (typeof window === 'undefined') {
  // Polyfill for 'self' global
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    global.self = global;
  }

  // Polyfill for 'window' global
  if (typeof global.window === 'undefined') {
    global.window = {
      location: {
        protocol: 'http:',
        hostname: 'localhost',
        port: '3000',
        host: 'localhost:3000',
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: ''
      },
      document: {
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      getComputedStyle: () => ({}),
      matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
    };
  }

  // Polyfill for 'navigator' global
  if (typeof global.navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js',
      platform: 'Node.js',
      mediaDevices: {
        getUserMedia: () => Promise.reject(new Error('Camera not available in server environment'))
      }
    };
  }

  // Polyfill for 'document' global
  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: () => ({}),
      getElementById: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      body: {
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
      }
    };
  }
}
