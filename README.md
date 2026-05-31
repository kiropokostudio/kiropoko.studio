# KiroPoko Studio

Next.js + TypeScript site for the Kiro & Poko Studio multilingual story catalog.

## Structure

- `content/stories`: file-based story metadata and translations
- `public/stories`: optimized public story assets
- `src/app/[lang]`: localized public routes
- `src/components`: reusable reading and navigation components
- `src/lib`: story loading, i18n, and SEO helpers

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
```

The dev server uses port `5050` by default. The first published story is available at `/ko/stories/kiro-poko`.
