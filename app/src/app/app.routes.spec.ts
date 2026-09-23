import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { provideApiTesting } from '../testing/api-testing';
import { routes } from './app.routes';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), ...provideApiTesting()],
    });
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => {
    // The dashboard panels request their data; the responses are irrelevant to routing.
    const httpMock = TestBed.inject(HttpTestingController);
    httpMock.match(() => true);
    httpMock.verify();
  });

  function heading(): string | undefined {
    return harness.routeNativeElement?.querySelector('h1')?.textContent?.trim();
  }

  it('redirects the empty path to the dashboard', async () => {
    await harness.navigateByUrl('/');

    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeNativeElement?.querySelector('app-panel h2')?.textContent?.trim()).toBe(
      'List years with multiple winners',
    );
  });

  it('lazy loads the movies list page', async () => {
    await harness.navigateByUrl('/movies');

    expect(harness.routeNativeElement?.querySelector('app-panel h2')?.textContent?.trim()).toBe(
      'List movies',
    );
  });

  it('renders the not found page for unknown paths', async () => {
    await harness.navigateByUrl('/does-not-exist');

    expect(heading()).toBe('Page not found');
  });
});
