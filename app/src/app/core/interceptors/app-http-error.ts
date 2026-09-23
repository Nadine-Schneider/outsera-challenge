import { HttpErrorResponse } from '@angular/common/http';

export type AppHttpErrorKind = 'network' | 'client' | 'server' | 'unknown';

const MESSAGES: Record<AppHttpErrorKind, string> = {
  network: 'Unable to reach the server. Check your connection and try again.',
  client: 'The request could not be processed.',
  server: 'The server is unavailable at the moment. Please try again later.',
  unknown: 'An unexpected error occurred. Please try again.',
};

export class AppHttpError extends Error {
  override readonly name = 'AppHttpError';

  constructor(
    readonly kind: AppHttpErrorKind,
    readonly status: number,
    message: string,
    readonly url: string | null = null,
  ) {
    super(message);
  }
}

export function toAppHttpError(error: HttpErrorResponse): AppHttpError {
  const kind = errorKind(error.status);
  return new AppHttpError(kind, error.status, MESSAGES[kind], error.url);
}

export function appErrorMessage(error: unknown): string | undefined {
  return error instanceof AppHttpError ? error.message : undefined;
}

function errorKind(status: number): AppHttpErrorKind {
  if (status === 0) {
    return 'network';
  }
  if (status >= 400 && status < 500) {
    return 'client';
  }
  if (status >= 500 && status < 600) {
    return 'server';
  }
  return 'unknown';
}
