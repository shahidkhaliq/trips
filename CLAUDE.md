# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

This is a Next.js 16 application using React 19, Tailwind CSS v4, and shadcn/ui components. The project uses Bun as the package manager and runtime.

## Common Commands

```bash
# Development
bun run dev              # Start dev server with Turbopack on http://localhost:3000

# Building
bun run build            # Create production build
bun run start            # Start production server

# Testing
bun run test             # Run unit tests with Vitest
bun run test -- --watch  # Run tests in watch mode
bun run test:ui          # Run tests with Vitest UI
bun run test:e2e         # Run E2E tests with Playwright
bun run test:e2e:ui      # Run E2E tests with Playwright UI

# Linting & Formatting
bun run lint             # Check code with Biome
bun run lint:fix         # Auto-fix linting issues
bun run format           # Format code with Biome

# Docker
bun run docker:dev       # Start development container
bun run docker:prod      # Start production container
```

## Architecture

- **App Router**: All pages are in `src/app/` using Next.js App Router
- **Components**: Reusable components in `src/components/`, shadcn/ui components in `src/components/ui/`
- **Utilities**: Shared utilities in `src/lib/`
- **Tests**: Unit tests in `tests/unit/`, E2E tests in `tests/e2e/`

## Code Style

- **Formatter**: Biome with tabs, double quotes, semicolons
- **Imports**: Auto-organized by Biome
- **Path aliases**: Use `@/` to import from `src/` (e.g., `import { Button } from "@/components/ui/button"`)

## Adding shadcn/ui Components

```bash
bunx shadcn@latest add [component-name]
```

## Testing Conventions

- Unit tests use Vitest + React Testing Library
- E2E tests use Playwright
- Test files: `*.test.tsx` for unit, `*.spec.ts` for E2E

