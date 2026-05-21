# mf-examples

A side-by-side set of working Module Federation examples across the common React and Angular toolchains. Each tree is one host + three remotes (Counter / Form / List), with Playwright e2e + screenshots as proof-of-work.

For an in-depth comparison of capabilities, gotchas, and trade-offs across all setups, see [`MF-COMPARISON.md`](./MF-COMPARISON.md).

## What's here

| Path                                                   | Stack                    | Bundler    | MF plugin                                            | Default ports |
| ------------------------------------------------------ | ------------------------ | ---------- | ---------------------------------------------------- | ------------- |
| [`apps/react-rspack`](./apps/react-rspack)             | React 19                 | Rspack CLI | `@module-federation/enhanced`                        | 3000 / 3001-3 |
| [`apps/react-rsbuild`](./apps/react-rsbuild)           | React 19                 | Rsbuild    | `@module-federation/enhanced` via `tools.rspack`     | 3000 / 3001-3 |
| [`apps/react-vite`](./apps/react-vite)                 | React 19                 | Vite       | `@module-federation/vite`                            | 5100 / 5101-3 |
| [`apps/angular-native-fed`](./apps/angular-native-fed) | Angular 21               | esbuild    | `@angular-architects/native-federation`              | 4200 / 4201-3 |
| [`apps/nx-react`](./apps/nx-react)                     | React 19, Nx-generated   | Rspack     | `@nx/module-federation`                              | 4200 / 4201-3 |
| [`apps/nx-angular`](./apps/nx-angular)                 | Angular 21, Nx-generated | Webpack    | `@nx/module-federation` (classic MF, not Native Fed) | 4200 / 4201-3 |
| [`apps/nx-react-vite`](./apps/nx-react-vite)           | React 19, Nx-managed     | Vite       | `@module-federation/vite` + Nx `dependsOn` graph     | 5200 / 5201-3 |

Each tree exposes the same three remotes:

- **remote-1 / remote1** — `useState` Counter with +/-/reset buttons
- **remote-2 / remote2** — Controlled Form (Name/Email/Message) that echoes the submitted payload
- **remote-3 / remote3** — Fetches users from `jsonplaceholder.typicode.com` and renders the list

Each remote is also independently runnable on its own port — federation-loaded _and_ standalone work.

## Setup

```bash
pnpm install
```

The workspace uses pnpm workspaces (`apps/*` and `apps/*/*` globbed). Node and pnpm versions are in `.nvmrc` / `packageManager` (Node 20+, pnpm 10).

## How to run each stack

### Running a subset of apps (non-Nx trees)

Because federation is dynamic + lazy in every tree, the host renders fine when only the remotes you actively visit are running. Use `pnpm -F` filters to pick which apps boot:

```bash
# Just the host (no remotes — home page works; visiting /remote-N falls
# back to the RemoteErrorBoundary gracefully)
pnpm -F <tree>-host dev

# Host + one remote
pnpm -F <tree>-host -F <tree>-remote-1 --parallel dev

# Host + all 3 remotes
pnpm -F <tree>-host -F <tree>-remote-1 -F <tree>-remote-2 -F <tree>-remote-3 --parallel dev

# Or the all-in-one root script (same as the last line above)
pnpm dev
```

`<tree>` is `react-rspack`, `react-rsbuild`, `react-vite`, or `angular-native-fed`. For Angular use `host` / `remote-1` / `remote-2` / `remote-3` (no tree prefix on the project name).

### React + Rspack (`apps/react-rspack`)

```bash
cd apps/react-rspack
pnpm dev               # all 4 dev servers (host 3000, remotes 3001-3003)
pnpm build             # production builds for all 4 apps -> dist/
pnpm test:e2e          # Playwright; screenshots in e2e/screenshots/
```

### React + Rsbuild (`apps/react-rsbuild`)

```bash
cd apps/react-rsbuild
pnpm dev
pnpm build
pnpm preview           # rsbuild's built-in static server for the built dist/
pnpm test:e2e
```

### React + Vite (`apps/react-vite`)

```bash
cd apps/react-vite
pnpm dev               # uses concurrently to orchestrate the 4 vite servers
pnpm build
pnpm preview
pnpm test:e2e
```

Ports are 5100-5103 (not 5000-5003) — macOS AirTunes hijacks port 5000 on the IPv4 wildcard, which Vite is sensitive to.

### Angular Native Federation (`apps/angular-native-fed`)

