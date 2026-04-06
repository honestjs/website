# FAQ

Answers to common questions and issues when working with HonestJS. For
exhaustive edge-case coverage, see [Troubleshooting](./troubleshooting.md).

## Setup & First Run {#setup--first-run}

> See also: [Getting Started](./getting-started.md) |
> [Configuration](./configuration.md)

### Why do I need `reflect-metadata`?

HonestJS uses TypeScript's `emitDecoratorMetadata` to read constructor parameter
types at runtime, which powers the dependency injection system. The
`reflect-metadata` polyfill makes this metadata available. Import it **once** at
the top of your entry file (`main.ts`) before any HonestJS imports:

```typescript
import "reflect-metadata"; // must be first
import { Application } from "honestjs";
```

Without it, the DI container cannot resolve constructor dependencies and you'll
see errors like `"constructor metadata is missing"`.

### Which template should I use?

| Template     | Use when...                                          |
| ------------ | ---------------------------------------------------- |
| **blank**    | Learning HonestJS or building something minimal      |
| **barebone** | Building an API or a medium-sized app                |
| **mvc**      | Building a full-stack app with server-rendered views |

If you're coming from NestJS or Express and building an API, start with
**barebone**.

### Does HonestJS work with Node.js?

Yes. Bun is recommended for the best experience, but HonestJS runs on Node.js
18+ as well. The CLI (`honestjs doctor`) can check your environment.

### What package managers are supported?

Bun (default), npm, pnpm, and yarn. Specify one with
`honestjs new my-app -p npm`.

## Dependency Injection {#dependency-injection}

