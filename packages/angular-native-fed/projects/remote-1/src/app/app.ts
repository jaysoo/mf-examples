import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly count = signal(0);

  inc() {
    this.count.update((c) => c + 1);
  }

  dec() {
    this.count.update((c) => c - 1);
  }

  reset() {
    this.count.set(0);
  }
}
