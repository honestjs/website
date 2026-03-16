# Project Organization

Understanding how to organize your HonestJS application is crucial for building maintainable and scalable projects. This
guide covers the recommended folder structure and organizational patterns.

## Recommended Folder Structure

HonestJS applications follow a well-organized folder structure that promotes maintainability and scalability:

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

## Key Organizational Principles

- **Modular Structure**: Each feature is organized into its own module with related components
- **Separation of Concerns**: Controllers, services, and views are clearly separated
- **Reusable Components**: Global components can be shared across modules
- **Static Assets**: CSS and JavaScript files are organized by scope (global vs. view-specific)
- **Testing**: Test files are co-located with the code they test

## Module Organization

Each feature in your application should be organized into its own module. A module typically contains:

### Core Module Files

- **Controller**: Handles HTTP requests and responses
- **Service**: Contains business logic and data access
- **Module**: Defines the module configuration and dependencies
- **Views**: JSX components for rendering HTML (if using MVC)

### Supporting Files

- **DTOs**: Data Transfer Objects for input validation
- **Models**: Data structures and type definitions
- **Components**: Module-specific UI components
- **Tests**: Unit and integration tests

### Example Module Structure

```typescript
// users.module.ts
@Module({
	controllers: [UsersController],
	services: [UsersService]
})
class UsersModule {}

// users.controller.ts
@Controller('users')
class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	async getUsers() {
		return await this.usersService.findAll()
	}
}

// users.service.ts
@Service()
class UsersService {
	async findAll() {
		// Business logic here
	}
}
```

## Component Organization

HonestJS supports both global and module-specific components:

### Global Components

Global components are available throughout the entire application and are typically defined in the root module or
configuration:

```typescript
// Global middleware, guards, pipes, and filters
const { app, hono } = await Application.create(AppModule, {
	components: {
		middleware: [new LoggerMiddleware()],
		guards: [AuthGuard],
		pipes: [ValidationPipe],
		filters: [HttpExceptionFilter]
	}
})
```

### Module-Specific Components

Module-specific components are scoped to a particular feature and can be applied at the controller or handler level:

```typescript
@Module({
	controllers: [UsersController],
	services: [UsersService]
})
class UsersModule {}

// Or at the controller level
@Controller('users')
@UseMiddleware(UsersMiddleware)
@UseGuards(UsersGuard)
class UsersController {}

// Or at the handler level
@Controller('users')
class UsersController {
	@Get()
	@UseGuards(AdminGuard)
	@UsePipes(CustomPipe)
	getUsers() {}
}
```

## Static Asset Organization

Static assets are organized to support both global and view-specific styling and scripting:

### Global Assets

- **`main.css`** and **`main.js`** contain styles and scripts used across the entire application
- These files are typically loaded on every page

### View-Specific Assets

- View-specific CSS and JS files are organized in subdirectories to avoid conflicts
- Enables lazy loading and better performance
- Example: `static/css/views/users.css` for user-specific styles

## Layout and Component Organization

### Global Components

Components that are used across multiple modules should be placed in the global `components/` directory:

```typescript
// src/components/Header.tsx
export function Header() {
	return (
		<header>
			<nav>
				<a href='/'>Home</a>
				<a href='/users'>Users</a>
			</nav>
		</header>
	)
}

// src/components/Footer.tsx
export function Footer() {
	return (
		<footer>
			<p>&copy; 2024 My App</p>
		</footer>
	)
}
```

### Layout Components

Layout components define the overall structure of your application:

```typescript
// src/layouts/MainLayout.tsx
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

export function MainLayout({ children, title }: { children: any; title: string }) {
	return (
		<html>
			<head>
				<title>{title}</title>
				<link rel='stylesheet' href='/css/main.css' />
			</head>
			<body>
				<Header />
				<main>{children}</main>
				<Footer />
				<script src='/js/main.js'></script>
			</body>
		</html>
	)
}
```

## Testing Organization

Tests should be co-located with the code they test:

```typescript
// src/modules/users/users.service.test.ts
import { describe, it, expect } from 'bun:test'
import { UsersService } from './users.service'

describe('UsersService', () => {
	it('should return all users', async () => {
		const service = new UsersService()
		const users = await service.findAll()
		expect(users).toBeDefined()
	})
})
```

## Best Practices

1. **Keep Modules Focused**: Each module should have a single responsibility
2. **Use Consistent Naming**: Follow consistent naming conventions for files and directories
3. **Co-locate Related Files**: Keep related files close together (e.g., service and its tests)
4. **Separate Concerns**: Keep business logic, presentation, and data access separate
5. **Plan for Growth**: Structure your application to accommodate future features
6. **Follow Conventions**: Stick to established patterns for better maintainability
7. **Document Structure**: Keep your folder structure documented for team members

## Example: Complete Module Structure

Here's a complete example of how a users module might be organized:

```
src/modules/users/
├── components/
│   ├── UserList.tsx          # User list component
│   ├── UserForm.tsx          # User form component
│   └── UserCard.tsx          # Individual user card
├── dtos/
│   ├── create-user.dto.ts    # Create user validation
│   ├── update-user.dto.ts    # Update user validation
│   └── user-query.dto.ts     # User query parameters
├── models/
│   └── user.model.ts         # User data model
├── users.controller.ts        # HTTP request handling
├── users.module.ts           # Module configuration
├── users.service.ts          # Business logic
├── users.service.test.ts     # Service tests
└── users.view.tsx            # Main users view
```

This organization makes it easy to:

- Find related code quickly
- Understand the module's structure at a glance
- Maintain separation of concerns
- Scale the application as it grows

## Next Steps

Now that you understand project organization, explore:

- [Getting Started](../getting-started.md) - Build your first application
- [Modules](../dependency-injection.md) - Learn about module configuration
- [Components](../components/overview.md) - Understand the component system
- [MVC Support](../features/mvc.md) - Build full-stack applications
