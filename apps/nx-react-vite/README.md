# nx-react-vite

A minimal Nx-wrapped version of `apps/react-vite`. Same React + Vite + `@module-federation/vite` setup, same dynamic-federation host code, **but** managed by Nx so a single `nx serve <remote>` invocation brings up the whole MF graph (host + sibling remotes as static-served) via `dependsOn` and continuous tasks.

## How

Each app's `package.json` carries an inline `"nx"` block:

- **host** declares `serve` (continuous, runs `vite dev`), `serve-static` (continuous, `vite preview` after `vite build`), and `build`.
- **remote-N** declares the same, plus on `serve` `dependsOn` it lists:
  - the host's `serve`
  - the OTHER two remotes' `serve-static`

So `nx serve nx-react-vite-remote-1`:

```
Task graph:
  nx-react-vite-host:serve         (continuous, vite dev → 5200)
  nx-react-vite-remote-2:serve-static (depsOn build → vite preview → 5202)
  nx-react-vite-remote-3:serve-static (depsOn build → vite preview → 5203)
  nx-react-vite-remote-1:serve     (continuous, vite dev → 5201)
```

All four start in parallel; Nx waits for the build dependencies to finish before launching each `vite preview`. The whole thing is one command.

## Run

From the workspace root (or anywhere — Nx is project-aware):

```bash
# Serve any remote; host + the OTHER two come up as static-serve
pnpm exec nx serve nx-react-vite-remote-1
pnpm exec nx serve nx-react-vite-remote-2
pnpm exec nx serve nx-react-vite-remote-3

# Or serve just the host (no remotes — useful for verifying host loads
# without any remote being reachable, since federation is dynamic)
pnpm exec nx serve nx-react-vite-host

# E2E (boots the graph via nx serve nx-react-vite-remote-1)
cd apps/nx-react-vite && pnpm test:e2e
```

## Ports

- host: 5200
- remote-1: 5201
- remote-2: 5202
- remote-3: 5203

(5100-5103 are used by the sibling `apps/react-vite/` so the two trees can run side-by-side.)

## On `@nx/module-federation` custom executors

The user asked whether we could plug in `@nx/module-federation` custom executors to manage the static-serve. As of `@nx/module-federation@22.7.2`, **the package ships an empty `executors.json`** (`{ "executors": {} }`). All its static-serve orchestration lives inside the rspack/webpack bundler plugin (`NxModuleFederationDevServerPlugin`), not as a runnable executor.

For a Vite host (which uses `@module-federation/vite`, an unrelated community plugin), there's nothing in `@nx/module-federation` to invoke. We fell back to vanilla `nx:run-commands` + `dependsOn` + `continuous`, which gives the same UX without depending on a bundler-coupled plugin.

If `@nx/module-federation` ever ships an executor we could parameterize independently of the bundler, we could swap it in here — until then, the `nx:run-commands` flavor is intentional, not a workaround.

## Key files

- `host/package.json` — host's Nx target config
- `remote-1/package.json` — remote-1's `serve` dependsOn graph
- `remote-2/package.json`, `remote-3/package.json` — same shape, different sibling depsOn
- `host/public/mf-remotes.json` — runtime manifest of remote URLs (dynamic federation; the host fetches this lazily on first remote-route visit)
- `host/src/routes.tsx` — per-route `registerRemotes` + `loadRemote` (truly lazy: nothing federation-related happens until a remote-N route is navigated to)
- `playwright.config.ts` — single `webServer` entry running `nx serve nx-react-vite-remote-1`, proving the whole graph boots from one command
