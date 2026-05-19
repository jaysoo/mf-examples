import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

interface Submitted {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-ng-remote2-entry',
  imports: [FormsModule, JsonPipe],
  template: `
    <section class="root" data-testid="remote-2">
      <h1>Remote 2 — Form</h1>
      <p>Two-way bound inputs rendered by the federated Nx Angular remote.</p>
      <form (ngSubmit)="onSubmit()" class="form">
        <label>
          Name
          <input type="text" name="name" [(ngModel)]="name" data-testid="form-name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" [(ngModel)]="email" data-testid="form-email" required />
        </label>
        <label>
          Message
          <textarea name="message" [(ngModel)]="message" data-testid="form-message" rows="3"></textarea>
        </label>
        <button type="submit" data-testid="form-submit">Submit</button>
      </form>
      @if (submitted(); as s) {
        <pre class="output" data-testid="form-output">{{ s | json }}</pre>
      }
    </section>
  `,
  styles: [
    `
      .root {
        --accent: #16a34a;
        border: 2px solid var(--accent);
        border-radius: 12px;
        padding: 24px;
        background: white;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      h1 { margin-top: 0; color: var(--accent); }
      .form { display: grid; gap: 12px; }
      .form label { display: grid; gap: 4px; font-weight: 500; }
      .form input, .form textarea {
        padding: 8px;
        border: 1px solid #d4d4d8;
        border-radius: 6px;
        font: inherit;
      }
      .form button {
        padding: 8px 16px;
        font-size: 16px;
        border: 1px solid var(--accent);
        background: var(--accent);
        color: white;
        border-radius: 6px;
        cursor: pointer;
        justify-self: start;
      }
      .output {
        margin-top: 16px;
        background: #f0fdf4;
        border: 1px solid var(--accent);
        border-radius: 6px;
        padding: 12px;
        color: #14532d;
      }
    `,
  ],
})
export class RemoteEntry {
  protected name = '';
  protected email = '';
  protected message = '';
  protected readonly submitted = signal<Submitted | null>(null);

  onSubmit() {
    this.submitted.set({ name: this.name, email: this.email, message: this.message });
  }
}
