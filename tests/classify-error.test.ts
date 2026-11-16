import { describe, expect, it } from 'vitest';
import { classifyError } from '../src/classify-error.js';
import { HttpError } from '../src/http-error.js';

describe('classifyError', () => {
  it('treats own cancellation as abort', () => {
    const controller = new AbortController();
    controller.abort();

    expect(classifyError(controller.signal.reason)).toBe('abort');
  });

  it('treats timeout separately from abort', () => {
    expect(classifyError(new DOMException('Timed out', 'TimeoutError'))).toBe('timeout');
  });

  it('treats HttpError as http', () => {
    expect(classifyError(new HttpError(500))).toBe('http');
  });

  it('treats anything else as network', () => {
    expect(classifyError(new TypeError('Failed to fetch'))).toBe('network');
  });
});
