# Configuration

HonestJS applications can be configured through the `HonestOptions` interface when creating your application. This
allows you to customize various aspects of your application's behavior, from routing to error handling.

## Basic Configuration

The most basic way to configure your application is through the `Application.create()` method:

```typescript
import { Application } from 'honestjs'
import AppModule from './app.module'

const { app, hono } = await Application.create(AppModule, {
	// Configuration options go here
})
```

## Configuration Options

### Container Configuration

You can provide a custom dependency injection container:

```typescript
import { Container } from 'honestjs'
import type { DiContainer } from 'honestjs'

class CustomContainer implements DiContainer {
	resolve<T>(target: Constructor<T>): T {
		// Custom resolution logic
		return new target()
	}

	register<T>(target: Constructor<T>, instance: T): void {
		// Custom registration logic
	}
}

const { app, hono } = await Application.create(AppModule, {
	container: new CustomContainer()
})
```

### Hono-specific Configuration

Configure the underlying Hono instance:

```typescript
const { app, hono } = await Application.create(AppModule, {
	hono: {
		// Whether to use strict matching for routes
		strict: true,
		// Custom router implementation
		router: customRouter,
		// Custom path extraction function
		getPath: (request, options) => {
			// Custom logic to extract path from request
			return request.url
		}
	}
})
```

### Routing Configuration

Set global routing options that apply to all routes:

```typescript
import { VERSION_NEUTRAL } from 'honestjs'

const { app, hono } = await Application.create(AppModule, {
	routing: {
		// Global API prefix (e.g., all routes become /api/*)
		prefix: 'api',
		// Global API version (e.g., all routes become /v1/*)
		version: 1
		// You can also use VERSION_NEUTRAL or an array of versions
		// version: VERSION_NEUTRAL  // Routes accessible with and without version
		// version: [1, 2]          // Routes available at both /v1/* and /v2/*
	}
})
```

**Example result:** With `prefix: 'api'` and `version: 1`, a route `@Get('/users')` becomes accessible at
`/api/v1/users`.

### Debug and Strict Options

Use diagnostics while developing, and opt into stricter startup checks when needed.

```typescript
const { app, hono } = await Application.create(AppModule, {
	startupGuide: { verbose: true },
	debug: {
		routes: true,
		plugins: true,
		pipeline: true,
		di: true,
		startup: true
	},
	// Optional structured logger
	logger: myLogger,
	strict: {
		// Fails startup if no routes were registered
		requireRoutes: true
	},
	deprecations: {
		// Prints pre-v1 warning at startup
		printPreV1Warning: true
	}
})
```

Debug categories:

- `routes`: route registration diagnostics (including per-controller registration timing)
- `plugins`: plugin ordering and lifecycle diagnostics
- `pipeline`: request pipeline diagnostics (guards, pipes, execution path)
- `di`: dependency injection diagnostics
- `startup`: startup lifecycle diagnostics (registered routes, completion/failure timing)

Set `debug: true` to enable every category.

### Startup Guide Mode

Enable startup guidance to emit actionable hints when app initialization fails.

```typescript
const { app, hono } = await Application.create(AppModule, {
	startupGuide: true
})

// Verbose mode adds a second diagnostics event with additional steps
const { app, hono } = await Application.create(AppModule, {
	startupGuide: { verbose: true }
})
```

Guide mode helps with common startup issues such as:

- missing `@Controller()` on classes listed in `module.controllers`
- controllers without HTTP method decorators
- missing `@Service()` on injectable dependencies
- missing decorator metadata / `reflect-metadata` setup
- strict no-routes startup failures
- plugin ordering or capability contract mismatches

### Runtime Metadata Behavior

Decorator metadata is collected globally, but each application instance runs against an immutable metadata snapshot that
is captured at startup. This prevents post-bootstrap metadata mutations from changing behavior in already-running apps.

In practice, the metadata consumed by route and component managers is app-scoped at runtime.

### Global Components Configuration

