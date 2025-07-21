# MVC

Beyond creating REST APIs, HonestJS supports building traditional Model-View-Controller (MVC) applications with server-side rendered views, powered by Hono's JSX engine and the JsxRenderer middleware.

## Core Concepts

The MVC support in HonestJS is built around a few specialized decorators and concepts that extend the core framework:

-   **Views:** These are special controllers designed for rendering UI. They are decorated with `@View()` instead of `@Controller()`.
-   **Page Decorator:** A custom HTTP method decorator, `@Page()`, is used within Views to signify a method that renders a page. It's essentially a specialized `@Get()` decorator.
-   **JsxRenderer Middleware:** The `JsxRendererMiddleware` provides JSX rendering capabilities with automatic layout wrapping.
-   **Layout Component:** The `Layout` component provides comprehensive HTML document structure with SEO optimization and modern web standards support.
-   **JSX and Components:** You can use JSX (`.tsx`) to define your components and layouts, which are then rendered to HTML.

## Layout Component

The Layout component is a powerful server-side rendering utility that provides a comprehensive HTML document structure with SEO optimization, flexible configuration, and modern web standards support.

### Overview

The Layout component is designed for building full-stack applications with HonestJS, providing a clean way to generate complete HTML documents with proper meta tags, scripts, stylesheets, and content. It works seamlessly with the JsxRenderer middleware to provide automatic layout wrapping.

### Basic Usage

```typescript
import { Layout } from 'honestjs'

const html = Layout({
	title: 'My Application',
	description: 'A modern web application built with HonestJS',
	children: '<h1>Hello World</h1>',
})
```

### Configuration Options

The Layout component accepts a comprehensive configuration object:

```typescript
interface SiteData {
	title: string // Required: Page title
	description?: string // Page description
	image?: string // Open Graph and Twitter image URL
	url?: string // Canonical URL
	locale?: string // Page locale (defaults to 'en_US')
	type?: string // Open Graph type (defaults to 'website')
	siteName?: string // Site name for Open Graph
	customMeta?: MetaTag[] // Array of custom meta tags
	scripts?: (string | ScriptOptions)[] // Array of script URLs or objects
	stylesheets?: string[] // Array of stylesheet URLs
	favicon?: string // Favicon URL
	twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
	csp?: string // Content Security Policy
	htmlAttributes?: HtmlAttributes // Custom HTML attributes
	headAttributes?: HtmlAttributes // Custom head attributes
	bodyAttributes?: HtmlAttributes // Custom body attributes
}
```

### SEO Optimization

The Layout component automatically generates comprehensive SEO meta tags:

#### Basic SEO

```typescript
const html = Layout({
	title: 'Product Page',
	description: 'Amazing product with great features',
	url: 'https://example.com/product',
	siteName: 'My Store',
})
```

#### Open Graph Tags

```typescript
const html = Layout({
	title: 'Product Page',
	description: 'Amazing product with great features',
	image: 'https://example.com/product.jpg',
	url: 'https://example.com/product',
	type: 'product',
	siteName: 'My Store',
})
```

#### Twitter Cards

```typescript
const html = Layout({
	title: 'Product Page',
	description: 'Amazing product with great features',
	image: 'https://example.com/product.jpg',
	twitterCard: 'summary_large_image',
})
```

#### Custom Meta Tags

```typescript
const html = Layout({
	title: 'Product Page',
	customMeta: [
		{ property: 'og:price:amount', content: '29.99' },
		{ property: 'og:price:currency', content: 'USD' },
		{ name: 'keywords', content: 'product, amazing, features' },
		{ name: 'author', content: 'John Doe' },
	],
})
```

### Script and Stylesheet Management

#### Basic Scripts and Stylesheets

```typescript
const html = Layout({
	title: 'My App',
	scripts: ['/app.js', '/analytics.js'],
	stylesheets: ['/styles.css', '/components.css'],
})
```

#### Advanced Script Configuration

```typescript
const html = Layout({
	title: 'My App',
	scripts: [
		'/app.js',
		{ src: '/analytics.js', async: true },
		{ src: '/critical.js', defer: true },
		{ src: '/lazy.js', async: true, defer: true },
	],
	stylesheets: ['/styles.css', '/print.css'],
})
```

