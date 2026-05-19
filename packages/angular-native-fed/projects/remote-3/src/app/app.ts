import { Component, OnInit, signal } from '@angular/core';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
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
