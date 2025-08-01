# Guards

A guard is a class that implements the `IGuard` interface. It determines whether a given request should be handled by the route handler based on certain conditions (e.g., permissions, roles). If a guard denies access, HonestJS throws a `ForbiddenException`.

## Use Cases

Guards are primarily used for authorization. Common use cases include:

-   **Authentication:** Checking if a user is logged in.
-   **Role-Based Access Control (RBAC):** Permitting access only to users with specific roles.
-   **IP Whitelisting/Blacklisting:** Allowing or blocking requests from certain IP addresses.
-   **API Key Validation:** Ensuring that a valid API key is present in the request.

## Creating a Guard

A guard must implement the `IGuard` interface, which has a single `canActivate` method. This method should return `true` if the request is allowed, and `false` otherwise. It can also be asynchronous and return a `Promise<boolean>`.

The `canActivate` method receives the Hono `Context` as its argument, which gives you access to the request, response, and other context-specific information.

**Example:** A simple authentication guard.

```typescript
import type { IGuard } from 'honestjs'
import type { Context } from 'hono'

export class AuthGuard implements IGuard {
	async canActivate(c: Context): Promise<boolean> {
		const authHeader = c.req.header('Authorization')
		// In a real app, you would validate the token
		return !!authHeader
	}
}
```

## Applying Guards

Guards can be applied at the global, controller, or handler level using the `@UseGuards()` decorator.

### Global Guards

Global guards are applied to every route in your application.

**Example:**

```typescript
import { Application } from 'honestjs'
import { AuthGuard } from './guards/auth.guard'

const { hono } = await Application.create(AppModule, {
	components: {
		guards: [new AuthGuard()],
	},
})
```

### Controller-level Guards

You can apply guards to all routes within a controller.

**Example:**

```typescript
import { Controller, UseGuards } from 'honestjs'
import { RolesGuard } from './guards/roles.guard'

@Controller('/admin')
@UseGuards(RolesGuard)
export class AdminController {
	// All routes in this controller are protected by the RolesGuard
}
```

### Handler-level Guards

You can also apply guards to a specific route handler.

**Example:**

```typescript
import { Controller, Post, UseGuards } from 'honestjs'
import { OwnerGuard } from './guards/owner.guard'

@Controller('/posts')
export class PostsController {
	@Post('/:id/delete')
	@UseGuards(OwnerGuard)
	deletePost() {
		// This route is protected by the OwnerGuard
	}
}
```

## Execution Order

When multiple guards are applied to a route, they are executed in the following order:

1.  Global Guards
2.  Controller-Level Guards
3.  Handler-Level Guards

If multiple guards are applied at the same level (e.g., `@UseGuards(GuardA, GuardB)`), they are executed in the order they are listed. The request is denied if any guard returns `false`.

## Role-Based Access Control

Guards are ideal for implementing role-based access control (RBAC). You can create a `Roles` decorator to associate roles with specific handlers, and a `RolesGuard` to check for those roles.

**1. Create a `Roles` decorator:**

This decorator will attach role metadata to a route.

::: code-group

```typescript [roles.decorator.ts]
export const Roles = (...roles: string[]) => {
	return (target: any, key: string, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata('roles', roles, descriptor.value)
	}
}
```

:::

**2. Create the `RolesGuard`:**

This guard will retrieve the roles from the metadata and check if the user has the required role.

::: code-group

```typescript [roles.guard.ts]
import type { IGuard } from 'honestjs'
import type { Context } from 'hono'

export class RolesGuard implements IGuard {
	async canActivate(c: Context): Promise<boolean> {
		const requiredRoles = Reflect.getMetadata('roles', c.handler)
		if (!requiredRoles) {
			return true // No roles required, access granted
		}

		const user = c.get('user') // Assume user is attached to context
		return requiredRoles.some((role) => user.roles?.includes(role))
	}
}
```

:::

**3. Use them together:**

::: code-group

```typescript [admin.controller.ts]
import { Controller, Get, UseGuards } from 'honestjs'
import { Roles } from '../decorators/roles.decorator'
import { RolesGuard } from '../guards/roles.guard'

@Controller('/admin')
@UseGuards(RolesGuard)
export class AdminController {
	@Get('/data')
	@Roles('admin')
	getAdminData() {
		// This route requires the 'admin' role
	}
}
```

:::

This example demonstrates how you can build a flexible and declarative authorization system with guards.
