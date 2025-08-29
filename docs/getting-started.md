# Getting Started

This guide demonstrates how to create a basic "Hello, World!" application with HonestJS.

## Prerequisites

Before you begin, make sure you have the following installed:

-   [Bun](https://bun.sh/) (recommended) or Node.js
-   TypeScript knowledge (basic understanding)

## Project Setup

The fastest way to create a new Honest application is with the HonestJS CLI.

### 1. Install the CLI

To install the CLI globally, run:

```bash
bun add -g @honestjs/cli
```

### 2. Create a Project

Create a new project using the `new` command:

```bash
honestjs new my-project # alias: honest, hnjs
```

This command will prompt you to select a template and configure the project. For this guide, choose the `barebone` template.

### 3. Start the Development Server

Navigate to your new project directory and start the development server:

```bash
cd my-project
bun dev
```

Your application will be available at `http://localhost:3000`.

## Manual Setup

If you prefer to set up your project manually, follow these steps:

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

HonestJS applications follow a well-organized folder structure that promotes maintainability and scalability. Here's the recommended project organization:

```
Project
├── src
│   ├── app.module.ts          # Root application module
│   ├── main.ts                # Application entry point
│   ├── components/            # Global/shared components
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── decorators/            # Custom decorators
│   │   └── parameter.decorator.ts
│   ├── layouts/               # Layout components
│   │   └── MainLayout.tsx
│   └── modules/               # Feature modules
│       └── users/             # Example: Users module
│           ├── components/     # Module-specific components
│           │   └── UserList.tsx
│           ├── dtos/          # Data Transfer Objects
│           │   └── create-user.dto.ts
│           ├── models/        # Data models
│           │   └── user.model.ts
│           ├── users.controller.ts
│           ├── users.module.ts
│           ├── users.service.ts
│           ├── users.service.test.ts
│           └── users.view.tsx
├── static/                    # Static assets
│   ├── css/
│   │   ├── main.css          # Global styles
│   │   └── views/            # View-specific styles
│   │       └── users.css
│   └── js/
│       ├── main.js           # Global scripts
│       └── views/            # View-specific scripts
│           └── users.js
└── tests/                     # Test files
    └── users/
        └── users.service.test.ts
```

#### Key Organizational Principles

-   **Modular Structure**: Each feature is organized into its own module with related components
-   **Separation of Concerns**: Controllers, services, and views are clearly separated
-   **Reusable Components**: Global components can be shared across modules
-   **Static Assets**: CSS and JavaScript files are organized by scope (global vs. view-specific)
-   **Testing**: Test files are co-located with the code they test

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

## Project Organization

Understanding how to organize your HonestJS application is crucial for building maintainable and scalable projects. Let's dive deeper into the folder structure and organizational patterns.

> **📚 For a complete guide to project organization, see [Project Organization](../concepts/project-organization.md)**

### Module Organization

Each feature in your application should be organized into its own module. A module typically contains:

-   **Controller**: Handles HTTP requests and responses
-   **Service**: Contains business logic and data access
-   **Views**: JSX components for rendering HTML (if using MVC)
-   **DTOs**: Data Transfer Objects for input validation
-   **Models**: Data structures and type definitions
-   **Components**: Module-specific UI components
-   **Tests**: Unit and integration tests

### Global vs. Module-Specific Components

HonestJS supports both global and module-specific components:

#### Global Components

Global components are available throughout the entire application and are typically defined in the root module or configuration:

```typescript
// Global middleware, guards, pipes, and filters
const { app, hono } = await Application.create(AppModule, {
	components: {
		middleware: [new LoggerMiddleware()],
		guards: [AuthGuard],
		pipes: [ValidationPipe],
		filters: [HttpExceptionFilter],
	},
})
```

#### Module-Specific Components

Module-specific components are scoped to a particular feature and can be applied at the module, controller, or handler level:

```typescript
@Module({
	controllers: [UsersController],
	services: [UsersService],
	components: {
		middleware: [UsersMiddleware],
		guards: [UsersGuard],
		pipes: [UsersPipe],
		filters: [UsersFilter],
	},
})
class UsersModule {}
```

### Static Asset Organization

Static assets are organized to support both global and view-specific styling and scripting:

-   **Global Assets**: `main.css` and `main.js` contain styles and scripts used across the entire application
-   **View-Specific Assets**: View-specific CSS and JS files are organized in subdirectories to avoid conflicts and enable lazy loading

### Best Practices

1. **Keep Modules Focused**: Each module should have a single responsibility
2. **Use Consistent Naming**: Follow consistent naming conventions for files and directories
3. **Co-locate Related Files**: Keep related files close together (e.g., service and its tests)
4. **Separate Concerns**: Keep business logic, presentation, and data access separate
5. **Plan for Growth**: Structure your application to accommodate future features

## Next Steps

Now that you have a basic application running and understand the project organization, you can explore:

-   [Configuration](./configuration.md) - Learn how to configure your application
-   [Routing](./concepts/routing.md) - Understand how to define routes and handle requests
-   [Dependency Injection](./concepts/dependency-injection.md) - Learn about the DI system
-   [Parameters](./concepts/parameters.md) - See how to extract data from requests
-   [Components](./components/overview.md) - Explore middleware, guards, pipes, and filters
