import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppHttpError } from './app-http-error';
import { httpErrorInterceptor } from './http-error.interceptor';

const URL = 'https://api.test/movies';

describe('httpErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function captureError(fail: () => void): unknown {
    let received: unknown;
    http.get(URL).subscribe({ error: (error: unknown) => (received = error) });
    fail();
    return received;
  }

  it('converts a network failure into a network error', () => {
    const error = captureError(() => httpMock.expectOne(URL).error(new ProgressEvent('error')));

    expect(error).toBeInstanceOf(AppHttpError);
    expect(error).toMatchObject({
      kind: 'network',
      status: 0,
      message: 'Unable to reach the server. Check your connection and try again.',
    });
  });

  it('converts a 404 into a client error', () => {
    const error = captureError(() =>
      httpMock.expectOne(URL).flush(null, { status: 404, statusText: 'Not Found' }),
    );

    expect(error).toBeInstanceOf(AppHttpError);
    expect(error).toMatchObject({
      kind: 'client',
      status: 404,
      message: 'The request could not be processed.',
      url: URL,
    });
  });

  it('converts a 500 into a server error', () => {
    const error = captureError(() =>
      httpMock.expectOne(URL).flush(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    expect(error).toBeInstanceOf(AppHttpError);
    expect(error).toMatchObject({
      kind: 'server',
      status: 500,
      message: 'The server is unavailable at the moment. Please try again later.',
    });
  });

  it('lets successful responses through untouched', () => {
    let body: unknown;
    http.get(URL).subscribe((response) => (body = response));
    httpMock.expectOne(URL).flush({ ok: true });

    expect(body).toEqual({ ok: true });
  });
});
