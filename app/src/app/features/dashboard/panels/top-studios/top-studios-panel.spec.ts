import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../core/api/api-base-url.token';
import { StudiosWithWinCountResponse } from '../../../../core/api/models/studio-with-win-count.model';
import { httpErrorInterceptor } from '../../../../core/interceptors/http-error.interceptor';
import { TopStudiosPanel } from './top-studios-panel';

const BASE_URL = 'https://api.test/movies';
const URL = `${BASE_URL}/studiosWithWinCount`;

describe('TopStudiosPanel', () => {
  let fixture: ComponentFixture<TopStudiosPanel>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(TopStudiosPanel);
    element = fixture.nativeElement;
    // The pending request keeps the fixture unstable, so trigger the first render synchronously.
    TestBed.tick();
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function respond(body: StudiosWithWinCountResponse): Promise<void> {
    httpMock.expectOne(URL).flush(body);
    await fixture.whenStable();
  }

  async function fail(): Promise<void> {
    httpMock.expectOne(URL).flush('Server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
  }

  function bodyRows(): string[][] {
    return Array.from(element.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
    );
  }

  it('renders the panel title', () => {
    httpMock.expectOne(URL);

    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Top 3 studios with winners');
  });

  it('requests the endpoint on init and shows the loading indicator meanwhile', () => {
    const req = httpMock.expectOne(URL);

    expect(req.request.method).toBe('GET');
    expect(element.querySelector('[role="status"]')).not.toBeNull();
    expect(element.querySelector('table')).toBeNull();
  });

  it('renders the studios with the Name and Win Count columns', async () => {
    await respond({
      studios: [
        { name: 'Paramount Pictures', winCount: 6 },
        { name: 'Columbia Pictures', winCount: 7 },
      ],
    });

    const headers = Array.from(element.querySelectorAll('thead th')).map((th) =>
      th.textContent?.trim(),
    );
    expect(headers).toEqual(['Name', 'Win Count']);
    expect(bodyRows()).toEqual([
      ['Columbia Pictures', '7'],
      ['Paramount Pictures', '6'],
    ]);
  });

  it('renders exactly the three studios with the most wins, ties broken by name', async () => {
    await respond({
      studios: [
        { name: 'TriStar Pictures', winCount: 3 },
        { name: 'Warner Bros.', winCount: 5 },
        { name: 'Columbia Pictures', winCount: 6 },
        { name: 'Universal Studios', winCount: 5 },
        { name: 'Paramount Pictures', winCount: 6 },
      ],
    });

    expect(bodyRows()).toEqual([
      ['Columbia Pictures', '6'],
      ['Paramount Pictures', '6'],
      ['Universal Studios', '5'],
    ]);
  });

  it('shows the interceptor message when the server fails', async () => {
    await fail();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'The server is unavailable at the moment. Please try again later.',
    );
  });

  it('shows the error state and retries the request on "Try again"', async () => {
    await fail();

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelector('table')).toBeNull();

    element.querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    TestBed.tick();
    await respond({ studios: [{ name: 'Columbia Pictures', winCount: 7 }] });

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(bodyRows()).toEqual([['Columbia Pictures', '7']]);
  });

  it('shows the empty state when there are no studios', async () => {
    await respond({ studios: [] });

    expect(bodyRows()).toEqual([['No studio has won yet']]);
  });
});
