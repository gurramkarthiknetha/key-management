// Polyfills for server-side rendering

if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

if (typeof window === 'undefined') {
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
    }
  };
}

if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'Node.js',
    platform: 'Node.js'
  };
}
