import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  const path = require.resolve('tailwindcss');
  console.log('Resolved tailwindcss to:', path);
} catch (e) {
  console.error('Failed to resolve tailwindcss:', e.message);
}