### Content Security Policy

```typescript
const html = Layout({
	title: 'Secure App',
	csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
})
```

### Custom Attributes

```typescript
const html = Layout({
	title: 'My App',
	htmlAttributes: {
		lang: 'en',
		'data-theme': 'dark',
	},
	headAttributes: {
		'data-head': 'true',
	},
	bodyAttributes: {
		class: 'app-body',
		'data-page': 'home',
	},
})
```

### Complete Layout Example

Here's a comprehensive example showing all features:

```typescript
import { Layout } from 'honestjs'

const html = Layout({
	title: 'HonestJS - Modern Web Framework',
	description: 'A lightweight, fast web framework built on Hono with TypeScript support',
	image: 'https://honestjs.dev/og-image.png',
	url: 'https://honestjs.dev',
	locale: 'en_US',
	type: 'website',
	siteName: 'HonestJS',
	favicon: '/favicon.ico',
	twitterCard: 'summary_large_image',
	csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
	scripts: ['/app.js', { src: '/analytics.js', async: true }, { src: '/critical.js', defer: true }],
	stylesheets: ['/styles.css', '/components.css'],
	customMeta: [
		{ name: 'keywords', content: 'web framework, typescript, hono, decorators' },
		{ name: 'author', content: 'HonestJS Team' },
		{ property: 'og:site_name', content: 'HonestJS' },
	],
	htmlAttributes: {
		lang: 'en',
		'data-framework': 'honestjs',
	},
	headAttributes: {
		'data-head': 'true',
	},
	bodyAttributes: {
		class: 'app-body',
		'data-page': 'home',
	},
	children: `
		<header>
			<h1>Welcome to HonestJS</h1>
		</header>
		<main>
			<p>A modern web framework for TypeScript and JavaScript</p>
		</main>
		<footer>
			<p>&copy; 2024 HonestJS</p>
		</footer>
	`,
})
```

### Integration with Controllers and JsxRenderer

You can use the Layout component in your controllers with the JsxRenderer middleware:

```typescript
import { Controller, Get, Ctx } from 'honestjs'
import type { Context } from 'hono'

@Controller('pages')
export class PagesController {
	@Get('home')
	home(@Ctx() ctx: Context) {
		return ctx.render(
			<div>
				<h1>Welcome to My App</h1>
				<p>Built with HonestJS</p>
			</div>,
			{
				title: 'Home - My App',
				description: 'Welcome to our application',
			}
		)
	}

	@Get('about')
	about(@Ctx() ctx: Context) {
		return ctx.render(
			<div>
				<h1>About Us</h1>
				<p>We are a modern web development company.</p>
			</div>,
			{
				title: 'About - My App',
				description: 'Learn more about our company',
			}
		)
	}
}
```

### Dynamic Content

You can generate dynamic content based on data:

```typescript
@Controller('products')
export class ProductsController {
	@Get(':id')
	async product(@Ctx() ctx: Context, @Param('id') id: string) {
		const product = await this.productService.findById(id)

		return ctx.render(
			<div>
				<h1>{product.name}</h1>
				<p>{product.description}</p>
				<p>${product.price}</p>
			</div>,
			{
				title: `${product.name} - My Store`,
				description: product.description,
				image: product.image,
				url: `https://mystore.com/products/${id}`,
				type: 'product',
				customMeta: [
					{ property: 'og:price:amount', content: product.price.toString() },
					{ property: 'og:price:currency', content: 'USD' },
				],
			}
		)
	}
}
```

### Layout Best Practices

#### 1. Always Provide a Title

The title is required and crucial for SEO:

```typescript
// ✅ Good
ctx.render(<div>Content</div>, {
	title: 'Page Title',
})

