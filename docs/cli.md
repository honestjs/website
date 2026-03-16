# CLI

The HonestJS CLI (`@honestjs/cli`) scaffolds projects and generates files. Install it globally:

```bash
bun add -g @honestjs/cli
```

Aliases: `honestjs`, `honest`, `hnjs`.

## Commands

### new

Create a new HonestJS project from a template.

```bash
honestjs new [project-name]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-t, --template <template>` | Template to use: `barebone`, `blank`, `mvc` |
| `-p, --package-manager <manager>` | Package manager: `bun`, `npm`, `yarn`, `pnpm` |
| `--typescript` | Use TypeScript (default) |
| `--no-typescript` | Skip TypeScript |
| `--eslint` | Add ESLint configuration |
| `--no-eslint` | Skip ESLint |
| `--prettier` | Add Prettier configuration |
| `--no-prettier` | Skip Prettier |
| `--docker` | Add Docker configuration |
| `--no-docker` | Skip Docker |
| `--git` | Initialize git repository |
| `--no-git` | Skip git initialization |
| `--install` | Install dependencies after creation |
| `--no-install` | Skip dependency installation |
| `-y, --yes` | Skip prompts and use defaults |
| `--offline` | Use cached templates only (no network) |
| `--refresh-templates` | Force refresh template cache before use |

**Examples:**

```bash
honestjs new my-app
honestjs new my-app -t mvc -y
honestjs new my-app --template barebone --package-manager pnpm
```

---

### list

List available templates with optional filtering.

```bash
honestjs list
```

**Options:**

| Option | Description |
|--------|-------------|
| `-j, --json` | Output in JSON format |
| `-c, --category <category>` | Filter by category |
| `-t, --tag <tag>` | Filter by tag |
| `--offline` | Use cached templates only (no network) |
| `--refresh-templates` | Force refresh template cache before use |

**Examples:**

```bash
honestjs list
honestjs list --json
honestjs list --category app
honestjs list --tag minimal
```

---

### info

Show CLI version, available templates, and environment info.

```bash
honestjs info
```

Displays:

- CLI version
- Runtime (Bun or Node.js)
- Templates repository
- Available templates
- Node.js version, platform, architecture
- Useful links (docs, GitHub, templates, issues)

---

### doctor

Diagnose environment: runtime, git, package managers, template cache, and network.

```bash
honestjs doctor
```

Checks:

- **Runtime** – Bun or Node.js (Node >= 18 required)
- **Git** – Whether git is installed
- **Package managers** – bun, npm, yarn, pnpm
- **Templates** – Whether template cache exists (run `honestjs list` or `new` first)
- **Network** – GitHub API reachability

---

### generate

Generate files from schematics. Alias: `g`.

```bash
honestjs generate <schematic> <name>
honestjs g <schematic> <name>
```

**Schematics:**

| Schematic | Alias | Description |
|-----------|-------|-------------|
| `controller` | `c` | Generate a controller |
| `service` | `s` | Generate a service |
| `module` | `m` | Generate a module |
| `view` | `v` | Generate a view |
| `middleware` | `c-m` | Generate a middleware |
| `guard` | `c-g` | Generate a guard |
| `filter` | `c-f` | Generate a filter |
| `pipe` | `c-p` | Generate a pipe |

**Options:**

| Option | Description |
|--------|-------------|
| `-p, --path <path>` | Specify the path where the file should be created |
| `-f, --flat` | Create files in a flat structure |
| `--force` | Overwrite existing files without prompting |
| `--dry-run` | Show what would be created without writing files |
| `--skip-import` | Skip importing the generated item |
| `--export` | Export the generated item |

**Examples:**

```bash
honestjs g controller user
honestjs g service user
honestjs g module users
honestjs g view users
honestjs g middleware logger
honestjs g guard auth
honestjs g filter notfound
honestjs g pipe parseInt
honestjs g controller user --force
honestjs g controller user --dry-run
```

**Output locations:**

- `controller user` → `modules/users/users.controller.ts`
- `service user` → `modules/users/users.service.ts`
- `module users` → `modules/users/users.module.ts`
- `view users` → `modules/users/users.view.tsx`
- `middleware logger` → `components/logger/logger.middleware.ts`
- `guard auth` → `components/auth/auth.guard.ts`
- `filter notfound` → `components/notfound/notfound.filter.ts`
- `pipe parseInt` → `components/parseint/parseint.pipe.ts`
