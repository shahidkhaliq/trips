# Trips

[![Tests](https://github.com/shahidkhaliq/trips/actions/workflows/test.yml/badge.svg)](https://github.com/shahidkhaliq/trips/actions/workflows/test.yml)

A modern Next.js application with React 19, shadcn/ui, and comprehensive tooling.

## Tech Stack

- **Framework**: Next.js 16 with App Router & Turbopack
- **Runtime**: React 19
- **Package Manager**: Bun
- **UI Components**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Containerization**: Docker with multi-stage builds

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [Docker](https://www.docker.com/) (optional, for containerized development)

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with Turbopack |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Check code with Biome |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code with Biome |
| `bun run test` | Run unit tests with Vitest |
| `bun run test:ui` | Run unit tests with Vitest UI |
| `bun run test:e2e` | Run E2E tests with Playwright |
| `bun run test:e2e:ui` | Run E2E tests with Playwright UI |
| `bun run docker:dev` | Start development in Docker |
| `bun run docker:prod` | Start production in Docker |

## Testing

### Unit Tests

```bash
# Run tests
bun run test

# Run tests in watch mode
bun run test -- --watch

# Run tests with UI
bun run test:ui

# Run with coverage
bun run test -- --coverage
```

### E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui

# Run specific test file
bun run test:e2e -- tests/e2e/home.spec.ts
```

## Docker

### Development

```bash
# Start development container with hot reload
bun run docker:dev
```

### Production

```bash
# Build and start production container
bun run docker:prod
```

### Manual Docker Commands

```bash
# Build development image
docker build -f docker/Dockerfile --target development -t trips:dev .

# Build production image
docker build -f docker/Dockerfile --target production -t trips:prod .

# Run production container
docker run -p 3000:3000 trips:prod
```

## Project Structure

```
trips/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   └── lib/
│       └── utils.ts            # Utility functions
├── tests/
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright E2E tests
├── docker/
│   ├── Dockerfile              # Multi-stage Docker build
│   └── docker-compose.yml      # Docker Compose services
├── biome.json                  # Biome configuration
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
└── components.json             # shadcn/ui configuration
```

## Adding shadcn/ui Components

```bash
# Add a component
bunx shadcn@latest add [component-name]

# Example: Add dialog component
bunx shadcn@latest add dialog
```

## License

MIT