> See also: [DI Guide](./concepts/dependency-injection.md) |
> [Troubleshooting: DI](./troubleshooting.md#dependency-injection)

### Why do I get "Cannot resolve dependency at index N"?

The DI container can only inject **concrete classes**. You'll see this error if
a constructor parameter is typed as:

- An **interface** (interfaces don't exist at runtime)
- A **primitive** (`string`, `number`, `boolean`)
- `Object` or `any` (too broad for reflection)

**Fix:** Use a concrete class type for every constructor parameter.

```typescript
// Will fail - interface is erased at runtime
constructor(private userService: IUserService) {}

// Works - concrete class preserved at runtime
constructor(private userService: UserService) {}
```

### Why do I get "not decorated with @Service()"?

Every class that participates in DI must be decorated with `@Service()` and
listed in the module's `services` array.

```typescript
@Service()
class UserService { ... }

@Module({
  controllers: [UserController],
  services: [UserService]   // don't forget this
})
class UserModule {}
```

### How do I handle circular dependencies?

If `ServiceA` depends on `ServiceB` and `ServiceB` depends on `ServiceA`, you'll
see: `"Circular dependency detected: ServiceA -> ServiceB -> ServiceA"`

**Fix:** Refactor to break the cycle. Common strategies:

1. Extract shared logic into a third service
2. Use a facade pattern
3. Restructure so one service doesn't need the other

### Are services singletons?

Yes. By default, all registered services are singletons - the same instance is
shared across the entire application.

## Routing & Versioning {#routing--versioning}

> See also: [Routing Guide](./concepts/routing.md) |
> [Troubleshooting: Routing](./troubleshooting.md#routing--versioning)

### How does API versioning work?

HonestJS supports versioning at three levels, each overriding the previous:

1. **Global** - `routing: { version: 1 }` → all routes get `/v1/...`
2. **Controller** - `@Controller('users', { version: 2 })` → this controller
   uses `/v2/...`
3. **Handler** - `@Get('legacy', { version: 1 })` → this specific route uses
   `/v1/...`

Use `VERSION_NEUTRAL` for routes that should be accessible both with and without
a version prefix (health checks, status endpoints).

### What is `VERSION_NEUTRAL`?

A symbol that tells HonestJS to register a route both with and without a version
prefix. For example, with global `version: 1`:

```typescript
@Controller("health", { version: VERSION_NEUTRAL })
class HealthController {
  @Get("status")
  getStatus() {
    return { status: "ok" };
  }
}
```

This makes `/health/status` **and** `/v1/health/status` both work.

::: tip Deep dive `VERSION_NEUTRAL` actually creates multiple Hono route
registrations per handler (unversioned + versioned). This means
`app.getRoutes()` may return more entries than you expect. See
[Troubleshooting](./troubleshooting.md#version-neutral) for details. :::

### What happens with duplicate routes?

HonestJS detects duplicate routes at startup and throws:
`"Duplicate route detected: GET /api/v1/users (UsersController.getUsers)"`. Fix
by changing the path, prefix, or version on one of the conflicting handlers.

### How do route prefixes combine?

Prefixes are applied in order: **global prefix** → **version** → **controller
route** → **handler path**.

Example with `routing: { prefix: 'api', version: 1 }` and
`@Controller('users')`:

- `@Get()` → `/api/v1/users`
- `@Get(':id')` → `/api/v1/users/:id`
- `@Get(':id/posts')` → `/api/v1/users/:id/posts`

## Pipeline (Middleware, Guards, Pipes, Filters) {#pipeline}

> See also: [Components Overview](./components/overview.md) |
> [Error Handling](./concepts/error-handling.md) |
> [Troubleshooting: Pipeline](./troubleshooting.md#parameters--pipeline)

### What order do components execute in?

```
Global middleware → Controller middleware → Handler middleware
  → Global guards → Controller guards → Handler guards
    → Global pipes → Controller pipes → Handler pipes
      → Route handler
        → Exception filters (if error thrown)
```

### When should I use a guard vs middleware?

- **Middleware** runs on every matched request and can modify the
  request/response. Use for logging, CORS, request parsing, etc.
- **Guards** return `true`/`false` to allow or deny a request. Use for
  authentication and authorization.

### What happens when a filter throws?

If an exception filter itself throws an error, HonestJS logs
`"Error in exception filter..."` and returns a fallback JSON error response.
Keep filter logic minimal to avoid this.

### Can I use Hono middleware directly?

Yes. Use `@honestjs/middleware`'s `HonoMiddleware` wrapper:

```typescript
import { HonoMiddleware } from "@honestjs/middleware";
import { poweredBy } from "hono/middleware";

components: {
  middleware: [new HonoMiddleware(poweredBy())];
}
```

Or access the Hono instance directly via `app.getApp()` for raw Hono middleware
registration.

## Plugins {#plugins}

> See also: [Plugins Guide](./features/plugins.md) |
> [Troubleshooting: Plugins](./troubleshooting.md#plugins)

### What order do plugins run in?

Plugins run in the order they appear in `options.plugins`. When one plugin
depends on another's output (for example, API docs reading an artifact from
RPC), list the producer first:

```typescript
plugins: [
  new RPCPlugin(), // produces rpc.artifact
  new ApiDocsPlugin(), // consumes rpc.artifact
];
```

### What are plugin processors?

Wrapped plugin entries can have `preProcessors` and `postProcessors` that run
around the plugin lifecycle hooks:

```
preProcessors → beforeModulesRegistered → [modules registered] → afterModulesRegistered → postProcessors
```

Processors receive `(app, hono, ctx)` where `ctx` is the application context
(key-value store).

### How do I name plugins for debug logs?

With `debug: { plugins: true }`, plugin names appear in logs. The framework
picks a name in order:

1. `name` on a wrapped entry `{ plugin, name: 'core' }`
2. `plugin.meta?.name`
3. The class constructor name
4. `AnonymousPlugin#N` for anonymous objects

## Testing {#testing}

> See also: [Testing Guide](./features/testing.md) |
> [Troubleshooting: Metadata](./troubleshooting.md#metadata--application-isolation)

### Which test runner should I use?

Projects created with the CLI use **Vitest** (via `bun run test`). The HonestJS
framework itself uses **Bun's built-in test runner** (`bun test`). Either works.

### How do I test a controller?

Use `createControllerTestApplication`:

```typescript
import { createControllerTestApplication } from "honestjs";

const testApp = await createControllerTestApplication({
  controller: UsersController,
  services: [UsersService],
});

const res = await testApp.request("/users");
expect(res.status).toBe(200);
```

### How do I test a service in isolation?

Use `createServiceTestContainer`:

```typescript
import { createServiceTestContainer } from "honestjs";

const harness = createServiceTestContainer({
  preload: [UsersService],
  overrides: [{ provide: DatabaseService, useValue: mockDb }],
});

const svc = harness.get(UsersService);
```

### Do I need to clean up metadata between tests?

If you're running multiple `Application.create` calls in the same process
(common in integration tests), call `MetadataRegistry.clear()` in `afterEach` to
avoid cross-test pollution. Each application captures an immutable metadata
snapshot at startup, but the global registry is shared.

## Configuration {#configuration}

> See also: [Configuration Guide](./configuration.md) |
> [Troubleshooting: Startup](./troubleshooting.md#startup--configuration)

### What does `startupGuide` do?

When enabled, it emits actionable hints when app initialization fails - for
example, telling you that a controller is missing `@Controller()` or that
`reflect-metadata` isn't imported. Use `startupGuide: { verbose: true }` for
extra detail.

```typescript
const { app, hono } = await Application.create(AppModule, {
  startupGuide: { verbose: true },
});
```

### What does `strict: { requireRoutes: true }` do?

It makes startup fail if no HTTP routes were registered. Useful to catch
configuration mistakes early. Without it, an app with no routes starts silently.

### What does `debug: true` enable?

It turns on all diagnostic categories: `routes`, `plugins`, `pipeline`, `di`,
and `startup`. You can also enable categories individually:

```typescript
debug: { routes: true, plugins: true }
```

::: tip Setting `debug: { routes: true }` also enables startup-category messages
(like "Application registered N routes" and "Application startup completed")
because route registration is part of the startup flow. :::

## CLI {#cli}

> See also: [CLI Reference](./cli.md) |
> [Troubleshooting: CLI](./troubleshooting.md#cli)

### What does `honestjs doctor` check?

It verifies your environment: Bun/Node.js versions, git, available package
managers, template cache status, and GitHub network connectivity.

### How do I use the CLI offline?

Run `honestjs new` or `honestjs list` once with network access to populate the
template cache, then use `--offline` for subsequent runs. If you've never cached
templates, `--offline` will fail with
`"Templates not found. Run without --offline first"`.

### How do I overwrite existing generated files?

Use `--force`:

```bash
honestjs g controller user --force
```

Without `--force`, the CLI will refuse to overwrite an existing file.

## Deployment {#deployment}

> See also: [Deployment Guide](./deployment.md)

### How do I run in production?

After creating your project with the CLI:

```bash
bun run build    # build the project
bun run start    # start the production server
```

The application listens on the port configured by your environment (typically
`PORT` env variable, defaulting to 3000).

### Does HonestJS support Docker?

Docker configuration is optional. Pass `--docker` to the CLI (or select it
during interactive setup):

```bash
honestjs new my-app --docker
```

This generates a `Dockerfile` and optional `docker-compose.yml`.
