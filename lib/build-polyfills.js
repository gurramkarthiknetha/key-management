// Build-time polyfills for Node.js environment
// This file provides essential browser globals that may be referenced during the build process

// Ensure we're in a Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Polyfill for 'self' global - this is the main issue
  if (typeof global !== 'undefined') {
    if (typeof global.self === 'undefined') {
      global.self = global;
    }

    // Also set it on globalThis if available
    if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
      globalThis.self = global;
    }
  }

  // Polyfill for 'globalThis' if not available
  if (typeof globalThis === 'undefined') {
    if (typeof global !== 'undefined') {
      global.globalThis = global;
      global.globalThis.self = global;
    }
  }

  // Additional polyfills for common browser globals that might be referenced
  if (typeof global !== 'undefined') {
    // Window polyfill
    if (typeof global.window === 'undefined') {
      global.window = global;
    }

    // Document polyfill (minimal)
    if (typeof global.document === 'undefined') {
      global.document = {
        createElement: () => ({}),
        getElementById: () => null,
        addEventListener: () => {},
        removeEventListener: () => {},
        documentElement: {
          style: {}
        },
        body: {
          style: {}
        }
      };
    }

    // Navigator polyfill (minimal)
    if (typeof global.navigator === 'undefined') {
      global.navigator = {
        userAgent: 'Node.js',
        platform: 'Node.js'
      };
    }

    // Location polyfill (minimal)
    if (typeof global.location === 'undefined') {
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
  }
}
