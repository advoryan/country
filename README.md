# Country Search

Live country search over [countries.dev](https://countries.dev) with real request cancellation via `AbortController`.

See [DESIGN.md](DESIGN.md) for architecture notes.

## Scripts

```bash
npm install
npm test         # vitest
npm run lint     # eslint
npm run format   # prettier
npm run build    # tsc -> dist/
```

After `npm run build`, serve the project root with any static server and open `index.html`.