Apply components (middleware, guards, pipes, filters) globally to all routes:

```typescript
import type { IFilter, IGuard, IMiddleware, IPipe } from 'honestjs'
import { AuthGuard } from './guards/auth.guard'
import { LoggerMiddleware } from './middleware/logger.middleware'
import { ValidationPipe } from './pipes/validation.pipe'
import { HttpExceptionFilter } from './filters/http-exception.filter'

const { app, hono } = await Application.create(AppModule, {
	components: {
		// Global middleware applied to every route
		middleware: [
			new LoggerMiddleware(),
			// You can also pass classes; they will be instantiated by the container
			SomeOtherMiddleware
		],
		// Global guards for authentication/authorization
		guards: [new AuthGuard()],
		// Global pipes for data transformation/validation
		pipes: [new ValidationPipe()],
		// Global exception filters for error handling
		filters: [new HttpExceptionFilter()]
	}
})
```

### Application context

The application context is a typed key-value store always available on `app`. No configuration is required. Use it from
bootstrap code, services, or plugins to share pipeline data by key.

```typescript
const { app, hono } = await Application.create(AppModule)

app.getContext().set('my.key', { data: 123 })
const value = app.getContext().get<{ data: number }>('my.key')
```

See [Application context](../features/application-context.md) for full documentation.

### Plugin Configuration

Extend your application with plugins:

```typescript
import type { IPlugin } from 'honestjs'
import { Application } from 'honestjs'
import type { Hono } from 'hono'

class DatabasePlugin implements IPlugin {
	async beforeModulesRegistered(app: Application, hono: Hono) {
		// Setup database connection
		this.logger?.emit({
			level: 'info',
			category: 'plugins',
			message: 'Setting up database...'
		})
	}

	async afterModulesRegistered(app: Application, hono: Hono) {
		this.logger?.emit({
			level: 'info',
			category: 'plugins',
			message: 'Database setup complete'
		})
	}
}

class CachePlugin implements IPlugin {
	constructor(private options: { ttl: number; maxSize: number }) {}

	async beforeModulesRegistered(app: Application, hono: Hono) {
		this.logger?.emit({
			level: 'info',
			category: 'plugins',
			message: `Initializing cache with TTL: ${this.options.ttl}`
		})
	}
}

const { app, hono } = await Application.create(AppModule, {
	plugins: [
		new DatabasePlugin(),
		new CachePlugin({
			ttl: 3600,
			maxSize: 1000
		})
	]
})
```

Plugins can hook into the application lifecycle with `beforeModulesRegistered` and `afterModulesRegistered` methods. The
framework sets `plugin.logger` (optional `ILogger` from `HonestOptions`) on each plugin instance before those hooks run;
use `this.logger?.emit(...)` when you need structured diagnostics from a plugin.

You can also provide wrapped plugin entries with explicit ordering and startup contracts:

```typescript
class ArtifactPlugin implements IPlugin {
	meta = {
		name: 'artifact',
		provides: ['artifact:routes']
	}
}

class DocsPlugin implements IPlugin {
	meta = {
		name: 'docs',
		requires: ['artifact:routes']
	}
}

const { app, hono } = await Application.create(AppModule, {
	plugins: [
		{ plugin: new DocsPlugin(), name: 'docs', after: ['artifact'] },
		{ plugin: new ArtifactPlugin(), name: 'artifact' }
	]
})
```

If ordering constraints or required capabilities cannot be satisfied, startup fails fast with a clear error.

### Error Handling Configuration

Customize global error handling:

```typescript
import type { Context } from 'hono'

const { app, hono } = await Application.create(AppModule, {
	// Custom error handler for unhandled exceptions
	onError: (error: Error, context: Context) => {
		console.error('Unhandled error:', error)
		return context.json(
			{
				error: 'Internal Server Error',
				message: 'Something went wrong',
				timestamp: new Date().toISOString(),
				path: context.req.path
			},
			500
		)
	},
	// Custom handler for routes that don't match any pattern
	notFound: (context: Context) => {
		return context.json(
			{
				error: 'Not Found',
				message: `Route ${context.req.path} not found`,
				timestamp: new Date().toISOString()
			},
			404
		)
	}
})
```

