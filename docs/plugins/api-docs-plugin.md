# API Docs Plugin

The API Docs Plugin generates OpenAPI JSON from an artifact and serves it together with Swagger UI. The artifact can be provided as a direct object or as an application context key (for example from [RPC Plugin](./rpc-plugin)).

## Installation

```bash
npm install @honestjs/api-docs-plugin
# or
yarn add @honestjs/api-docs-plugin
# or
pnpm add @honestjs/api-docs-plugin
```

## Basic Setup

### Using artifact from RPC Plugin

The RPC plugin writes its artifact to the application context. Pass the context key so API Docs can read it. Ensure RPC runs **before** ApiDocs in the plugins array:

```typescript
import { Application } from 'honestjs'
import { RPCPlugin } from '@honestjs/rpc-plugin'
import { ApiDocsPlugin } from '@honestjs/api-docs-plugin'
import AppModule from './app.module'

const { hono } = await Application.create(AppModule, {
	plugins: [new RPCPlugin(), new ApiDocsPlugin({ artifact: 'rpc.artifact' })],
})

export default hono
```

If RPC uses custom `context.namespace` or `context.keys.artifact`, pass the resulting full key (for example `custom.artifact`) to `artifact`.

By default:

- **OpenAPI JSON:** `/openapi.json`
- **Swagger UI:** `/docs`

### Using a direct artifact

You can pass the artifact object directly instead of a context key:

```typescript
import { ApiDocsPlugin } from '@honestjs/api-docs-plugin'

const artifact = {
	routes: [
		{
			method: 'GET',
			handler: 'list',
			controller: 'UsersController',
			fullPath: '/users',
			parameters: [],
		},
	],
	schemas: [],
}

// In Application.create options:
plugins: [new ApiDocsPlugin({ artifact })]
```

## Configuration Options

```typescript
interface ApiDocsPluginOptions {
	// Required: artifact — direct object or context key (resolved via app.getContext().get)
	artifact: OpenApiArtifactInput | string

	// OpenAPI metadata (when converting artifact to spec)
	title?: string
	version?: string
	description?: string
	servers?: readonly { url: string; description?: string }[]

	// Serving
	openApiRoute?: string // default: '/openapi.json'
	uiRoute?: string // default: '/docs'
	uiTitle?: string // default: 'API Docs'
	reloadOnRequest?: boolean // default: false
}
```

| Option | Description |
|--------|-------------|
| `artifact` | **Required.** Either a context key string (e.g. `'rpc.artifact'`) or a direct `{ routes, schemas }` object. |
| `title`, `version`, `description`, `servers` | OpenAPI document metadata. |
| `openApiRoute` | Path where the OpenAPI JSON is served. Default: `'/openapi.json'`. |
| `uiRoute` | Path where Swagger UI is served. Default: `'/docs'`. |
| `uiTitle` | Title shown in the Swagger UI page. Default: `'API Docs'`. |
| `reloadOnRequest` | If `true`, the spec is regenerated on each request; otherwise it is cached. Default: `false`. |

## Custom OpenAPI metadata

```typescript
new ApiDocsPlugin({
	artifact: 'rpc.artifact',
	title: 'My API',
	version: '1.0.0',
	description: 'REST API for the application.',
	servers: [{ url: 'https://api.example.com', description: 'Production' }],
	openApiRoute: '/api-spec.json',
	uiRoute: '/api-docs',
	uiTitle: 'My API Docs',
})
```

## Programmatic API

For custom workflows (e.g. writing the spec to a file), use the exported utilities:

```typescript
import {
	fromArtifactSync,
	write,
	type OpenApiArtifactInput,
	type OpenApiDocument,
} from '@honestjs/api-docs-plugin'

const artifact: OpenApiArtifactInput = { routes: [...], schemas: [...] }
const spec: OpenApiDocument = fromArtifactSync(artifact, {
	title: 'My API',
	version: '1.0.0',
})
await write(spec, './generated/openapi.json')
```

## Integration with RPC Plugin

See [RPC Plugin — Application Context Artifact](./rpc-plugin#application-context-artifact) for how the RPC plugin publishes its artifact. Use the same context key in `ApiDocsPlugin({ artifact: 'rpc.artifact' })` so API Docs can generate the OpenAPI spec from the same routes and schemas.
