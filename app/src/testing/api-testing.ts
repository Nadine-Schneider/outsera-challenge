import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';

import { API_BASE_URL } from '../app/core/api/api-base-url.token';
import { httpErrorInterceptor } from '../app/core/interceptors/http-error.interceptor';

export const TEST_API_BASE_URL = 'https://api.test/movies';

/** Message the error interceptor produces for a 5xx response. */
export const SERVER_ERROR_MESSAGE =
  'The server is unavailable at the moment. Please try again later.';

/** HTTP wiring of `app.config.ts`, with the backend replaced by `HttpTestingController`. */
export function provideApiTesting(): (Provider | EnvironmentProviders)[] {
  return [
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideHttpClientTesting(),
    { provide: API_BASE_URL, useValue: TEST_API_BASE_URL },
  ];
}

/** Answers the request with a 500, which the interceptor turns into a server `AppHttpError`. */
export function flushServerError(req: TestRequest): void {
  req.flush('Server error', { status: 500, statusText: 'Server Error' });
}
