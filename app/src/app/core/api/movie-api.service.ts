import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { normalizeWinners } from '../../shared/utils/winners';
import { API_BASE_URL } from './api-base-url.token';
import { Movie, MoviesQuery, WinnersByYearResponse } from './models/movie.model';
import { Page } from './models/page.model';
import { MaxMinWinIntervals } from './models/producer-interval.model';
import {
  StudioWithWinCount,
  StudiosWithWinCountResponse,
} from './models/studio-with-win-count.model';
import {
  YearWithMultipleWinners,
  YearsWithMultipleWinnersResponse,
} from './models/year-with-multiple-winners.model';

@Injectable({ providedIn: 'root' })
export class MovieApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getMovies(query: MoviesQuery): Observable<Page<Movie>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.year !== undefined) {
      params = params.set('year', query.year);
    }
    if (query.winner !== undefined) {
      params = params.set('winner', query.winner);
    }
    return this.http.get<Page<Movie>>(this.baseUrl, { params });
  }

  getYearsWithMultipleWinners(): Observable<YearWithMultipleWinners[]> {
    return this.http
      .get<YearsWithMultipleWinnersResponse | null>(`${this.baseUrl}/yearsWithMultipleWinners`)
      .pipe(map((response) => response?.years ?? []));
  }

  getStudiosWithWinCount(): Observable<StudioWithWinCount[]> {
    return this.http
      .get<StudiosWithWinCountResponse | null>(`${this.baseUrl}/studiosWithWinCount`)
      .pipe(map((response) => response?.studios ?? []));
  }

  getMaxMinWinIntervalForProducers(): Observable<MaxMinWinIntervals> {
    return this.http.get<MaxMinWinIntervals>(`${this.baseUrl}/maxMinWinIntervalForProducers`);
  }

  getWinnersByYear(year: number): Observable<Movie[]> {
    const params = new HttpParams().set('year', year);
    return this.http
      .get<WinnersByYearResponse>(`${this.baseUrl}/winnersByYear`, { params })
      .pipe(map(normalizeWinners));
  }
}
