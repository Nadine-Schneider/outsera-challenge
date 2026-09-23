import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_API_BASE_URL, provideApiTesting } from '../../../testing/api-testing';
import { HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON } from '../../../testing/movie-fixtures';
import { MovieApiService } from './movie-api.service';
import { Movie } from './models/movie.model';
import { Page } from './models/page.model';
import { MaxMinWinIntervals } from './models/producer-interval.model';
import { StudioWithWinCount } from './models/studio-with-win-count.model';
import { YearWithMultipleWinners } from './models/year-with-multiple-winners.model';

const BASE_URL = TEST_API_BASE_URL;

describe('MovieApiService', () => {
  let service: MovieApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: provideApiTesting() });
    service = TestBed.inject(MovieApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getMovies', () => {
    const page: Page<Movie> = {
      content: [HOWARD_THE_DUCK],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 15,
      first: true,
      last: true,
    };

    it('sends only page and size when no filter is set', () => {
      let result: Page<Movie> | undefined;
      service.getMovies({ page: 0, size: 15 }).subscribe((response) => (result = response));

      const req = httpMock.expectOne((request) => request.url === BASE_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual(['page', 'size']);
      expect(req.request.params.has('year')).toBe(false);
      expect(req.request.params.has('winner')).toBe(false);
      expect(req.request.urlWithParams).toBe(`${BASE_URL}?page=0&size=15`);

      req.flush(page);
      expect(result).toEqual(page);
    });

    it('omits filters explicitly set to undefined', () => {
      service.getMovies({ page: 2, size: 10, year: undefined, winner: undefined }).subscribe();

      const req = httpMock.expectOne((request) => request.url === BASE_URL);
      expect(req.request.params.has('year')).toBe(false);
      expect(req.request.params.has('winner')).toBe(false);
      expect(req.request.urlWithParams).toBe(`${BASE_URL}?page=2&size=10`);
      req.flush(page);
    });

    it('sends the year and winner filters when set', () => {
      service.getMovies({ page: 1, size: 15, year: 1986, winner: true }).subscribe();

      const req = httpMock.expectOne((request) => request.url === BASE_URL);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('15');
      expect(req.request.params.get('year')).toBe('1986');
      expect(req.request.params.get('winner')).toBe('true');
      req.flush(page);
    });

    it('sends winner=false instead of dropping it as falsy', () => {
      service.getMovies({ page: 0, size: 15, winner: false }).subscribe();

      const req = httpMock.expectOne((request) => request.url === BASE_URL);
      expect(req.request.params.get('winner')).toBe('false');
      expect(req.request.params.has('year')).toBe(false);
      expect(req.request.urlWithParams).toBe(`${BASE_URL}?page=0&size=15&winner=false`);
      req.flush(page);
    });
  });

  describe('getYearsWithMultipleWinners', () => {
    const url = `${BASE_URL}/yearsWithMultipleWinners`;

    function requestYears(): () => YearWithMultipleWinners[] | undefined {
      let result: YearWithMultipleWinners[] | undefined;
      service.getYearsWithMultipleWinners().subscribe((years) => (result = years));
      return () => result;
    }

    it('requests the endpoint and unwraps the years list', () => {
      const result = requestYears();

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({
        years: [
          { year: 1986, winnerCount: 2 },
          { year: 1990, winnerCount: 2 },
        ],
      });

      expect(result()).toEqual([
        { year: 1986, winnerCount: 2 },
        { year: 1990, winnerCount: 2 },
      ]);
    });

    it('returns an empty list for an empty response', () => {
      const result = requestYears();
      httpMock.expectOne(url).flush({ years: [] });

      expect(result()).toEqual([]);
    });

    it('returns an empty list for a null body', () => {
      const result = requestYears();
      httpMock.expectOne(url).flush(null);

      expect(result()).toEqual([]);
    });
  });

  describe('getStudiosWithWinCount', () => {
    const url = `${BASE_URL}/studiosWithWinCount`;

    function requestStudios(): () => StudioWithWinCount[] | undefined {
      let result: StudioWithWinCount[] | undefined;
      service.getStudiosWithWinCount().subscribe((studios) => (result = studios));
      return () => result;
    }

    it('requests the endpoint and unwraps the studios list', () => {
      const result = requestStudios();

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush({ studios: [{ name: 'Columbia Pictures', winCount: 7 }] });

      expect(result()).toEqual([{ name: 'Columbia Pictures', winCount: 7 }]);
    });

    it('returns an empty list for an empty response', () => {
      const result = requestStudios();
      httpMock.expectOne(url).flush({ studios: [] });

      expect(result()).toEqual([]);
    });

    it('returns an empty list for a null body', () => {
      const result = requestStudios();
      httpMock.expectOne(url).flush(null);

      expect(result()).toEqual([]);
    });
  });

  describe('getMaxMinWinIntervalForProducers', () => {
    it('requests the endpoint and returns every tied producer in min and max', () => {
      const intervals: MaxMinWinIntervals = {
        min: [
          { producer: 'Joel Silver', interval: 1, previousWin: 1990, followingWin: 1991 },
          { producer: 'Bo Derek', interval: 1, previousWin: 1984, followingWin: 1985 },
        ],
        max: [{ producer: 'Matthew Vaughn', interval: 13, previousWin: 2002, followingWin: 2015 }],
      };
      let result: MaxMinWinIntervals | undefined;
      service.getMaxMinWinIntervalForProducers().subscribe((response) => (result = response));

      const req = httpMock.expectOne(`${BASE_URL}/maxMinWinIntervalForProducers`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual([]);
      req.flush(intervals);

      expect(result).toEqual(intervals);
    });
  });

  describe('getWinnersByYear', () => {
    const url = `${BASE_URL}/winnersByYear`;

    function requestWinners(year: number): () => Movie[] | undefined {
      let result: Movie[] | undefined;
      service.getWinnersByYear(year).subscribe((movies) => (result = movies));
      return () => result;
    }

    it('sends the year as the only query parameter', () => {
      requestWinners(1986);

      const req = httpMock.expectOne((request) => request.url === url);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys()).toEqual(['year']);
      expect(req.request.urlWithParams).toBe(`${url}?year=1986`);
      req.flush([]);
    });

    it('returns every movie of an array response', () => {
      const result = requestWinners(1986);
      httpMock.expectOne(`${url}?year=1986`).flush([HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON]);

      expect(result()).toEqual([HOWARD_THE_DUCK, UNDER_THE_CHERRY_MOON]);
    });

    it('wraps a single movie object in a list', () => {
      const result = requestWinners(1986);
      httpMock.expectOne(`${url}?year=1986`).flush(HOWARD_THE_DUCK);

      expect(result()).toEqual([HOWARD_THE_DUCK]);
    });

    it('returns an empty list for a null body', () => {
      const result = requestWinners(1986);
      httpMock.expectOne(`${url}?year=1986`).flush(null);

      expect(result()).toEqual([]);
    });

    it('returns an empty list for a year without winners', () => {
      const result = requestWinners(1979);
      httpMock.expectOne(`${url}?year=1979`).flush([]);

      expect(result()).toEqual([]);
    });
  });
});
