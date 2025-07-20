# MVC and View Rendering in HonestJS

Beyond creating REST APIs, HonestJS supports building traditional Model-View-Controller (MVC) applications with server-side rendered views, powered by Hono's JSX engine and the JsxRenderer middleware.

## Core Concepts

The MVC support in HonestJS is built around a few specialized decorators and concepts that extend the core framework:

-   **Views:** These are special controllers designed for rendering UI. They are decorated with `@View()` instead of `@Controller()`.
-   **Page Decorator:** A custom HTTP method decorator, `@Page()`, is used within Views to signify a method that renders a page. It's essentially a specialized `@Get()` decorator.
-   **JsxRenderer Middleware:** The `JsxRendererMiddleware` provides JSX rendering capabilities with automatic layout wrapping.
-   **JSX and Components:** You can use JSX (`.tsx`) to define your components and layouts, which are then rendered to HTML.

## MVC Decorators

HonestJS provides several decorators specifically for MVC applications:

### `@View(route?, options?)`

An alias for `@Controller` with MVC naming conventions. Views are typically configured to ignore global prefixes and versioning, making them suitable for top-level page routes.

```typescript
import { View } from 'honestjs'

@View('pages')
class PagesController {
	// This controller handles page rendering
}
```

### `@Page(path?, options?)`

An alias for `@Get` with MVC naming conventions. Used to clearly indicate that a method renders a view.

```typescript
import { View, Page } from 'honestjs'

@View('pages')
class PagesController {
	@Page('home')
	home() {
		// Renders the home page
	}
}
```

### `@MvcModule(options)`

An enhanced module decorator with view support. It automatically includes views in the controllers array.

```typescript
import { MvcModule } from 'honestjs'

@MvcModule({
	views: [PagesController],
	controllers: [ApiController],
	services: [DataService],
})
class AppModule {}
```

## Setting up an MVC Application

### 1. Project Configuration

Your `tsconfig.json` needs to be configured to support JSX:

```json
{
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "hono/jsx"
	}
}
```

### 2. Creating Custom Layouts with JSX

Create custom layouts using JSX components for better type safety and maintainability:

::: code-group

```tsx [layouts/MainLayout.tsx]
import { Layout, type SiteData } from 'honestjs'
import type { PropsWithChildren } from 'hono/jsx'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export const MainLayout = ({ children, stylesheets, scripts, ...props }: PropsWithChildren<SiteData>) => {
	const globalStylesheets: string[] = ['/static/css/main.css']
	const globalScripts: string[] = ['/static/js/main.js']

	return (
		<Layout
			{...props}
			stylesheets={[...globalStylesheets, ...(stylesheets || [])]}
			scripts={[...globalScripts, ...(scripts || [])]}
		>
			<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
				<Header />
				<main style={{ flex: 1, padding: '2rem 0' }}>{children}</main>
				<Footer />
			</div>
		</Layout>
	)
}
```

:::

### 3. Setting up JSX Rendering

Configure the JsxRenderer middleware in your application:

::: code-group

```typescript [main.ts]
import { Application } from 'honestjs'
import { JsxRendererMiddleware } from '@honestjs/middleware'
import 'reflect-metadata'
import AppModule from './app.module'
import { MainLayout } from './layouts/MainLayout'

declare module 'hono' {
	interface ContextRenderer {
		(content: string | Promise<string>, props: SiteData): Response
	}
}

const { hono } = await Application.create(AppModule, {
	hono: { strict: true },
	routing: { prefix: 'api', version: 1 },
	components: {
		middleware: [new JsxRendererMiddleware(MainLayout)],
	},
})

export default hono
```

:::

### 4. Using Custom Layouts in Views

You can use your custom layouts in views by rendering JSX components:

::: code-group

```tsx [views/UsersView.tsx]
import { Ctx, Page, View } from 'honestjs'
import type { Context } from 'hono'
import { UserList } from './components/UserList'
import UsersService from './users.service'

@View('/users')
class UsersView {
	stylesheets: string[] = ['/static/css/views/users.css']
	scripts: string[] = ['/static/js/views/users.js']

	constructor(private readonly usersService: UsersService) {}

	@Page()
	async index(@Ctx() ctx: Context) {
		const users = await this.usersService.findAll()

		return ctx.render(<UserList users={users} />, {
			title: 'Users',
			description: 'List of users',
			stylesheets: this.stylesheets,
			scripts: this.scripts,
		})
	}
}
```

:::

### 5. Creating Reusable Components

You can create reusable components using JSX with proper TypeScript types:

::: code-group

```tsx [components/Header.tsx]
import { memo } from 'hono/jsx'

export const Header = memo(() => {
	return (
		<header>
			<h1>Honest.js MVC</h1>
		</header>
	)
})
```

```tsx [components/Footer.tsx]
export const Footer = memo(() => {
	return (
		<footer>
			<p>© {new Date().getFullYear()} Company. All rights reserved.</p>
		</footer>
	)
})
```

```tsx [components/UserList.tsx]
import type { FC } from 'hono/jsx'
import type { User } from '../models/user.model'

interface UserListProps {
	users: User[]
}

export const UserList: FC<UserListProps> = (props: UserListProps) => {
	return (
		<div>
			<h2>All Users</h2>
			{props.users.length === 0 ? (
				<div>
					<h3>No users yet</h3>
					<p>Get started by adding your first user</p>
				</div>
			) : (
				props.users.map((user) => (
					<div key={user.id}>
						<h3>{user.name}</h3>
						{user.email && <p>{user.email}</p>}
						{user.role && <span>{user.role}</span>}
					</div>
				))
			)}
		</div>
	)
}
```

:::

## Module Configuration

