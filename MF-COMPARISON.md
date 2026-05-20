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

| Tree                 | Static config                                                                                                                                        | Runtime register API                                                                                          | True dynamic from JSON                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-rspack`       | `remotes: {...}` in plugin (what we use)                                                                                                             | `init({ remotes: [{name, entry}] })` + `loadRemote('name/expose')` from `@module-federation/enhanced/runtime` | ✅ runtime API can fetch any JSON and call `init` with it                                                                                                |
| `react-rsbuild`      | same                                                                                                                                                 | same                                                                                                          | same                                                                                                                                                     |
| `react-vite`         | `remotes: {...}` (what we use)                                                                                                                       | runtime API exposed (same enhanced runtime)                                                                   | ✅                                                                                                                                                       |
| `angular-native-fed` | optional — `federation.manifest.json` is loaded **at runtime** by `initFederation('federation.manifest.json')`; remotes are NOT baked into the build | `loadRemoteModule('name', './expose')`                                                                        | ✅✅ **native** model — manifest can be different per environment without rebuilding                                                                     |
| `nx-react`           | `remotes: ['remote1', ...]` in `module-federation.config.ts` (what we use)                                                                           | enhanced runtime works                                                                                        | ✅ Nx supports tuple syntax `remotes: [['my-remote', 'https://...']]` for external (non-workspace) remotes; can also pass `--dynamic` at generation time |
| `nx-angular`         | same                                                                                                                                                 | same                                                                                                          | ✅ same                                                                                                                                                  |

**Bottom line:** all setups support dynamic federation via the federation runtime API.

**Angular Native Federation is the only one designed around it as the default.** The manifest URL is loaded at runtime via `initFederation('/assets/federation.manifest.json')`, so you can ship the same build to dev/staging/prod with a different manifest per env. The webpack/rspack-based options technically support the same pattern but you have to choose to use the runtime API instead of the plugin-config approach.

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
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run host-e2e:e2e     # nx-react
NX_IGNORE_UNSUPPORTED_TS_SETUP=true pnpm exec nx run ng-host-e2e:e2e  # nx-angular
```

Screenshots from e2e are written under each tree's `e2e/screenshots/` (or `host-e2e/screenshots/` for Nx trees).
