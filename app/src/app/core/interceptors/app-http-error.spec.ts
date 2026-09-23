import { AppHttpError, appErrorMessage } from './app-http-error';

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
