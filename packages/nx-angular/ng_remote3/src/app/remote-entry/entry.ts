import { Component, OnInit, signal } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-ng-remote3-entry',
  template: `
    <section class="root" data-testid="remote-3">
      <h1>Remote 3 — List</h1>
      <p>Data fetched at runtime by the federated Nx Angular remote.</p>
      @if (error(); as err) {
        <p class="error">Failed to load: {{ err }}</p>
      }
      @if (!users() && !error()) {
        <p class="loading">Loading…</p>
      }
      @if (users(); as list) {
        <ul class="users" data-testid="user-list">
          @for (u of list; track u.id) {
            <li>
              <strong>{{ u.name }}</strong>
              <span class="email">{{ u.email }}</span>
            </li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .root {
        --accent: #2563eb;
        border: 2px solid var(--accent);
        border-radius: 12px;
        padding: 24px;
        background: white;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      h1 { margin-top: 0; color: var(--accent); }
      .users {
        list-style: none;
        padding: 0;
        display: grid;
        gap: 8px;
      }
      .users li {
        border: 1px solid #dbeafe;
        background: #eff6ff;
        border-radius: 6px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
      }
      .email { font-size: 13px; color: #1e3a8a; }
      .loading { color: var(--accent); font-style: italic; }
      .error { color: #991b1b; }
    `,
  ],
})
export class RemoteEntry implements OnInit {
  protected readonly users = signal<User[] | null>(null);
  protected readonly error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const r = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      this.users.set((await r.json()) as User[]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }
}
