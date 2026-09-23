import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SERVER_ERROR_MESSAGE,
  TEST_API_BASE_URL,
  flushServerError,
  provideApiTesting,
} from '../../../../../testing/api-testing';
import { tableBodyRows, tableHeaders } from '../../../../../testing/table-queries';
import { YearsWithMultipleWinnersResponse } from '../../../../core/api/models/year-with-multiple-winners.model';
import { MultipleWinnersPanel } from './multiple-winners-panel';

const URL = `${TEST_API_BASE_URL}/yearsWithMultipleWinners`;

describe('MultipleWinnersPanel', () => {
  let fixture: ComponentFixture<MultipleWinnersPanel>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideApiTesting() });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(MultipleWinnersPanel);
    element = fixture.nativeElement;
    // The pending request keeps the fixture unstable, so trigger the first render synchronously.
    TestBed.tick();
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function respond(body: YearsWithMultipleWinnersResponse): Promise<void> {
    httpMock.expectOne(URL).flush(body);
    await fixture.whenStable();
  }

  async function fail(): Promise<void> {
    flushServerError(httpMock.expectOne(URL));
    await fixture.whenStable();
  }

  it('renders the panel title', () => {
    httpMock.expectOne(URL);

    expect(element.querySelector('h2')?.textContent?.trim()).toBe(
      'List years with multiple winners',
    );
  });

  it('requests the endpoint on init and shows the loading indicator meanwhile', () => {
    const req = httpMock.expectOne(URL);

    expect(req.request.method).toBe('GET');
    expect(element.querySelector('[role="status"]')).not.toBeNull();
    expect(element.querySelector('table')).toBeNull();
  });

  it('renders one row per year, preserving the API order', async () => {
    await respond({
      years: [
        { year: 2015, winnerCount: 2 },
        { year: 1986, winnerCount: 2 },
        { year: 1990, winnerCount: 3 },
      ],
    });

    expect(tableHeaders(element)).toEqual(['Year', 'Win Count']);
    expect(tableBodyRows(element)).toEqual([
      ['2015', '2'],
      ['1986', '2'],
      ['1990', '3'],
    ]);
    expect(element.querySelector('[role="status"]')).toBeNull();
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
    await respond({ years: [{ year: 1986, winnerCount: 2 }] });

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(tableBodyRows(element)).toEqual([['1986', '2']]);
  });

  it('shows the empty state when no year has multiple winners', async () => {
    await respond({ years: [] });

    expect(tableBodyRows(element)).toEqual([['No year has more than one winner']]);
  });
});
