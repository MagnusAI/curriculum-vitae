// Vitest has no built-in equivalent of Jest's auto-cleanup for React
// Testing Library, so each RTL render would otherwise stay mounted into the
// next test in the same file. This is Testing Library's own documented fix:
// https://testing-library.com/docs/react-testing-library/setup#cleanup
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
