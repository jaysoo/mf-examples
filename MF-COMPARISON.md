# Module Federation Setup Comparison

Six tree comparison across `packages/`:

- `react-rspack` — Rspack CLI + `@module-federation/enhanced`
- `react-rsbuild` — Rsbuild + `@module-federation/enhanced` via `tools.rspack`
- `react-vite` — Vite + `@module-federation/vite`
- `angular-native-fed` — `@angular-architects/native-federation` (esbuild)
- `nx-react` — `@nx/react:host` (Rspack) + `@nx/module-federation`
- `nx-angular` — `@nx/angular:host` (Webpack) + `@nx/module-federation`

---

## At-a-glance

| Tree                 | Bundler                               | MF plugin                                                             | Manifest                                               | Default ports |
| -------------------- | ------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ | ------------- |
| `react-rspack`       | Rspack CLI                            | `@module-federation/enhanced/rspack`                                  | `mf-manifest.json` + `remoteEntry.js`                  | 3000 / 3001-3 |
| `react-rsbuild`      | Rsbuild (Rspack under the hood)       | `@module-federation/enhanced/rspack` via `tools.rspack`               | same                                                   | 3000 / 3001-3 |
| `react-vite`         | Vite (Rolldown)                       | `@module-federation/vite`                                             | `mf-manifest.json` + `remoteEntry.js`                  | 5100 / 5101-3 |
| `angular-native-fed` | esbuild (Angular Application Builder) | `@angular-architects/native-federation`                               | `remoteEntry.json` + host's `federation.manifest.json` | 4200 / 4201-3 |
| `nx-react`           | Rspack                                | `@nx/module-federation` (wraps enhanced)                              | same as enhanced                                       | 4200 / 4201-3 |
| `nx-angular`         | Webpack                               | `@nx/module-federation` (webpack-based MF, **not** Native Federation) | classic `remoteEntry.js`                               | 4200 / 4201-3 |

---

## Feature matrix

| Capability                                                          | rspack                           | rsbuild              | vite              | native-fed                                                    | nx-react                                                                      | nx-angular                 |
| ------------------------------------------------------------------- | -------------------------------- | -------------------- | ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| `dev` HMR everywhere                                                | ✅                               | ✅                   | ✅                | ✅                                                            | ✅                                                                            | ✅                         |
| Built-in `preview` (static serve of built output)                   | ❌ (need sirv-cli / http-server) | ✅ `rsbuild preview` | ✅ `vite preview` | ❌ (use `ng serve --configuration=production` or build+serve) | ✅ `nx run host:serve-static` + `nx run host:preview`                         | ✅ `nx serve-static`       |
| `serve-static` mode (remotes built once, host live)                 | manual (sirv per remote)         | manual (same)        | manual            | manual                                                        | ✅ first-class: `nx serve host` builds static remotes + proxies them          | ✅ same                    |
| Standalone-runnable remote (own port serves `index.html`)           | ✅ (own dev server)              | ✅                   | ✅                | ✅                                                            | ✅ via `nx serve remote1` (also brings up host as dep)                        | ✅ same                    |
| Auto-generated TS types for remote imports                          | ✅ `dts: true` → `@mf-types/`    | ✅ same              | ✅ same           | ❌ uses tsconfig paths                                        | ❌ disabled by default in Nx generator (uses workspace path mappings instead) | ❌ same                    |
| Hot-reload remote → host                                            | ✅                               | ✅                   | ✅                | ✅ via SSE                                                    | ⚠️ static-remote mode rebuilds chunk; dev-remote mode HMRs                    | ⚠️ same                    |
| Cross-bundler remotes (e.g. consume a vite remote from rspack host) | ✅ via `mf-manifest.json`        | ✅                   | ✅                | ❌ different manifest format                                  | ✅                                                                            | ❌ classic webpack-MF only |

---

## Dynamic federation (registering remotes at runtime, no build-time `remotes` config)

Implemented in this repo for 4 trees — each has both a static (`test:e2e`) and a dynamic (`test:e2e:dynamic`) suite. The dynamic suite spawns **only host + remote-1**, proving the host doesn't need every remote dev server running.

