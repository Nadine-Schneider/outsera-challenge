import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    harness = await RouterTestingHarness.create();
  });

  function heading(): string | undefined {
    return harness.routeNativeElement?.querySelector('h1')?.textContent?.trim();
  }

  it('redirects the empty path to the dashboard', async () => {
    await harness.navigateByUrl('/');

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(heading()).toBe('Dashboard');
  });

  it('lazy loads the movies list page', async () => {
    await harness.navigateByUrl('/movies');

    expect(heading()).toBe('List movies');
  });

  it('renders the not found page for unknown paths', async () => {
    await harness.navigateByUrl('/does-not-exist');

    expect(heading()).toBe('Page not found');
  });
});