// ❌ Avoid
ctx.render(<div>Content</div>)
```

#### 2. Use Descriptive Descriptions

Provide meaningful descriptions for better SEO:

```typescript
ctx.render(<div>Content</div>, {
	title: 'Product Page',
	description: 'High-quality product with amazing features and competitive pricing',
})
```

#### 3. Include Open Graph Images

Add images for better social media sharing:

```typescript
ctx.render(<div>Content</div>, {
	title: 'Product Page',
	description: 'Amazing product',
	image: 'https://example.com/product.jpg',
})
```

#### 4. Optimize Script Loading

Use appropriate loading strategies for scripts:

```typescript
ctx.render(<div>Content</div>, {
	title: 'My App',
	scripts: [
		{ src: '/critical.js', defer: true }, // Load early but don't block
		{ src: '/analytics.js', async: true }, // Load in parallel
		{ src: '/lazy.js', defer: true }, // Load after page
	],
})
```

#### 5. Set Proper Viewport

The Layout component automatically includes the viewport meta tag for responsive design:

```typescript
// Automatically included:
// <meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

#### 6. Use Content Security Policy

Implement CSP for better security:

```typescript
ctx.render(<div>Content</div>, {
	title: 'Secure App',
	csp: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
})
```

### Performance Considerations

#### 1. Minimize Scripts

Only include necessary scripts:

```typescript
// ✅ Good - Only essential scripts
ctx.render(<div>Content</div>, {
	scripts: ['/app.js', '/analytics.js'],
})

// ❌ Avoid - Too many scripts
ctx.render(<div>Content</div>, {
	scripts: ['/app.js', '/lib1.js', '/lib2.js', '/lib3.js', '/lib4.js', '/lib5.js'],
})
```

#### 2. Use Async/Defer Appropriately

Choose the right loading strategy:

```typescript
ctx.render(<div>Content</div>, {
	scripts: [
		{ src: '/critical.js', defer: true }, // Critical functionality
		{ src: '/analytics.js', async: true }, // Non-critical tracking
		{ src: '/lazy.js', defer: true }, // Lazy-loaded features
	],
})
```

#### 3. Optimize Images

Use optimized images for Open Graph:

```typescript
ctx.render(<div>Content</div>, {
	image: 'https://example.com/optimized-image-1200x630.jpg', // Optimal size for social sharing
})
```

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

::: code-group

```json [tsconfig.json]
{
	"compilerOptions": {
		"jsx": "react-jsx",
		"jsxImportSource": "hono/jsx"
	}
}
```

:::

### 2. Creating Custom Layouts with JSX

Create custom layouts using JSX components for better type safety and maintainability:

::: code-group

```tsx [MainLayout.tsx]
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

You can use your custom layouts in views by rendering JSX components. The Layout component (documented above) provides the foundation for creating consistent HTML structure across your application:

::: code-group

```tsx [users.view.ts]
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

```tsx [Header.tsx]
import { memo } from 'hono/jsx'

export const Header = memo(() => {
	return (
		<header>
			<h1>Honest.js MVC</h1>
		</header>
	)
})
```

```tsx [Footer.tsx]
export const Footer = memo(() => {
	return (
		<footer>
			<p>© {new Date().getFullYear()} Company. All rights reserved.</p>
		</footer>
	)
})
```

```tsx [UserList.tsx]
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

```typescript [users.module.ts]
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

```typescript [users.controller.ts]
// API Controller
@Controller('users')
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

```typescript [users.view.ts]
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

> [!NOTE]
> The `@View` decorator is just a shortcut for `@Controller` without prefix and versioning.
> Make sure to add versioning or prefix to the API controllers to avoid conflicts.

:::

## Service Layer

The service layer handles business logic and data operations:

::: code-group

```typescript [users.service.ts]
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

```typescript [users.controller.ts]
// API for data
@Controller('users', { prefix: 'api', version: 1 })
class UsersApiController {
	@Get()
	async getUsers() {
		return await this.usersService.findAll()
	}
}
```

```typescript [users.view.ts]
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

Always use custom layouts for consistent HTML structure. The Layout component provides comprehensive HTML document structure with SEO optimization:

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

Take advantage of the Layout component's comprehensive SEO features including Open Graph tags, Twitter Cards, and custom meta tags:

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

```tsx [Header.tsx]
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

```tsx [Footer.tsx]
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

```tsx [Dashboard.tsx]
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

```tsx [dashboard.view.ts]
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
