// Node.js polyfills that must be loaded before any other modules
// This ensures browser globals are available in the Node.js environment

// Only apply polyfills in Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Polyfill 'self' global immediately
  if (typeof self === 'undefined') {
    global.self = global;
  }
  
  // Ensure globalThis has self
  if (typeof globalThis !== 'undefined') {
    globalThis.self = global;
  }
  
  // Polyfill other common browser globals
  if (typeof window === 'undefined') {
    global.window = global;
  }
  
  if (typeof document === 'undefined') {
    // Create a mock element with common DOM methods
    const mockElement = {
      setAttribute: () => {},
      getAttribute: () => null,
      removeAttribute: () => {},
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false,
        toggle: () => {}
      }
    };

    global.document = {
      createElement: () => mockElement,
      createTextNode: () => mockElement,
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      documentElement: { ...mockElement, style: {} },
      body: { ...mockElement, style: {} }
    };
  }
  
  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js',
      platform: 'Node.js'
    };
  }
  
  if (typeof location === 'undefined') {
    global.location = {
      protocol: 'http:',
      hostname: 'localhost',
      port: '3000',
      host: 'localhost:3000',
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: ''
    };
  }

  // Polyfill MutationObserver
  if (typeof MutationObserver === 'undefined') {
    global.MutationObserver = class MutationObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      disconnect() {}
      takeRecords() { return []; }
    };
  }
}
