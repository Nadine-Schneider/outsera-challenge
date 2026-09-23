import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SERVER_ERROR_MESSAGE,
  TEST_API_BASE_URL,
  flushServerError,
  provideApiTesting,
} from '../../../../../testing/api-testing';
import { tableBodyRows, tableHeaders } from '../../../../../testing/table-queries';
import { StudiosWithWinCountResponse } from '../../../../core/api/models/studio-with-win-count.model';
import { TopStudiosPanel } from './top-studios-panel';

const URL = `${TEST_API_BASE_URL}/studiosWithWinCount`;

describe('TopStudiosPanel', () => {
  let fixture: ComponentFixture<TopStudiosPanel>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideApiTesting() });
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
    flushServerError(httpMock.expectOne(URL));
    await fixture.whenStable();
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

    expect(tableHeaders(element)).toEqual(['Name', 'Win Count']);
    expect(tableBodyRows(element)).toEqual([
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

    expect(tableBodyRows(element)).toEqual([
      ['Columbia Pictures', '6'],
      ['Paramount Pictures', '6'],
      ['Universal Studios', '5'],
    ]);
  });

  it('shows the interceptor message when the server fails', async () => {
    await fail();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(SERVER_ERROR_MESSAGE);
  });

  it('shows the error state and retries the request on "Try again"', async () => {
    await fail();

    expect(element.querySelector('[role="alert"]')).not.toBeNull();
    expect(element.querySelector('table')).toBeNull();

    element.querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    TestBed.tick();
    await respond({ studios: [{ name: 'Columbia Pictures', winCount: 7 }] });

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(tableBodyRows(element)).toEqual([['Columbia Pictures', '7']]);
  });

  it('shows the empty state when there are no studios', async () => {
    await respond({ studios: [] });

    expect(tableBodyRows(element)).toEqual([['No studio has won yet']]);
  });
});