## Complete Configuration Example

Here's a comprehensive example showing all configuration options:

```typescript
import { Application, VERSION_NEUTRAL } from 'honestjs'
import type { HonestOptions } from 'honestjs'
import { AuthGuard } from './guards/auth.guard'
import { LoggerMiddleware } from './middleware/logger.middleware'
import { ValidationPipe } from './pipes/validation.pipe'
import { HttpExceptionFilter } from './filters/http-exception.filter'
import { DatabasePlugin } from './plugins/database.plugin'
import AppModule from './app.module'

const options: HonestOptions = {
	// Custom DI container (optional)
	// container: new CustomContainer(),

	// Hono configuration
	hono: {
		strict: true
	},

	// Global routing configuration
	routing: {
		prefix: 'api',
		version: 1
	},

	// Global components
	components: {
		middleware: [new LoggerMiddleware()],
		guards: [new AuthGuard()],
		pipes: [new ValidationPipe()],
		filters: [new HttpExceptionFilter()]
	},

	// Plugins
	plugins: [new DatabasePlugin()],

	// Custom error handlers
	onError: (error, context) => {
		console.error('Error:', error)
		return context.json(
			{
				error: 'Internal Server Error',
				timestamp: new Date().toISOString(),
				path: context.req.path
			},
			500
		)
	},

	notFound: (context) => {
		return context.json(
			{
				error: 'Route not found',
				path: context.req.path,
				timestamp: new Date().toISOString()
			},
			404
		)
	}
}

const { app, hono } = await Application.create(AppModule, options)

export default hono
```

## Configuration Best Practices

### 1. Environment-Based Configuration

Use environment variables to configure your application for different environments:

```typescript
const options: HonestOptions = {
	routing: {
		prefix: process.env.API_PREFIX || 'api',
		version: parseInt(process.env.API_VERSION || '1')
	},
	components: {
		middleware:
			process.env.NODE_ENV === 'production'
				? [new ProductionLoggerMiddleware()]
				: [new DevelopmentLoggerMiddleware()]
	}
}
```

### 2. Modular Configuration

Split your configuration into logical modules:

::: code-group

```typescript [config/database.ts]
export const databaseConfig = {
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432')
}
```

```typescript [config/security.ts]
export const securityConfig = {
	jwtSecret: process.env.JWT_SECRET || 'default-secret',
	bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
}
```

```typescript [main.ts]
import { databaseConfig } from './config/database'
import { securityConfig } from './config/security'

const { app, hono } = await Application.create(AppModule, {
	plugins: [new DatabasePlugin(databaseConfig), new SecurityPlugin(securityConfig)]
})
```

:::

### 3. Type-Safe Configuration

Create typed configuration objects for better type safety:

```typescript
interface AppConfig {
	database: {
		host: string
		port: number
	}
	security: {
		jwtSecret: string
		bcryptRounds: number
	}
	api: {
		prefix: string
		version: number
	}
}

const config: AppConfig = {
	database: {
		host: process.env.DB_HOST || 'localhost',
		port: parseInt(process.env.DB_PORT || '5432')
	},
	security: {
		jwtSecret: process.env.JWT_SECRET || 'default-secret',
		bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
	},
	api: {
		prefix: process.env.API_PREFIX || 'api',
		version: parseInt(process.env.API_VERSION || '1')
	}
}

const { app, hono } = await Application.create(AppModule, {
	routing: {
		prefix: config.api.prefix,
		version: config.api.version
	},
	plugins: [new DatabasePlugin(config.database), new SecurityPlugin(config.security)]
})
```

This configuration approach gives you fine-grained control over your application's behavior while maintaining clean and
organized code.
