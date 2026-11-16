import { HttpError } from './http-error.js';

export type ErrorKind = 'abort' | 'timeout' | 'http' | 'network';

export function classifyError(error: unknown): ErrorKind {
  if (error instanceof DOMException && error.name === 'AbortError') return 'abort';
  if (error instanceof DOMException && error.name === 'TimeoutError') return 'timeout';
  if (error instanceof HttpError) return 'http';
  return 'network';
}
