# Deployment

This guide covers building and deploying HonestJS applications.

## Build & Run

Projects created with the CLI include `build` and `start` scripts:

```bash
bun run build    # compile for production
bun run start    # start the production server
```

The application listens on the port configured by your environment (`PORT` env
variable, defaulting to 3000).

## Environment Variables

Configure these in your deployment platform:

| Variable       | Purpose                                | Default     |
| -------------- | -------------------------------------- | ----------- |
| `PORT`         | Server listen port                     | `3000`      |
| `NODE_ENV`     | Environment mode                       | `undefined` |
| `DATABASE_URL` | Database connection string (if needed) | -           |

## Docker

Docker configuration is **optional**. To include it when scaffolding:

```bash
honestjs new my-app --docker
```

This generates a `Dockerfile` (and optionally `docker-compose.yml`). If you
didn't enable Docker during project creation, you can add a `Dockerfile`
manually:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
```

### Build and run

```bash
docker build -t my-honestjs-app .
docker run -p 3000:3000 my-honestjs-app
```

## Health Checks

Add a health endpoint to your application for load balancers and orchestrators:

```typescript
import { Controller, Get, VERSION_NEUTRAL } from "honestjs";

@Controller("health", { version: VERSION_NEUTRAL })
class HealthController {
	@Get()
	check() {
		return { status: "ok", timestamp: new Date().toISOString() };
	}
}
```

Using `VERSION_NEUTRAL` ensures the health endpoint is accessible regardless of
API versioning configuration.

## Platform Guides

### Railway / Render / Fly.io

These platforms auto-detect Bun projects. Set the start command to
`bun run start` and they handle the rest.

### Vercel

1. Connect your repository
2. Set build command: `bun run build`
3. Set output directory: `dist` (if applicable)
4. Deploy

### Cloudflare Workers

HonestJS runs on Hono, which has native Cloudflare Workers support. Export the
Hono instance from your entry file:

```typescript
export default hono;
```

Then configure `wrangler.toml` to point at your entry file.

## Production Considerations

- **Enable secure headers** - use `@honestjs/middleware`'s
  `SecureHeadersMiddleware` or Hono's built-in secure headers
- **Use HTTPS** - terminate TLS at your load balancer or reverse proxy
- **Validate all inputs** - use guards and pipes for authentication and
  validation
- **Use structured logging** - pass a custom `logger` in `HonestOptions` for
  production-grade log output
- **Set `NODE_ENV=production`** - some middleware and error handling adapts
  behavior based on this