| Tree                 | Implementation in this repo                                                                                                                                      | Dynamic e2e                | True dynamic from JSON |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------- |
| `react-rspack`       | Host drops `remotes:` from bundler config; bootstrap fetches `public/mf-remotes.json` and calls `init()`; routes use `loadRemote()`                              | `pnpm test:e2e:dynamic`    | ✅                     |
| `react-rsbuild`      | same as rspack                                                                                                                                                   | `pnpm test:e2e:dynamic`    | ✅                     |
| `react-vite`         | same pattern using `@module-federation/runtime` (separate package because `@module-federation/vite` doesn't bundle the enhanced runtime)                         | `pnpm test:e2e:dynamic`    | ✅                     |
| `angular-native-fed` | Dynamic-by-default. `initFederation('federation.manifest.json')` fetches the manifest at boot; `loadRemoteModule()` triggers per-route fetches. No code changes. | `pnpm test:e2e:dynamic`    | ✅✅                   |
| `nx-react`           | Static `remotes: ['remote1', ...]` in `module-federation.config.ts`; enhanced runtime works if you switch                                                        | not yet                    | ✅ possible            |
| `nx-angular`         | same                                                                                                                                                             | not yet                    | ✅ possible            |

**How the dynamic React setup works:**

1. **Bundler config drops `remotes:`** — the build no longer bakes in a list.
2. **`public/mf-remotes.json`** is a static asset served at `/mf-remotes.json`. Example:
   ```json
   { "remote-1": "remote_1@http://localhost:3001/mf-manifest.json", ... }
   ```
3. **`src/bootstrap.tsx`** (run before React renders):
   ```ts
   import { init } from '@module-federation/enhanced/runtime';
   const manifest = await fetch('/mf-remotes.json').then(r => r.json());
   init({ name: 'host', remotes: Object.entries(manifest).map(([alias, entry]) => {
     const [name, url] = entry.split('@');
     return { name, alias, entry: url };
   }) });
   // …then render React app
   ```
4. **`src/routes.tsx`** swaps `lazy(() => import('remote-1/RoutedApp'))` → `lazy(() => loadRemote('remote-1/RoutedApp'))`.

To swap remote URLs per environment, edit `mf-remotes.json` before serving — no rebuild needed.

**Why it scales:** the federation runtime fetches a remote's `mf-manifest.json` only when `loadRemote()` is called for it. With React Router's `lazy()`, that happens on route navigation. So a host with 30 remotes registered only fetches the 1-3 a given user actually visits.

**Bottom line:** all setups support dynamic federation via the federation runtime API. Angular Native Federation ships it as the default; the React trees here ship both static and dynamic variants you can pick from.

---

## Dev orchestration

| Tree                 | How "run all 4 in dev"                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-rspack`       | `pnpm -F './*' --parallel dev` — root tree-level script                                                                                                                          |
| `react-rsbuild`      | same                                                                                                                                                                             |
| `react-vite`         | `concurrently -k -n host,r1,r2,r3 "pnpm -F ... dev" ...` — needed because Vite boots faster than Rspack and we needed explicit per-port `webServer` entries in Playwright too    |
| `angular-native-fed` | `concurrently -k -n host,r1,r2,r3 "ng serve host" "ng serve remote-1" ...`                                                                                                       |
| `nx-react`           | `nx serve host` auto-builds remotes statically and proxies them via dev server; or `nx run-many --target=serve --projects=host,remote1,remote2,remote3 --parallel=4` for all-dev |
| `nx-angular`         | `nx serve ng-host` does the same orchestration (remotes depend on host)                                                                                                          |

**Nx is the only tree with built-in orchestration.** The plain trees rely on `pnpm` filter parallelism or `concurrently`.

---

## Production preview / static serve

| Tree                 | Story                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-rspack`       | `rspack build` produces `dist/`. No built-in preview — example skips it; `sirv-cli` is the path.                                                                                                                                                                                                                                        |
| `react-rsbuild`      | `rsbuild build` + `rsbuild preview` covers it.                                                                                                                                                                                                                                                                                          |
| `react-vite`         | `vite build` + `vite preview` covers it.                                                                                                                                                                                                                                                                                                |
| `angular-native-fed` | `ng build <app>` produces `dist/<app>/browser/`. No first-class preview — `ng serve --configuration=production` works.                                                                                                                                                                                                                  |
| `nx-react`           | `nx build host` + `nx run host:serve-static` (uses `@nx/web:file-server`). Also `nx run host:preview` runs rspack serve in production mode. **Nx's static-remote orchestration has a known sharp edge** where the remote dist path can be polluted by `tsc`'s typecheck output — working e2e uses `nx run-many --target=serve` instead. |
| `nx-angular`         | `nx serve-static` same idea.                                                                                                                                                                                                                                                                                                            |

---

## Code parity across trees

The **React** trees (rspack, rsbuild, vite) all use byte-identical `src/` (host home + Counter/Form/List). The Nx React tree deviates slightly: the generator uses `remote1` instead of `remote-1` (Nx project-name rules disallow hyphens), and the host's `app.tsx` uses Nx's `module-federation.config.ts` indirection instead of inline `remotes`.

Angular Native Fed and Nx Angular share the same component logic but use Angular's template syntax / signals, so they don't parity with React.

---

## Key trade-offs

### Plain React trees (rspack / rsbuild / vite)

Tightest config, easy to vendor, you own the orchestration. Best when you want to understand exactly what's happening or ship without Nx.

### Angular Native Federation

Simplest config story for Angular, **dynamic-by-default** (manifest at runtime), built on Angular's own esbuild builder. Single concept to learn. Different manifest format means it can't directly consume a webpack/rspack MF remote without a shim.

### Nx-generated trees

Get dev orchestration, TypeScript project refs, and `serve-static` for free, plus all 4 apps managed under one CLI. Cost: project naming rules (no hyphens), the `nx run host:serve` static-remote proxy has edge cases (the typecheck `d.ts` files polluting the dist dir confused the proxy in our session — bypassed with explicit `nx run-many`), and you inherit the whole Nx workspace concept whether you wanted it or not.

### Webpack vs Rspack vs Vite vs esbuild

Rspack and Vite are both 10-50× faster builds than Webpack. Native Federation (esbuild) is fastest for incremental Angular dev. **Nx Angular still defaults to Webpack** — the Nx generator has `--bundler=rspack` but it's newer.

---

## Concrete gotchas hit per stack

- **`react-vite`** — hyphenated remote names in the host config don't match unless `name:` also has hyphens; also macOS AirTunes occupies port 5000 so we picked 5100-5103.
- **`react-rspack`** — `HtmlRspackPlugin` injects `remoteEntry.js` into standalone HTML unless you `excludeChunks: [NAME]`; also lazy compilation of `bootstrap.tsx` is slow on first hit so e2e needed `waitUntil: 'networkidle'` + 30s timeout.
- **`angular-native-fed`** — `ng g init` generated a wrong `federation.manifest.json` (all 3 entries pointed at port 4200, all named `remote1`) — had to fix manually.
- **`nx-react`** — `nx run host:serve` builds static remotes but the proxy ports serve `d.ts` files instead of the rspack output until you explicitly `nx run remote1:rspack:build` (typecheck dist pollutes the path).
- **`nx-angular`** — base tsconfig had `emitDeclarationOnly: true` which Angular CLI refuses (`NG4006`); needs `emitDeclarationOnly: false`, `declaration: false`, `composite: false` override per app's `tsconfig.app.json`. Also `lib: ["es2022", "dom", "dom.iterable"]` needs to be set explicitly since base only ships `["es2022"]`. Selector `app-ng_remote1-entry` (underscore) is invalid for the standalone `index.html` — had to switch to `app-ng-remote1-entry`.
- **`react-rsbuild`** — cleanest of the lot; no real gotchas.

---

## Quick reference: how to run each

```bash
# React trees (each from its own packages/ dir)
cd packages/react-rspack   && pnpm dev && pnpm test:e2e
cd packages/react-rsbuild  && pnpm dev && pnpm test:e2e
cd packages/react-vite     && pnpm dev && pnpm test:e2e

# Angular Native Federation
cd packages/angular-native-fed && pnpm dev && pnpm test:e2e

# Nx-generated trees (from workspace root)
pnpm exec nx run host-e2e:e2e     # nx-react
pnpm exec nx run ng-host-e2e:e2e  # nx-angular
```

Screenshots from e2e are written under each tree's `e2e/screenshots/` (or `host-e2e/screenshots/` for Nx trees).
