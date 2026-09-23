import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <h1 class="h4">Page not found</h1>
    <p class="text-body-secondary">The page you are looking for does not exist.</p>
    <a routerLink="/dashboard">Go to Dashboard</a>
  `,
})
export class NotFoundPage {}
