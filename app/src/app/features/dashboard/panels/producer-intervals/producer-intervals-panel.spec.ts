import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../core/api/api-base-url.token';
import {
  MaxMinWinIntervals,
  ProducerInterval,
} from '../../../../core/api/models/producer-interval.model';
import { httpErrorInterceptor } from '../../../../core/interceptors/http-error.interceptor';
import { ProducerIntervalsPanel } from './producer-intervals-panel';

const BASE_URL = 'https://api.test/movies';
const URL = `${BASE_URL}/maxMinWinIntervalForProducers`;

const matthewVaughn: ProducerInterval = {
  producer: 'Matthew Vaughn',
  interval: 13,
  previousWin: 2002,
  followingWin: 2015,
};

const joelSilver: ProducerInterval = {
  producer: 'Joel Silver',
  interval: 1,
  previousWin: 1990,
  followingWin: 1991,
};

describe('ProducerIntervalsPanel', () => {
  let fixture: ComponentFixture<ProducerIntervalsPanel>;
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

    fixture = TestBed.createComponent(ProducerIntervalsPanel);
    element = fixture.nativeElement;
    // The pending request keeps the fixture unstable, so trigger the first render synchronously.
    TestBed.tick();
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function respond(body: MaxMinWinIntervals): Promise<void> {
    httpMock.expectOne(URL).flush(body);
    await fixture.whenStable();
  }

  async function fail(): Promise<void> {
    httpMock.expectOne(URL).flush('Server error', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
  }

  /** Returns the subtitle and the body rows of each table, in document order. */
  function tables(): { title: string; rows: string[][] }[] {
    return Array.from(element.querySelectorAll('section[aria-labelledby]')).map((section) => ({
      title: section.querySelector('h3')?.textContent?.trim() ?? '',
      rows: Array.from(section.querySelectorAll('tbody tr')).map((row) =>
        Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
      ),
    }));
  }

  it('renders the panel title', () => {
    httpMock.expectOne(URL);

    expect(element.querySelector('h2')?.textContent?.trim()).toBe(
      'Producers with longest and shortest interval between wins',
    );
  });

  it('requests the endpoint on init and shows the loading indicator meanwhile', () => {
    const req = httpMock.expectOne(URL);

    expect(req.request.method).toBe('GET');
    expect(element.querySelector('[role="status"]')).not.toBeNull();
    expect(element.querySelector('table')).toBeNull();
  });

  it('renders the Maximum table first and the Minimum table second', async () => {
    await respond({ max: [matthewVaughn], min: [joelSilver] });

    expect(tables()).toEqual([
      { title: 'Maximum', rows: [['Matthew Vaughn', '13', '2002', '2015']] },
      { title: 'Minimum', rows: [['Joel Silver', '1', '1990', '1991']] },
    ]);
    element.querySelectorAll('section[aria-labelledby] thead tr').forEach((headerRow) => {
      const headers = Array.from(headerRow.querySelectorAll('th')).map((th) =>
        th.textContent?.trim(),
      );
      expect(headers).toEqual(['Producer', 'Interval', 'Previous Year', 'Following Year']);
    });
  });

  it('renders every tied producer, including the same producer twice', async () => {
    const otherVaughnInterval: ProducerInterval = {
      ...matthewVaughn,
      previousWin: 2015,
      followingWin: 2028,
    };
    const tiedProducer: ProducerInterval = {
      producer: 'Bo Derek',
      interval: 13,
      previousWin: 1984,
      followingWin: 1997,
    };

    await respond({ max: [matthewVaughn, tiedProducer, otherVaughnInterval], min: [joelSilver] });

    expect(tables()[0].rows).toEqual([
      ['Matthew Vaughn', '13', '2002', '2015'],
      ['Bo Derek', '13', '1984', '1997'],
      ['Matthew Vaughn', '13', '2015', '2028'],
    ]);
  });

  it('shows the empty state only in the table whose list is empty', async () => {
    await respond({ max: [matthewVaughn], min: [] });

    expect(tables()).toEqual([
      { title: 'Maximum', rows: [['Matthew Vaughn', '13', '2002', '2015']] },
      { title: 'Minimum', rows: [['No producer has won more than once']] },
    ]);
  });

  it('shows the empty state in both tables when there are no intervals', async () => {
    await respond({ max: [], min: [] });

    expect(tables()).toEqual([
      { title: 'Maximum', rows: [['No producer has won more than once']] },
      { title: 'Minimum', rows: [['No producer has won more than once']] },
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
    await respond({ max: [matthewVaughn], min: [joelSilver] });

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(tables()).toHaveLength(2);
  });
});
