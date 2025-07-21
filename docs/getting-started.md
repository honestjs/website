# Getting Started

This guide demonstrates how to create a basic "Hello, World!" application with HonestJS.

## Prerequisites

Before you begin, make sure you have the following installed:

-   [Bun](https://bun.sh/) (recommended) or Node.js
-   TypeScript knowledge (basic understanding)

## Project Setup

### 1. Initialize Project

First, create a new project and install the necessary dependencies.

```bash
bun init
bun add honestjs hono reflect-metadata
```

### 2. Configure TypeScript

Ensure your `tsconfig.json` has the following options enabled for decorator support:

::: code-group

```json [tsconfig.json]
{
	"compilerOptions": {
		// Enable latest features
		"lib": ["ESNext", "DOM"],
		"target": "ESNext",
		"module": "ESNext",
		"moduleDetection": "force",

		// Optional: Enable JSX support for Hono
		"jsx": "react-jsx",
		"jsxImportSource": "hono/jsx",

		// Bundler mode
		"moduleResolution": "bundler",
		"verbatimModuleSyntax": true,

		// Enable declaration file generation
		"declaration": false,
		"declarationMap": false,
		"emitDeclarationOnly": false,
		"outDir": "dist",
		"rootDir": "src",
		"sourceMap": false,

		// Best practices
		"strict": true,
		"skipLibCheck": true,
		"noFallthroughCasesInSwitch": true,
		"forceConsistentCasingInFileNames": true,
		"esModuleInterop": true,

		// Some stricter flags (disabled by default)
		"noUnusedLocals": false,
		"noUnusedParameters": false,
		"noPropertyAccessFromIndexSignature": false,

		// Decorators
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "dist"]
}
```

:::

## Building Your First App

### 0. Create a directory structure

```
Project
├── src
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
└── └── main.ts
```

### 1. Create a Service

Services are responsible for business logic. This service will provide the "Hello, World!" message.

::: code-group

```typescript [app.service.ts]
import { Service } from 'honestjs'

@Service()
class AppService {
	helloWorld(): string {
		return 'Hello, World!'
	}
}

export default AppService
```

:::

### 2. Create a Controller

Controllers handle incoming requests and use services to fulfill them.

::: code-group

```typescript [app.controller.ts]
import { Controller, Get } from 'honestjs'
import AppService from './app.service'

@Controller()
class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	helloWorld(): string {
		return this.appService.helloWorld()
	}
}

export default AppController
```

:::

### 3. Create a Module

Modules organize the application's components and define the dependency injection scope.

::: code-group

```typescript [app.module.ts]
import { Module } from 'honestjs'
import AppController from './app.controller'
import AppService from './app.service'

@Module({
	controllers: [AppController],
	services: [AppService],
})
class AppModule {}

export default AppModule
```

:::

### 4. Create the Application Entrypoint

Finally, create the main application file to bootstrap the HonestJS app.

::: code-group

```typescript [main.ts]
import { Application } from 'honestjs'
import 'reflect-metadata'
import AppModule from './app.module'

const { app, hono } = await Application.create(AppModule)

// Export the Hono instance for deployment
export default hono
```

:::

### 5. Run the Application

Now, run the application:

```bash
bun src/main.ts
```

Your application will be available at `http://localhost:3000` (or the port configured by your deployment environment).

## What Just Happened?

Let's break down what we just created:

1. **AppService**: A service class that contains our business logic
2. **AppController**: A controller that handles HTTP requests and uses the service
3. **AppModule**: A module that organizes our components and enables dependency injection
4. **main.ts**: The entry point that bootstraps our application

The magic happens through:

-   **Decorators**: `@Service()`, `@Controller()`, `@Get()`, `@Module()` tell HonestJS how to handle each class
-   **Dependency Injection**: The controller automatically receives the service instance
-   **Reflection**: TypeScript's reflection metadata enables the DI system to work

## Next Steps

Now that you have a basic application running, you can explore:

-   [Configuration](./configuration.md) - Learn how to configure your application
-   [Routing](./concepts/routing.md) - Understand how to define routes and handle requests
-   [Dependency Injection](./concepts/dependency-injection.md) - Learn about the DI system
-   [Parameters](./concepts/parameters.md) - See how to extract data from requests
-   [Components](./components/overview.md) - Explore middleware, guards, pipes, and filters
