# 汉韵写真 / Han Portrait

AI Hanfu portrait generator for creating studio-quality Hanfu portraits from a single photo.

## What this project is

**汉韵写真** is a SaaS product for AI Hanfu portrait generation.

The product helps users create professional-looking Hanfu portraits without renting costumes, booking a studio, or traveling to China.

English brand name: **Han Portrait**
Chinese brand name: **汉韵写真**

## Current product direction

The current focus is a desktop-first SaaS experience:

- Landing page with premium Chinese visual style
- AI Hanfu portrait workspace
- Template-first generation flow
- User authentication
- Credit-based generation system
- Chinese and English localization

## Core user flow

1. User visits the landing page.
2. User clicks the main CTA to try the product.
3. If not logged in, user is sent to login.
4. After login, user enters the generation workspace.
5. User chooses a portrait template.
6. User uploads a photo.
7. AI generates the Hanfu portrait.
8. User previews and saves the result.

## Tech stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Better Auth
- PostgreSQL + Drizzle ORM
- next-intl
- Credit-based account system

## Local development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Run lint:

```bash
pnpm lint
```

Database commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```

## Important product rules

- Chinese brand name must be `汉韵写真`.
- English brand name must be `Han Portrait`.
- Homepage uses the floating capsule navbar.
- Generate/workspace pages use the left sidebar, not the homepage navbar.
- Do not remove auth, credits, billing, database, protected layout, or i18n without checking dependencies first.

## Cleanup note

This project was originally built from a production SaaS starter. Some starter features may still exist in the codebase. Cleanup should be done carefully in small batches so auth, credits, billing, and generation flows stay stable.
