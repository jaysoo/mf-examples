import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ng-remote1-entry',
  template: `
    <section class="root" data-testid="remote-1">
      <h1>Remote 1 — Counter</h1>
      <p>Local state managed inside the federated Nx Angular remote.</p>
      <p class="count" data-testid="counter-value">{{ count() }}</p>
      <div class="controls">
        <button (click)="dec()" aria-label="decrement">-</button>
        <button (click)="reset()" aria-label="reset">reset</button>
        <button (click)="inc()" aria-label="increment">+</button>
      </div>
    </section>
  `,
  styles: [
    `
      .root {
        --accent: #dc2626;
        border: 2px solid var(--accent);
        border-radius: 12px;
        padding: 24px;
        background: white;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      h1 { margin-top: 0; color: var(--accent); }
      .count {
        font-size: 64px;
        font-weight: 700;
        margin: 16px 0;
        text-align: center;
        color: var(--accent);
      }
      .controls { display: flex; gap: 12px; justify-content: center; }
      .controls button {
        padding: 8px 16px;
        font-size: 18px;
        border: 1px solid var(--accent);
        background: white;
        color: var(--accent);
        border-radius: 6px;
        cursor: pointer;
        min-width: 60px;
      }
      .controls button:hover { background: var(--accent); color: white; }
    `,
  ],
})
export class RemoteEntry {
  protected readonly count = signal(0);
  inc() { this.count.update((c) => c + 1); }
  dec() { this.count.update((c) => c - 1); }
  reset() { this.count.set(0); }
}
