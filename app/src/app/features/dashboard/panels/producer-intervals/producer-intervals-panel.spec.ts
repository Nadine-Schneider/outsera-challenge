import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  SERVER_ERROR_MESSAGE,
  TEST_API_BASE_URL,
  flushServerError,
  provideApiTesting,
} from '../../../../../testing/api-testing';
import { tableBodyRows, tableHeaders } from '../../../../../testing/table-queries';
import {
  MaxMinWinIntervals,
  ProducerInterval,
} from '../../../../core/api/models/producer-interval.model';
import { ProducerIntervalsPanel } from './producer-intervals-panel';

const URL = `${TEST_API_BASE_URL}/maxMinWinIntervalForProducers`;

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
    TestBed.configureTestingModule({ providers: provideApiTesting() });
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
    flushServerError(httpMock.expectOne(URL));
    await fixture.whenStable();
  }

  /** Returns the subtitle, the headers and the body rows of each table, in document order. */
  function tables(): { title: string; headers: string[]; rows: string[][] }[] {
    return Array.from(element.querySelectorAll('section[aria-labelledby]'), (section) => ({
      title: section.querySelector('h3')?.textContent?.trim() ?? '',
      headers: tableHeaders(section),
      rows: tableBodyRows(section),
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

    const headers = ['Producer', 'Interval', 'Previous Year', 'Following Year'];
    expect(tables()).toEqual([
      { title: 'Maximum', headers, rows: [['Matthew Vaughn', '13', '2002', '2015']] },
      { title: 'Minimum', headers, rows: [['Joel Silver', '1', '1990', '1991']] },
    ]);
  });

  it('renders every tied producer of max, including the same producer twice', async () => {
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

  it('renders every tied producer of min, including the same producer twice', async () => {
    const otherSilverInterval: ProducerInterval = {
      ...joelSilver,
      previousWin: 1991,
      followingWin: 1992,
    };
    const tiedProducer: ProducerInterval = {
      producer: 'Bo Derek',
      interval: 1,
      previousWin: 1984,
      followingWin: 1985,
    };

    await respond({ max: [matthewVaughn], min: [joelSilver, tiedProducer, otherSilverInterval] });

    expect(tables()[1].rows).toEqual([
      ['Joel Silver', '1', '1990', '1991'],
      ['Bo Derek', '1', '1984', '1985'],
      ['Joel Silver', '1', '1991', '1992'],
    ]);
  });

  it('shows the empty state only in the table whose list is empty', async () => {
    await respond({ max: [matthewVaughn], min: [] });

    expect(tables().map(({ title, rows }) => ({ title, rows }))).toEqual([
      { title: 'Maximum', rows: [['Matthew Vaughn', '13', '2002', '2015']] },
      { title: 'Minimum', rows: [['No producer has won more than once']] },
    ]);
  });

  it('shows the empty state in both tables when there are no intervals', async () => {
    await respond({ max: [], min: [] });

    expect(tables().map(({ title, rows }) => ({ title, rows }))).toEqual([
      { title: 'Maximum', rows: [['No producer has won more than once']] },
      { title: 'Minimum', rows: [['No producer has won more than once']] },
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
    await respond({ max: [matthewVaughn], min: [joelSilver] });

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(tables()).toHaveLength(2);
  });
});
