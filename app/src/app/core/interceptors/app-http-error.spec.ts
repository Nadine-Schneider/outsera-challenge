import { HttpErrorResponse } from '@angular/common/http';

import { AppHttpError, appErrorMessage, toAppHttpError } from './app-http-error';

describe('appErrorMessage', () => {
  it('returns the message of an AppHttpError', () => {
    const error = new AppHttpError('server', 500, 'The server is unavailable.');

    expect(appErrorMessage(error)).toBe('The server is unavailable.');
  });

  it('returns undefined for any other error', () => {
    expect(appErrorMessage(new Error('Boom'))).toBeUndefined();
    expect(appErrorMessage('Boom')).toBeUndefined();
    expect(appErrorMessage(undefined)).toBeUndefined();
  });
});

describe('toAppHttpError', () => {
  it.each([302, 600])('classifies status %i, outside 0, 4xx and 5xx, as unknown', (status) => {
    const error = toAppHttpError(new HttpErrorResponse({ status, url: 'https://api.test/movies' }));

    expect(error).toBeInstanceOf(AppHttpError);
    expect(error).toMatchObject({
      kind: 'unknown',
      status,
      message: 'An unexpected error occurred. Please try again.',
      url: 'https://api.test/movies',
    });
  });
});
