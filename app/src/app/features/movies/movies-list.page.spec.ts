// Fake timers are needed to test the year debounce, and they are incompatible with
// `fixture.whenStable()`. This spec therefore settles responses with
// `vi.advanceTimersByTimeAsync(0)` + `TestBed.tick()` instead of `whenStable()`.

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../core/api/api-base-url.token';
import { Movie } from '../../core/api/models/movie.model';
import { Page } from '../../core/api/models/page.model';
import { httpErrorInterceptor } from '../../core/interceptors/http-error.interceptor';
import { MoviesListPage } from './movies-list.page';

const BASE_URL = 'https://api.test/movies';

const MOVIES: Movie[] = [
  {
    id: 1,
    year: 1980,
    title: "Can't Stop the Music",
    studios: ['Associated Film Distribution'],
    producers: ['Allan Carr'],
    winner: true,
  },
  {
    id: 2,
    year: 1980,
    title: 'Cruising',
    studios: ['Lorimar Productions', 'United Artists'],
    producers: ['Jerry Weintraub'],
    winner: false,
  },
];

function page(content: Movie[], apiPage = 0, totalPages = 14): Page<Movie> {
  return {
    content,
    totalElements: totalPages * 15,
    totalPages,
    number: apiPage,
    size: 15,
    first: apiPage === 0,
    last: apiPage === totalPages - 1,
  };
}

type QueryParams = Record<string, string | null>;

describe('MoviesListPage', async () => {
  let fixture: ComponentFixture<MoviesListPage>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(MoviesListPage);
    element = fixture.nativeElement;
    // The pending request keeps the fixture unstable, so trigger the first render synchronously.
    TestBed.tick();
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  function expectRequest(): TestRequest {
    return httpMock.expectOne((request) => request.url === BASE_URL);
  }

  function paramsOf(req: TestRequest): QueryParams {
    const { params } = req.request;
    return {
      page: params.get('page'),
      size: params.get('size'),
      year: params.get('year'),
      winner: params.get('winner'),
    };
  }

  /** Lets the resource publish the response (a microtask) and renders the result. */
  async function settle(): Promise<void> {
    await vi.advanceTimersByTimeAsync(0);
    TestBed.tick();
  }

  async function respond(expected: Partial<QueryParams>, body: Page<Movie>): Promise<void> {
    const req = expectRequest();
    expect(req.request.method).toBe('GET');
    expect(paramsOf(req)).toMatchObject(expected);
    req.flush(body);
    await settle();
  }

  function yearInput(): HTMLInputElement {
    const input = element.querySelector<HTMLInputElement>('input[aria-label="Filter by year"]');
    if (!input) {
      throw new Error('Year filter not found');
    }
    return input;
  }

  function winnerSelect(): HTMLSelectElement {
    const select = element.querySelector<HTMLSelectElement>(
      'select[aria-label="Filter by winner"]',
    );
    if (!select) {
      throw new Error('Winner filter not found');
    }
    return select;
  }

  /** Types in the year field; the request only leaves after the debounce window. */
  function typeYear(value: string): void {
    yearInput().value = value;
    yearInput().dispatchEvent(new Event('input'));
    TestBed.tick();
  }

  function waitDebounce(ms = 400): void {
    vi.advanceTimersByTime(ms);
    TestBed.tick();
  }

  function selectWinner(label: 'Yes/No' | 'Yes' | 'No'): void {
    const option = Array.from(winnerSelect().options).find((o) => o.text.trim() === label);
    if (!option) {
      throw new Error(`Option ${label} not found`);
    }
    winnerSelect().value = option.value;
    winnerSelect().dispatchEvent(new Event('change'));
    TestBed.tick();
  }

  function clickPagination(label: string): void {
    const button = element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    if (!button) {
      throw new Error(`Pagination button ${label} not found`);
    }
    button.click();
    TestBed.tick();
  }

  async function goToPage3(): Promise<void> {
    await respond({ page: '0' }, page(MOVIES));
    clickPagination('Page 3');
    await respond({ page: '2' }, page(MOVIES, 2));
  }

  function headers(): string[] {
    return Array.from(element.querySelectorAll('thead th')).map(
      (th) => th.textContent?.trim() ?? '',
    );
  }

  function bodyRows(): string[][] {
    return Array.from(element.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
    );
  }

  function activePage(): string | undefined {
    return element.querySelector('[aria-current="page"]')?.textContent?.trim();
  }

  it('renders the title, the columns and the filters inside the header', async () => {
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('List movies');
    expect(headers()).toEqual(['ID', 'Year', 'Title', 'Winner?']);

    const filterCells = element.querySelectorAll('thead tr[appTableFilters] td');
    expect(filterCells).toHaveLength(4);
    expect(filterCells[0].children).toHaveLength(0);
    expect(filterCells[1].querySelector('input')).toBe(yearInput());
    expect(filterCells[2].children).toHaveLength(0);
    expect(filterCells[3].querySelector('select')).toBe(winnerSelect());

    expect(yearInput().getAttribute('placeholder')).toBe('Filter by year');
    expect(yearInput().getAttribute('inputmode')).toBe('numeric');
    expect(yearInput().getAttribute('maxlength')).toBe('4');
    expect(Array.from(winnerSelect().options).map((o) => o.text.trim())).toEqual([
      'Yes/No',
      'Yes',
      'No',
    ]);

    await respond({}, page(MOVIES));
  });

  it('loads the first page on init with page=0 and size=15 and no filters', async () => {
    expect(element.querySelector('[role="status"]')).not.toBeNull();

    await respond({ page: '0', size: '15', year: null, winner: null }, page(MOVIES));

    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(activePage()).toBe('1');
  });

  it('renders one row per movie with "Yes"/"No" in the Winner? column', async () => {
    await respond({}, page(MOVIES));

    expect(bodyRows()).toEqual([
      ['1', '1980', "Can't Stop the Music", 'Yes'],
      ['2', '1980', 'Cruising', 'No'],
    ]);
  });

  describe('year filter', async () => {
    beforeEach(async () => {
      await respond({ page: '0' }, page(MOVIES));
    });

    it('waits for the debounce and then requests the year only once', async () => {
      typeYear('1');
      typeYear('19');
      typeYear('198');
      typeYear('1986');
      waitDebounce(399);
      httpMock.expectNone(() => true);

      waitDebounce(1);
      await respond({ page: '0', year: '1986', winner: null }, page(MOVIES));
      httpMock.expectNone(() => true);
    });

    it('does not send a year with fewer than 4 digits', async () => {
      typeYear('198');
      waitDebounce();

      httpMock.expectNone(() => true);
    });

    it('keeps only digits in the field', async () => {
      typeYear('19a8');

      expect(yearInput().value).toBe('198');
    });

    it('drops the year from the query when the field is cleared', async () => {
      typeYear('1986');
      waitDebounce();
      await respond({ year: '1986' }, page(MOVIES));

      typeYear('');
      waitDebounce();
      await respond({ page: '0', year: null }, page(MOVIES));
    });
  });

  describe('winner filter', async () => {
    beforeEach(async () => {
      await respond({ page: '0' }, page(MOVIES));
    });

    it('sends winner=true for "Yes"', async () => {
      selectWinner('Yes');
      await respond({ page: '0', winner: 'true' }, page(MOVIES));
    });

    it('sends winner=false for "No"', async () => {
      selectWinner('No');
      await respond({ page: '0', winner: 'false' }, page(MOVIES));
    });

    it('does not send the parameter for "Yes/No"', async () => {
      selectWinner('No');
      await respond({ winner: 'false' }, page(MOVIES));

      selectWinner('Yes/No');
      const req = expectRequest();
      expect(req.request.params.has('winner')).toBe(false);
      req.flush(page(MOVIES));
      await settle();
    });
  });

  it('goes back to the first page when the year filter changes on page 3', async () => {
    await goToPage3();
    expect(activePage()).toBe('3');

    typeYear('1986');
    waitDebounce();
    await respond({ page: '0', year: '1986' }, page(MOVIES));

    expect(activePage()).toBe('1');
  });

  it('goes back to the first page when the winner filter changes on page 3', async () => {
    await goToPage3();

    selectWinner('Yes');
    await respond({ page: '0', winner: 'true' }, page(MOVIES));

    expect(activePage()).toBe('1');
  });

  it('requests the next page on "Next page", keeping the active filters', async () => {
    await respond({ page: '0' }, page(MOVIES));
    selectWinner('No');
    await respond({ winner: 'false' }, page(MOVIES));
    typeYear('1980');
    waitDebounce();
    await respond({ page: '0', year: '1980', winner: 'false' }, page(MOVIES));

    clickPagination('Next page');
    await respond({ page: '1', size: '15', year: '1980', winner: 'false' }, page(MOVIES, 1));

    expect(activePage()).toBe('2');
  });

  it('shows the error state and retries with the same parameters on "Try again"', async () => {
    await respond({ page: '0' }, page(MOVIES));
    selectWinner('Yes');
    expectRequest().flush('Server error', { status: 500, statusText: 'Server Error' });
    await settle();

    const alert = element.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain(
      'The server is unavailable at the moment. Please try again later.',
    );
    expect(element.querySelector('nav[aria-label="Pagination"]')).toBeNull();
    // The filters stay available so the user can change them after a failure.
    expect(winnerSelect().value).toBe('true');

    alert?.querySelector('button')?.click();
    TestBed.tick();
    await respond({ page: '0', size: '15', year: null, winner: 'true' }, page(MOVIES));

    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(bodyRows()).toHaveLength(2);
  });

  it('shows a "no movies" message when there are no movies and no filters', async () => {
    await respond({}, page([], 0, 0));

    expect(bodyRows()).toEqual([['No movies found']]);
    expect(element.querySelector('nav[aria-label="Pagination"]')).toBeNull();
  });

  it('suggests adjusting the filters when the filtered result is empty', async () => {
    await respond({}, page(MOVIES));
    typeYear('1950');
    waitDebounce();
    await respond({ year: '1950' }, page([], 0, 0));

    expect(bodyRows()).toEqual([
      ['No movies match the current filters. Try adjusting the year or winner filter.'],
    ]);
    expect(element.querySelector('tbody td')?.getAttribute('colspan')).toBe('4');
  });
});
