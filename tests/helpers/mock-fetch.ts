import { vi } from 'vitest';

interface PendingRequest {
  url: string;
  signal: AbortSignal;
  resolve: (response: Response) => void;
  reject: (error: unknown) => void;
}

export function mockFetch() {
  const requests: PendingRequest[] = [];

  const fetch = vi.fn(
    (url: string, init: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        const signal = init.signal as AbortSignal;
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        requests.push({ url, signal, resolve, reject });
      }),
  );

  vi.stubGlobal('fetch', fetch);

  return { fetch, requests };
}

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });
