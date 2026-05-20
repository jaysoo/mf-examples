# nx-react-vite

A minimal Nx-wrapped version of `apps/react-vite`. Same React + Vite + `@module-federation/vite` setup, same dynamic-federation host code, **but** managed by Nx so `nx serve <remote>` brings up the host alongside it via `dependsOn` + continuous tasks. Because federation is dynamic and lazy, you only need the remotes you're actively touching — the rest can be left off without breaking the host.

## How

Each app's `package.json` carries an inline `"nx"` block (no separate `project.json`; top-level `name` is enough for Nx to discover the project):

- **host** declares `serve` (continuous, runs `vite dev`), `serve-static` (continuous, `vite preview` after `vite build`), and `build`.
- **remote-N** declares the same, plus on `serve` `dependsOn: ["nx-react-vite-host:serve"]` — that's the only build-time link. Sibling remotes are *not* pulled in.

So `nx serve nx-react-vite-remote-1`:

```
Task graph:
  nx-react-vite-host:serve     (continuous, vite dev → 5200)
  nx-react-vite-remote-1:serve (continuous, vite dev → 5201)
```

Only two processes. `/remote-1` works in the host. `/remote-2` and `/remote-3` are wired into the host's nav, but visiting them lazily tries to fetch from 5202/5203 — those don't exist, so the `<RemoteErrorBoundary>` shows a friendly error. Home page never touches a remote. Everything else still works.

When you need a sibling, start it too:

```bash
pnpm exec nx run-many --target=serve \
  --projects=nx-react-vite-remote-1,nx-react-vite-remote-2 --parallel
```

Or, if you want all 3 served-but-static (CI / smoke / preview mode):

```bash
pnpm exec nx run-many --target=serve-static \
  --projects=nx-react-vite-remote-1,nx-react-vite-remote-2,nx-react-vite-remote-3 --parallel
# plus host:
pnpm exec nx serve nx-react-vite-host
```

## Run

```bash
# Serve any single remote; the host comes up as a dependency
pnpm exec nx serve nx-react-vite-remote-1
pnpm exec nx serve nx-react-vite-remote-2
pnpm exec nx serve nx-react-vite-remote-3

# Or just the host
pnpm exec nx serve nx-react-vite-host

# E2E (boots host + remote-1 only — verifies host doesn't fail when
# remote-2 / remote-3 servers are missing)
cd apps/nx-react-vite && pnpm test:e2e
```

## Ports

- host: 5200
- remote-1: 5201
- remote-2: 5202
- remote-3: 5203

(5100-5103 are used by the sibling `apps/react-vite/` so the two trees can run side-by-side.)

## On `@nx/module-federation` custom executors

The original goal asked whether we could plug in `@nx/module-federation` custom executors to manage the static-serve. As of `@nx/module-federation@22.7.2`, **the package ships an empty `executors.json`** (`{ "executors": {} }`). All its static-serve orchestration lives inside the rspack/webpack bundler plugin (`NxModuleFederationDevServerPlugin`), not as a runnable executor.

For a Vite host (which uses `@module-federation/vite`, an unrelated community plugin), there's nothing in `@nx/module-federation` to invoke. We fell back to vanilla `nx:run-commands` + `dependsOn` + `continuous`, which gives the same UX without depending on a bundler-coupled plugin.

## Key files

- `host/package.json` — host's Nx targets
- `remote-*/package.json` — `serve` dependsOn `[nx-react-vite-host:serve]` only
- `host/public/mf-remotes.json` — runtime manifest of remote URLs (dynamic federation; host fetches this lazily on first remote-route visit)
- `host/src/routes.tsx` — per-route `registerRemotes` + `loadRemote` (truly lazy: nothing federation-related happens until a remote-N route is navigated to)
- `playwright.config.ts` — single `webServer` entry running `nx serve nx-react-vite-remote-1`, proving host + 1 remote is a viable working setup
