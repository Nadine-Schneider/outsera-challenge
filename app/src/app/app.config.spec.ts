import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../environments/environment';
import { appConfig } from './app.config';
import { API_BASE_URL } from './core/api/api-base-url.token';
import { MovieApiService } from './core/api/movie-api.service';
import { AppHttpError } from './core/interceptors/app-http-error';

describe('appConfig', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('provides the API base URL from the environment', () => {
    expect(TestBed.inject(API_BASE_URL)).toBe(environment.apiBaseUrl);
  });

  it('registers the error interceptor, so HTTP failures reach the app as AppHttpError', () => {
    let received: unknown;
    TestBed.inject(MovieApiService)
      .getStudiosWithWinCount()
      .subscribe({ error: (error: unknown) => (received = error) });

    httpMock
      .expectOne(`${environment.apiBaseUrl}/studiosWithWinCount`)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(received).toBeInstanceOf(AppHttpError);
    expect(received).toMatchObject({ kind: 'server', status: 503 });
  });
});