### MVC Module Setup

::: code-group

```typescript [modules/users/users.module.ts]
import { MvcModule } from 'honestjs'
import UsersController from './users.controller'
import UsersService from './users.service'
import UsersView from './users.view'

@MvcModule({
	views: [UsersView],
	controllers: [UsersController],
	services: [UsersService],
})
class UsersModule {}

export default UsersModule
```

:::

### App Module Configuration

::: code-group

```typescript [app.module.ts]
import { Module } from 'honestjs'
import UsersModule from './modules/users/users.module'

@Module({
	imports: [UsersModule],
})
class AppModule {}

export default AppModule
```

:::

## Combining API and Views

You can have both API controllers and view controllers in the same application:

::: code-group

```typescript [controllers/users.controller.ts]
// API Controller
@Controller('/users')
class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	async getUsers(): Promise<User[]> {
		return await this.usersService.findAll()
	}

	@Post()
	async createUser(@Body() body: CreateUserDto): Promise<User> {
		return await this.usersService.create(body)
	}
}
```

```typescript [views/users.view.ts]
// View Controller
@View('/users')
class UsersView {
	stylesheets: string[] = ['/static/css/views/users.css']
	scripts: string[] = ['/static/js/views/users.js']

	constructor(private readonly usersService: UsersService) {}

	@Page()
	async index(@Ctx() ctx: Context) {
		const users = await this.usersService.findAll()

		return ctx.render(<UserList users={users} />, {
			title: 'Users',
			description: 'List of users',
			stylesheets: this.stylesheets,
			scripts: this.scripts,
		})
	}
}
```

:::

## Service Layer

The service layer handles business logic and data operations:

::: code-group

```typescript [services/users.service.ts]
import { Service } from 'honestjs'
import { CreateUserDto } from './dtos/create-user.dto'
import { User } from './models/user.model'

@Service()
class UsersService {
	private users: User[] = [
		{ id: 1, name: 'John', email: 'john@mail.com', role: 'admin' },
		{ id: 2, name: 'Jane', email: 'jane@mail.com', role: 'admin' },
	]

	async create(user: CreateUserDto): Promise<User> {
		const id = this.users.length + 1
		this.users.push({
			id,
			name: user.name,
			email: user.email,
			role: 'user',
		})
		return this.users[id - 1]
	}

	async findAll(): Promise<User[]> {
		return this.users
	}

	async findById(id: number): Promise<User | null> {
		return this.users.find((user) => user.id === id) || null
	}
}

export default UsersService
```

:::

## Best Practices

### 1. Separate API and View Controllers

Keep API controllers and view controllers separate for better organization:

::: code-group

```typescript [controllers/users.controller.ts]
// API for data
@Controller('api/users')
class UsersApiController {
	@Get()
	async getUsers() {
		return await this.usersService.findAll()
	}
}
```

```typescript [views/users.view.ts]
// Views for UI
@View('users')
class UsersView {
	@Page()
	async list() {
		// Render the users page
	}
}
```

:::

### 2. Use Custom Layouts for All Pages

Always use custom layouts for consistent HTML structure:

```tsx
@Page('home')
async home(@Ctx() ctx: Context) {
	return ctx.render(
		<div>
			<h1>Welcome</h1>
		</div>,
		{
			title: 'Home',
			description: 'Welcome to our app'
		}
	)
}
```

### 3. Leverage SEO Features

Take advantage of the Layout component's SEO features:

```tsx
return ctx.render(<UserList users={users} />, {
	title: 'Page Title',
	description: 'Page description',
	image: 'https://example.com/image.jpg',
	url: 'https://example.com/page',
	type: 'website',
})
```

### 4. Use JSX Components for Reusability

Create reusable JSX components for common UI elements:

::: code-group

```tsx [components/Header.tsx]
import { memo } from 'hono/jsx'

export const Header = memo(() => (
	<header>
		<nav>
			<a href='/'>Home</a>
			<a href='/about'>About</a>
			<a href='/contact'>Contact</a>
		</nav>
	</header>
))
```

```tsx [components/Footer.tsx]
export const Footer = memo(() => (
	<footer>
		<p>&copy; {new Date().getFullYear()} My App</p>
	</footer>
))
```

:::

### 5. Handle Dynamic Data with JSX

Use services to fetch data for your views with JSX components:

::: code-group

```tsx [components/Dashboard.tsx]
import type { FC } from 'hono/jsx'
import type { User } from '../models/user.model'

interface DashboardProps {
	users: User[]
	stats: { totalUsers: number; activeUsers: number }
}

export const Dashboard: FC<DashboardProps> = ({ users, stats }) => {
	return (
		<div>
			<h1>Dashboard</h1>
			<div>
				<p>Total Users: {stats.totalUsers}</p>
				<p>Active Users: {stats.activeUsers}</p>
			</div>
			<div>
				<h2>Recent Users</h2>
				{users.map((user) => (
					<p key={user.id}>{user.name}</p>
				))}
			</div>
		</div>
	)
}
```

```tsx [views/DashboardView.tsx]
@View('/dashboard')
class DashboardView {
	constructor(private readonly userService: UserService, private readonly statsService: StatsService) {}

	@Page()
	async dashboard(@Ctx() ctx: Context) {
		const [users, stats] = await Promise.all([
			this.userService.getRecentUsers(),
			this.statsService.getDashboardStats(),
		])

		return ctx.render(<Dashboard users={users} stats={stats} />, {
			title: 'Dashboard',
		})
	}
}
```

:::

With these MVC features, you can build powerful full-stack applications that combine the robust backend features of HonestJS with flexible server-side rendering capabilities using JSX and the JsxRenderer middleware.
