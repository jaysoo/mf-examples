import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

interface Submitted {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected name = '';
  protected email = '';
  protected message = '';
  protected readonly submitted = signal<Submitted | null>(null);

  onSubmit() {
    this.submitted.set({ name: this.name, email: this.email, message: this.message });
  }
}