```bash
cd apps/angular-native-fed
pnpm dev               # concurrently runs 4 ng serves

# Subset: edit the dev script or call ng serve directly
ng serve host          # just host
ng serve remote-1      # just remote-1 standalone

pnpm build             # ng build each app
pnpm test:e2e
```

The host loads remote URLs from `projects/host/public/federation.manifest.json` at runtime — change that JSON to point at different remote URLs without rebuilding. This is the only tree designed around dynamic federation as the default.

### Nx React (`apps/nx-react`)

Managed by Nx at the workspace root, not via per-tree scripts. Each remote's `serve` `dependsOn` lists the host's `serve` — so **serve any single remote and the host comes up automatically**. You almost never need to invoke `host:serve` directly.

```bash
# Just one remote (host comes up as a dependency)
pnpm exec nx serve remote1

# A subset
pnpm exec nx run-many --target=serve --projects=remote1,remote2 --parallel

# All 3 + host
pnpm exec nx run-many --target=serve --projects=remote1,remote2,remote3 --parallel

# E2E + screenshots
pnpm exec nx run host-e2e:e2e
```

If you ever `nx reset` or delete `tmp/static-remotes/`, pre-build the remotes once so the static-remote proxy in the host's serve has files to read:

```bash
pnpm exec nx run-many --target=rspack:build --projects=remote1,remote2,remote3 --configuration=development
```

### Nx Angular (`apps/nx-angular`)

Same pattern — serve a remote, host comes up via `dependsOn`:

```bash
pnpm exec nx serve ng_remote1
pnpm exec nx run-many --target=serve --projects=ng_remote1,ng_remote2 --parallel
pnpm exec nx run ng-host-e2e:e2e
```

Project names: `ng-host` plus `ng_remote1` / `ng_remote2` / `ng_remote3` (Nx's project-name rules disallow hyphens in the federation specifier, and we needed a different host name to avoid collision with the Nx React `host` project).

### Nx-managed React + Vite (`apps/nx-react-vite`)

Vite tree wrapped with the minimum Nx config to enable `dependsOn` + continuous tasks. Each remote's `serve` `dependsOn` lists only `nx-react-vite-host:serve`, so **serving any one remote brings up the host alongside it** — the other remotes are left off. Because federation is dynamic, the host's home + visited-remote routes still render; unstarted remotes hit the `RemoteErrorBoundary` gracefully.

```bash
# Serve one remote (host comes up automatically)
pnpm exec nx serve nx-react-vite-remote-1

# Serve a subset
pnpm exec nx run-many --target=serve \
  --projects=nx-react-vite-remote-1,nx-react-vite-remote-2 --parallel

# E2E (proves host + 1 remote is a valid working setup)
cd apps/nx-react-vite && pnpm test:e2e
```

Ports: 5200 (host) / 5201-5203 (remotes). The orchestration uses plain `nx:run-commands` with `continuous: true` + `dependsOn` — no custom executor required. See [`apps/nx-react-vite/README.md`](./apps/nx-react-vite/README.md) for the full task graph + note on why `@nx/module-federation` custom executors don't apply to Vite hosts in v22.7.

## Key files per tree

| Concern           | Plain React (rspack/rsbuild/vite)                | Angular Native Fed                                        | Nx React                                              | Nx Angular                                        |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Bundler config    | `<app>/{rspack,rsbuild,vite}.config.ts`          | `projects/<app>/` (Angular CLI handles it)                | `<app>/rspack.config.ts`                              | `<app>/webpack.config.ts`                         |
| Federation config | inline in bundler config                         | `projects/<app>/federation.config.js`                     | `<app>/module-federation.config.ts`                   | `<app>/module-federation.config.ts`               |
| Remote URL list   | inline `remotes: {...}` in host's bundler config | `projects/host/public/federation.manifest.json` (runtime) | host's `module-federation.config.ts` `remotes: [...]` | same                                              |
| Exposed entry     | `src/RoutedApp.tsx` (React)                      | `projects/<remote>/src/app/remote-entry/entry.ts`         | `<remote>/src/remote-entry.ts`                        | `projects/<remote>/src/app/remote-entry/entry.ts` |

> [!WARNING]
> **`@nx/s3-cache` is deprecated.**
> `@nx/s3-cache` provides an S3-backed remote cache for Nx. The CREEP vulnerability ([CVE-2025-36852](https://www.cve.org/CVERecord?id=CVE-2025-36852)) affects this package. The flaw is in its design and cannot be patched. The package remains on npm but will not receive updates.
>
> See the [deprecation notice](https://nx.dev/docs/deprecations/self-hosted-cache-packages) for migration paths.
