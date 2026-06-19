# AGENTS.md

This file gives coding agents an accurate working map for this repository.

## What this repo is

`hanfu-ai-portrait` is the codebase for **汉韵写真 / Han Portrait**, an AI Hanfu portrait SaaS product.

The product helps users create studio-quality Hanfu portraits from a single photo.

## Brand rules

- Chinese brand name: `汉韵写真`
- English brand name: `Han Portrait`
- Do not write the Chinese name as `汉韵 写真`.
- Do not write the English name as `HanPortrait` in user-facing UI.
- Use `/brand/logo-mark.png` for the main logo asset.

## Current product goals

The current product is focused on:

1. A premium desktop landing page.
2. A template-first AI Hanfu portrait generation workspace.
3. Authentication and user session handling.
4. Credit-based generation.
5. Chinese and English localization.

## Core user flows

### Homepage login flow

- Homepage Login button should send the user to login with callback back to the homepage.
- After login from homepage navigation, the user should return to the homepage.
- Homepage navigation should then show logged-in state.

### Homepage CTA flow

- Homepage CTA should lead users toward the generation workspace.
- If the user is not logged in, send them to login with callback to `/generate`.
- After login, the user should land in the workspace.

### Workspace flow

- Generate/workspace pages should not show the homepage floating capsule navbar.
- Workspace pages use the left sidebar.
- The intended future flow is:
  template gallery → choose template → upload photo → generate → preview result.

## Important implementation notes

- Use `pnpm` for scripts and installs.
- Keep auth, credits, billing, database, protected layout, and i18n stable.
- Do not replace real auth session checks with local mock state.
- Use `useSession` from `@/lib/auth-client` in client components when client-side logged-in UI is needed.
- Protected routes should rely on server-side session checks where appropriate.
- Keep login callback behavior intact.

## Files that are especially sensitive

Do not casually rewrite these files:

- `lib/auth.ts`
- `lib/auth-client.ts`
- `lib/auth/session.ts`
- `lib/db/schema.ts`
- `lib/credits.ts`
- `app/[locale]/(protected)/layout.tsx`
- `app/[locale]/(protected)/generate/page.tsx`
- `features/auth/components/login-form.tsx`
- `features/navigation/components/mini-navbar.tsx`
- `messages/en.json`
- `messages/zh.json`

## Cleanup guidance

This project was originally based on a production SaaS starter. Some unused starter content may still exist.

Safe cleanup examples:

- README starter text
- package metadata
- old brand references
- unused docs/blog/demo content after checking references

Do not delete the following without dependency checks:

- auth
- credits
- billing
- database
- protected layout
- login/signup
- i18n
- generation-related API routes

## Daily commands

- `pnpm dev`
- `pnpm dev:webpack`
- `pnpm lint`
- `pnpm build`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:push`
- `pnpm db:studio`
