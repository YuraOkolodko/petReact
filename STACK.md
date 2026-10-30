### Stage 1

1. Runtime: Node 26 local per-repository setup config through pnpm
2. Package manager: pnpm 12
3. Language: TypeScript 5, strict ESM
4. Lint/Format: Biome 2
5. Build: Vite 8 (Rolldown)
6. UI: React 19.2 No Compiler
7. Routing: React Router 7
8. Server state: native fetch
9. Client State: native state + Context
10. Styling: SCSS Modules
11. Forms: Native HTML form + Actions
12. API Client: native fetch + use() + Suspense

### Stage 2

1. Unit tests: Vitest
2. E2E tests: Playwright
3. Container: Caddy / Plaform build pack / Static hosting (not decided yet)
4. Hosting: Cloudflare
5. Deployment: GitHub Actions (minimal) / No CI (hooks + auto-deploy) (not decided yet)
