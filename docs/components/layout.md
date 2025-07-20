# Layout Component

The Layout component is a powerful server-side rendering utility that provides a comprehensive HTML document structure with SEO optimization, flexible configuration, and modern web standards support.

## Overview

The Layout component is designed for building full-stack applications with HonestJS, providing a clean way to generate complete HTML documents with proper meta tags, scripts, stylesheets, and content. It works seamlessly with the JsxRenderer middleware to provide automatic layout wrapping.

## Basic Usage

```typescript
import { Layout } from 'honestjs'

const html = Layout({
	title: 'My Application',
	description: 'A modern web application built with HonestJS',
	children: '<h1>Hello World</h1>',
})
```

### Using Layout with JSX and JsxRenderer Middleware

For better type safety and maintainability, you can create custom layouts using JSX that work with the JsxRenderer middleware:

```tsx
// layouts/MainLayout.tsx
import { Layout, type SiteData } from 'honestjs'
import type { PropsWithChildren } from 'hono/jsx'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

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

// Using the custom layout with JsxRenderer middleware
// main.ts
import { Application } from 'honestjs'
import { JsxRendererMiddleware } from '@honestjs/middleware'
import { MainLayout } from './layouts/MainLayout'

const { hono } = await Application.create(AppModule, {
	components: {
		middleware: [new JsxRendererMiddleware(MainLayout)],
	},
})

// In your controller
@Controller('pages')
class PagesController {
	@Get('home')
	async home(@Ctx() ctx: Context) {
		return ctx.render(
			<div>
				<h1>Hello World</h1>
			</div>,
			{
				title: 'My Application',
				description: 'A modern web application built with HonestJS',
			}
		)
	}
}
```

## Configuration Options

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

## SEO Optimization

The Layout component automatically generates comprehensive SEO meta tags:

### Basic SEO

```typescript
const html = Layout({
	title: 'Product Page',
	description: 'Amazing product with great features',
	url: 'https://example.com/product',
	siteName: 'My Store',
})
```

### Open Graph Tags

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

### Twitter Cards

```typescript
const html = Layout({
	title: 'Product Page',
	description: 'Amazing product with great features',
	image: 'https://example.com/product.jpg',
	twitterCard: 'summary_large_image',
})
```

### Custom Meta Tags

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

## Script and Stylesheet Management

### Basic Scripts and Stylesheets

```typescript
const html = Layout({
	title: 'My App',
	scripts: ['/app.js', '/analytics.js'],
	stylesheets: ['/styles.css', '/components.css'],
})
```

### Advanced Script Configuration

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

## Content Security Policy

```typescript
const html = Layout({
	title: 'Secure App',
	csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
})
```

## Custom Attributes

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

## Integration with Controllers and JsxRenderer

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

## Dynamic Content

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

## Complete Example

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

## Best Practices

### 1. Always Provide a Title

The title is required and crucial for SEO:

```typescript
// ✅ Good
ctx.render(<div>Content</div>, {
	title: 'Page Title',
})

// ❌ Avoid
ctx.render(<div>Content</div>)
```

### 2. Use Descriptive Descriptions

Provide meaningful descriptions for better SEO:

```typescript
ctx.render(<div>Content</div>, {
	title: 'Product Page',
	description: 'High-quality product with amazing features and competitive pricing',
})
```

### 3. Include Open Graph Images

Add images for better social media sharing:

```typescript
ctx.render(<div>Content</div>, {
	title: 'Product Page',
	description: 'Amazing product',
	image: 'https://example.com/product.jpg',
})
```

### 4. Optimize Script Loading

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

### 5. Set Proper Viewport

The Layout component automatically includes the viewport meta tag for responsive design:

```typescript
// Automatically included:
// <meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

### 6. Use Content Security Policy

Implement CSP for better security:

```typescript
ctx.render(<div>Content</div>, {
	title: 'Secure App',
	csp: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
})
```

## Performance Considerations

### 1. Minimize Scripts

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

### 2. Use Async/Defer Appropriately

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

### 3. Optimize Images

Use optimized images for Open Graph:

```typescript
ctx.render(<div>Content</div>, {
	image: 'https://example.com/optimized-image-1200x630.jpg', // Optimal size for social sharing
})
```

The Layout component provides a powerful foundation for building modern, SEO-friendly web applications with HonestJS, working seamlessly with the JsxRenderer middleware for automatic layout wrapping.
