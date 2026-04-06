# Getting Started

This guide walks you through creating your first HonestJS application. Pick the
track that suits you best.

::: info Project Status HonestJS is in early development (pre-v1.0.0). The API
may change between minor versions and some features are still in progress. We
recommend caution before using it in production. See
[GitHub Issues](https://github.com/honestjs/honest/issues) for known issues and
roadmap. :::

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Basic TypeScript knowledge

## Choose a Template

All templates include TypeScript, optional ESLint, Prettier, Docker, and git
init. Pick the one that matches your use case:

| Template     | Best for                                   | What you get                                        |
| ------------ | ------------------------------------------ | --------------------------------------------------- |
| **blank**    | Learning HonestJS, minimal projects        | Empty project with basic setup                      |
| **barebone** | APIs, small-to-medium apps                 | Modules, controllers, services, testing             |
| **mvc**      | Full-stack apps with server-rendered views | Hono JSX views, layouts, static assets, MVC pattern |

::: tip Coming from NestJS? The **barebone** template feels most familiar:
modules, controllers, and services are organized the same way. The main
differences are that HonestJS runs on Hono (not Express) and uses
`Application.create` instead of `NestFactory.create`. :::

## Track A: Using the CLI (Recommended) {#cli-track}

### 1. Install the CLI

```bash
bun add -g @honestjs/cli
```

::: details Using npm, pnpm, or yarn?

```bash
npm install -g @honestjs/cli
# or
pnpm add -g @honestjs/cli
# or
yarn global add @honestjs/cli
```

:::

### 2. Create a Project

```bash
honestjs new my-project    # aliases: honest, hnjs
```

The CLI will prompt you to choose a template and configure options. To skip
prompts and use defaults:

```bash
honestjs new my-project -t barebone -y
```

### 3. Start the Development Server

```bash
cd my-project
bun dev
```

Your application is now running at `http://localhost:3000`.

### What the CLI Created

Depending on your template choice, you'll find:

```
my-project/
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   └── modules/               # Feature modules (barebone/mvc)
│       └── app/
│           ├── app.controller.ts
│           └── app.service.ts
├── package.json
└── tsconfig.json
```

> For a complete guide to folder structure and conventions, see
> [Project Organization](./concepts/project-organization.md).

---

## Track B: Manual Setup {#manual-track}

If you prefer to set up your project from scratch:

### 1. Initialize Project

```bash
bun init
bun add honestjs hono reflect-metadata
```

::: details Using npm, pnpm, or yarn?

```bash
npm init -y
npm install honestjs hono reflect-metadata
```

:::

### 2. Configure TypeScript

Ensure your `tsconfig.json` has decorator support enabled:

::: code-group

```json [tsconfig.json]
{
	"compilerOptions": {
		"lib": ["ESNext", "DOM"],
		"target": "ESNext",
		"module": "ESNext",
		"moduleDetection": "force",
		"jsx": "react-jsx",
		"jsxImportSource": "hono/jsx",
		"moduleResolution": "bundler",
		"verbatimModuleSyntax": true,
		"strict": true,
		"skipLibCheck": true,
		"esModuleInterop": true,
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "dist"]
}
```

:::

::: warning reflect-metadata is required HonestJS uses TypeScript decorator
metadata for dependency injection. You must:

1. Enable `experimentalDecorators` and `emitDecoratorMetadata` in tsconfig
2. Import `reflect-metadata` **once** at the top of your entry file, before any
   HonestJS code :::

### 3. Create the Application

Create the following files:

::: code-group

```typescript [src/app.service.ts]
import { Service } from "honestjs";

@Service()
class AppService {
	helloWorld(): string {
		return "Hello, World!";
	}
}

export default AppService;
```

```typescript [src/app.controller.ts]
import { Controller, Get } from "honestjs";
import AppService from "./app.service";

@Controller()
class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	helloWorld(): string {
		return this.appService.helloWorld();
	}
}

export default AppController;
```

```typescript [src/app.module.ts]
import { Module } from "honestjs";
import AppController from "./app.controller";
import AppService from "./app.service";

@Module({
	controllers: [AppController],
	services: [AppService],
})
class AppModule {}

export default AppModule;
```

```typescript [src/main.ts]
import "reflect-metadata";
import { Application } from "honestjs";
import AppModule from "./app.module";

const { app, hono } = await Application.create(AppModule);

export default hono;
```

:::

### 4. Run the Application

```bash
bun src/main.ts
```

Your application is now running at `http://localhost:3000`.

---

## What Just Happened?

Whether you used the CLI or manual setup, HonestJS bootstrapped an application
from four building blocks:

1. **Service** (`@Service()`) - contains your business logic, managed by the DI
   container
2. **Controller** (`@Controller()`, `@Get()`) - maps HTTP requests to service
   methods
3. **Module** (`@Module()`) - groups controllers and services together
4. **Entry point** (`Application.create`) - bootstraps the app and returns a
   Hono instance

The dependency injection system automatically wires the service into the
controller's constructor. No manual instantiation needed.

### How it compares to NestJS

| Concept           | NestJS                 | HonestJS                        |
| ----------------- | ---------------------- | ------------------------------- |
| Bootstrap         | `NestFactory.create()` | `Application.create()`          |
| HTTP engine       | Express (default)      | Hono                            |
| Decorators        | `@Injectable()`        | `@Service()`                    |
| Module system     | `@Module()`            | `@Module()`                     |
| DI                | Constructor injection  | Constructor injection           |
| Request context   | Express `req`/`res`    | Hono `Context` via `@Ctx()`     |
| Exported instance | NestJS app             | `hono` (standard Hono instance) |

### How it compares to plain Hono

| Concept           | Plain Hono             | HonestJS                             |
| ----------------- | ---------------------- | ------------------------------------ |
| Route definition  | `app.get('/path', fn)` | `@Controller()` + `@Get()`           |
| DI                | Manual / none          | Built-in container                   |
| Middleware        | `app.use()`            | `@UseMiddleware()` or global         |
| Project structure | Free-form              | Modules/controllers/services         |
| Underlying engine | Hono                   | Hono (accessible via `app.getApp()`) |

## Next Steps

Now that you have a running application, explore these topics in order:

1. **[Configuration](./configuration.md)** - customize routing prefixes,
   versioning, debug mode, and global components
2. **[Routing](./concepts/routing.md)** - define routes, use parameters, and set
   up API versioning
3. **[Dependency Injection](./concepts/dependency-injection.md)** - understand
   the DI container and service lifecycle
4. **[Parameters](./concepts/parameters.md)** - extract body, query, params, and
   headers from requests
5. **[Components](./components/overview.md)** - add middleware, guards, pipes,
   and exception filters
6. **[Plugins](./features/plugins.md)** - extend the framework with plugins
7. **[MVC](./features/mvc.md)** - build full-stack apps with Hono JSX views (use
   the `mvc` template)
8. **[Testing](./features/testing.md)** - test your controllers and services
   with built-in helpers
9. **[FAQ](./faq.md)** - answers to common questions and troubleshooting tips
