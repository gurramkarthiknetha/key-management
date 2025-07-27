// Polyfills for server-side rendering

if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

if (typeof window === 'undefined') {
  global.window = {};
}

if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'Node.js',
    platform: 'Node.js'
  };
}
