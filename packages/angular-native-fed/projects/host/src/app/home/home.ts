import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly remotes = [
    { path: '/remote-1', name: 'Remote 1 — Counter', desc: 'Signal counter exposed by remote-1' },
    { path: '/remote-2', name: 'Remote 2 — Form', desc: 'Form bound via ngModel exposed by remote-2' },
    { path: '/remote-3', name: 'Remote 3 — List', desc: 'JSONPlaceholder users list exposed by remote-3' },
  ];
}
