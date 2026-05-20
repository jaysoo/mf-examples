# mf-examples

A side-by-side set of working Module Federation examples across the common React and Angular toolchains. Each tree is one host + three remotes (Counter / Form / List), with Playwright e2e + screenshots as proof-of-work.

For an in-depth comparison of capabilities, gotchas, and trade-offs across all setups, see [`MF-COMPARISON.md`](./MF-COMPARISON.md).

## What's here

| Path                                                           | Stack                    | Bundler    | MF plugin                                            | Default ports |
| -------------------------------------------------------------- | ------------------------ | ---------- | ---------------------------------------------------- | ------------- |
| [`packages/react-rspack`](./packages/react-rspack)             | React 19                 | Rspack CLI | `@module-federation/enhanced`                        | 3000 / 3001-3 |
| [`packages/react-rsbuild`](./packages/react-rsbuild)           | React 19                 | Rsbuild    | `@module-federation/enhanced` via `tools.rspack`     | 3000 / 3001-3 |
| [`packages/react-vite`](./packages/react-vite)                 | React 19                 | Vite       | `@module-federation/vite`                            | 5100 / 5101-3 |
| [`packages/angular-native-fed`](./packages/angular-native-fed) | Angular 21               | esbuild    | `@angular-architects/native-federation`              | 4200 / 4201-3 |
| [`packages/nx-react`](./packages/nx-react)                     | React 19, Nx-generated   | Rspack     | `@nx/module-federation`                              | 4200 / 4201-3 |
| [`packages/nx-angular`](./packages/nx-angular)                 | Angular 21, Nx-generated | Webpack    | `@nx/module-federation` (classic MF, not Native Fed) | 4200 / 4201-3 |

Each tree exposes the same three remotes:

- **remote-1 / remote1** — `useState` Counter with +/-/reset buttons
- **remote-2 / remote2** — Controlled Form (Name/Email/Message) that echoes the submitted payload
- **remote-3 / remote3** — Fetches users from `jsonplaceholder.typicode.com` and renders the list

Each remote is also independently runnable on its own port — federation-loaded _and_ standalone work.

## Setup

```bash
pnpm install
```

The workspace uses pnpm workspaces (`packages/*` and `packages/*/*` globbed). Node and pnpm versions are in `.nvmrc` / `packageManager` (Node 20+, pnpm 10).

## How to run each stack

### React + Rspack (`packages/react-rspack`)

```bash
cd packages/react-rspack
pnpm dev               # boots host (3000) + 3 remotes (3001/2/3), each its own dev server
pnpm build             # production builds for all 4 apps -> dist/
pnpm test:e2e          # Playwright; screenshots in e2e/screenshots/
```

Each app also runs in isolation: `cd host && pnpm dev`, etc.

### React + Rsbuild (`packages/react-rsbuild`)

```bash
cd packages/react-rsbuild
pnpm dev
pnpm build
pnpm preview           # rsbuild's built-in static server for the built dist/
pnpm test:e2e
```

### React + Vite (`packages/react-vite`)

```bash
cd packages/react-vite
pnpm dev               # uses concurrently to orchestrate the 4 vite servers
pnpm build
pnpm preview
pnpm test:e2e
```

Ports are 5100-5103 (not 5000-5003) — macOS AirTunes hijacks port 5000 on the IPv4 wildcard, which Vite is sensitive to.

### Angular Native Federation (`packages/angular-native-fed`)

```bash
cd packages/angular-native-fed
pnpm dev               # concurrently runs 4 ng serves
pnpm build             # ng build each app
pnpm test:e2e
```

The host loads remote URLs from `projects/host/public/federation.manifest.json` at runtime — change that JSON to point at different remote URLs without rebuilding. This is the only tree designed around dynamic federation as the default.

### Nx React (`packages/nx-react`)

These trees are managed by Nx at the workspace root, not via per-tree scripts. Run from the repo root (the `NX_IGNORE_UNSUPPORTED_TS_SETUP=true` env var is needed because the workspace was bootstrapped as `@nx/js:typescript` which Angular's plugin doesn't fully support):

```bash
# host + all 3 remotes in dev (parallel dev servers — most reliable for this repo)
NX_IGNORE_UNSUPPORTED_TS_SETUP=true \
  pnpm exec nx run-many --target=serve --projects=host,remote1,remote2,remote3 --parallel=4

# OR — the canonical Nx pattern: serve any single remote, host comes up automatically,
# the other two remotes are built once and statically proxied
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run remote2:serve

# OR — serve host directly, the plugin builds + static-serves all 3 remotes
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run host:serve

# e2e + screenshots
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run host-e2e:e2e
```

If you ever `nx reset` or delete `tmp/static-remotes/`, pre-build the other remotes once so the static proxy has files to serve:

```bash
NX_IGNORE_UNSUPPORTED_TS_SETUP=true \
  pnpm exec nx run-many --target=rspack:build --projects=remote1,remote2,remote3 --configuration=development
```

### Nx Angular (`packages/nx-angular`)

```bash
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run ng-host:serve
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run ng-host-e2e:e2e
```

Project names: `ng-host` plus `ng_remote1` / `ng_remote2` / `ng_remote3` (Nx's project-name rules disallow hyphens in the federation specifier, and we needed a different host name to avoid collision with the Nx React `host` project).

## Screenshots

Each tree's e2e captures 7 full-page screenshots:

- `01-home.png` — host home page listing the 3 remotes
- `02-remote-1-counter.png` — federated Counter route inside the host
- `03-remote-2-form.png` — federated Form route inside the host
- `04-remote-3-list.png` — federated List route inside the host
- `05-standalone-remote-1.png` — remote 1 visited on its own port (no host nav)
- `06-standalone-remote-2.png` — remote 2 standalone
- `07-standalone-remote-3.png` — remote 3 standalone

Locations:

- React (non-Nx): `packages/react-*/e2e/screenshots/`
- Angular Native Fed: `packages/angular-native-fed/e2e/screenshots/`
- Nx trees: `packages/nx-*/host-e2e/screenshots/`

All screenshot directories are gitignored — they regenerate on every `test:e2e` run.

## Comparing trees

The React `src/` is byte-identical across `react-rspack`, `react-rsbuild`, and `react-vite` — only the bundler config differs. That's intentional, so you can `diff -r` and see exactly what changes when you swap bundlers.

The Nx React tree diverges slightly because the Nx generator uses `remote1` (no hyphen — Nx project name rule) and the host references remotes via `module-federation.config.ts` instead of inline plugin config.

The Angular trees are functionally equivalent but use Angular template/signals syntax, so they don't parity with React.

## Key files per tree

| Concern           | Plain React (rspack/rsbuild/vite)                | Angular Native Fed                                        | Nx React                                              | Nx Angular                                        |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Bundler config    | `<app>/{rspack,rsbuild,vite}.config.ts`          | `projects/<app>/` (Angular CLI handles it)                | `<app>/rspack.config.ts`                              | `<app>/webpack.config.ts`                         |
| Federation config | inline in bundler config                         | `projects/<app>/federation.config.js`                     | `<app>/module-federation.config.ts`                   | `<app>/module-federation.config.ts`               |
| Remote URL list   | inline `remotes: {...}` in host's bundler config | `projects/host/public/federation.manifest.json` (runtime) | host's `module-federation.config.ts` `remotes: [...]` | same                                              |
| Exposed entry     | `src/RoutedApp.tsx` (React)                      | `projects/<remote>/src/app/remote-entry/entry.ts`         | `<remote>/src/remote-entry.ts`                        | `projects/<remote>/src/app/remote-entry/entry.ts` |

## License

MIT
