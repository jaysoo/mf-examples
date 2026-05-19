import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RemoteLink {
  path: string;
  name: string;
  desc: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section data-testid="home">
      <h1>Module Federation Host (Nx Angular)</h1>
      <p>Three remotes are federated into this host via the Nx Angular generators. Click each route to load its remote module.</p>
      <ul class="remote-list">
        @for (r of remotes; track r.path) {
          <li>
            <a [routerLink]="r.path">{{ r.name }}</a>
            <span class="desc">{{ r.desc }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      h1 { margin-top: 0; }
      .remote-list { list-style: none; padding: 0; display: grid; gap: 12px; }
      .remote-list li {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        background: white;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .remote-list a { font-weight: 600; color: #1f2937; text-decoration: none; }
      .desc { color: #64748b; font-size: 14px; }
    `,
  ],
})
export class Home {
  protected readonly remotes: RemoteLink[] = [
    { path: 'ng_remote1', name: 'Remote 1 — Counter', desc: 'Signal counter exposed by ng_remote1' },
    { path: 'ng_remote2', name: 'Remote 2 — Form', desc: 'Form bound via ngModel exposed by ng_remote2' },
    { path: 'ng_remote3', name: 'Remote 3 — List', desc: 'JSONPlaceholder users list exposed by ng_remote3' },
  ];
}
