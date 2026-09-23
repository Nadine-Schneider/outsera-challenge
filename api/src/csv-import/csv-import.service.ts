import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Info } from 'csv-parse';
import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { DataSource, EntityManager, In } from 'typeorm';
import { AppConfigService } from '../config';
import {
  Movie,
  MOVIE_PRODUCERS_TABLE,
  MOVIE_STUDIOS_TABLE,
  Studio,
} from '../movies/entities';
import { Producer } from '../producers/entities';
import { CsvImportError } from './csv-import.error';
import { parseNameList } from './name-list.parser';

const REQUIRED_COLUMNS = [
  'year',
  'title',
  'studios',
  'producers',
  'winner',
] as const;

/** Rows per INSERT and names per IN clause, well below SQLite's variable limit. */
const BATCH_SIZE = 500;

type CsvColumn = (typeof REQUIRED_COLUMNS)[number];
type CsvRecord = Partial<Record<CsvColumn, string>>;

interface CsvRow {
  record: CsvRecord;
  info: Info;
}

interface MovieRow {
  year: number;
  title: string;
  winner: boolean;
  producers: string[];
  studios: string[];
}

interface ImportSummary {
  movies: number;
  winners: number;
  producers: number;
  studios: number;
}

@Injectable()
export class CsvImportService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CsvImportService.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const filePath = resolve(this.config.movielistCsvPath);
    const rows = this.toMovieRows(await this.readCsv(filePath));
    const summary = await this.persist(rows);

    this.logger.log(
      `Imported ${summary.movies} movies (${summary.winners} winners), ` +
        `${summary.producers} producers and ${summary.studios} studios from ${filePath}`,
    );
  }

  private async readCsv(filePath: string): Promise<CsvRow[]> {
    let content: Buffer;
    try {
      content = await readFile(filePath);
    } catch (error) {
      throw new CsvImportError(
        `Could not read the movie list CSV file at "${filePath}" ` +
          `(check MOVIELIST_CSV_PATH): ${errorMessage(error)}`,
        { cause: error },
      );
    }

    let hasHeader = false;
    let rows: CsvRow[];
    try {
      rows = parse<CsvRow>(content, {
        delimiter: ';',
        bom: true,
        trim: true,
        skip_empty_lines: true,
        skip_records_with_empty_values: true,
        relax_column_count: true,
        info: true,
        columns: (header: string[]) => {
          hasHeader = true;
          return this.mapHeader(header, filePath);
        },
      });
    } catch (error) {
      if (error instanceof CsvImportError) {
        throw error;
      }
      throw new CsvImportError(
        `Could not parse the movie list CSV file at "${filePath}" ` +
          `(check MOVIELIST_CSV_PATH): ${errorMessage(error)}`,
        { cause: error },
      );
    }

    if (!hasHeader) {
      throw new CsvImportError(
        `The movie list CSV file at "${filePath}" is empty.`,
      );
    }

    return rows;
  }

  private mapHeader(header: string[], filePath: string): string[] {
    const columns = header.map((column) => column.trim().toLowerCase());
    const missing = REQUIRED_COLUMNS.filter(
      (column) => !columns.includes(column),
    );

    if (missing.length > 0) {
      throw new CsvImportError(
        `The movie list CSV file at "${filePath}" is missing the required ` +
          `column(s): ${missing.join(', ')}. Expected header: ${REQUIRED_COLUMNS.join(';')}.`,
      );
    }

    return columns;
  }

  private toMovieRows(rows: CsvRow[]): MovieRow[] {
    const movies: MovieRow[] = [];
    const firstByKey = new Map<string, { movie: MovieRow; line: number }>();

    for (const { record, info } of rows) {
      const year = (record.year ?? '').trim();
      const title = (record.title ?? '').trim();

      if (!/^\d+$/.test(year)) {
        this.logger.warn(
          `Skipping line ${info.lines}: missing or non-numeric year "${year}".`,
        );
        continue;
      }
      if (title.length === 0) {
        this.logger.warn(`Skipping line ${info.lines}: empty title.`);
        continue;
      }

      const movie: MovieRow = {
        year: Number(year),
        title,
        winner: (record.winner ?? '').trim().toLowerCase() === 'yes',
        producers: parseNameList(record.producers),
        studios: parseNameList(record.studios),
      };

      const key = duplicateKey(movie);
      const first = firstByKey.get(key);
      if (first !== undefined) {
        if (movie.winner && !first.movie.winner) {
          first.movie.winner = true;
          this.logger.warn(
            `Skipping line ${info.lines}: duplicate of line ${first.line}; ` +
              `the movie is marked as a winner because this line is.`,
          );
        } else {
          this.logger.warn(
            `Skipping line ${info.lines}: duplicate of line ${first.line}.`,
          );
        }
        continue;
      }
      firstByKey.set(key, { movie, line: info.lines });

      movies.push(movie);
    }

    return movies;
  }

  private persist(rows: MovieRow[]): Promise<ImportSummary> {
    return this.dataSource.transaction(async (manager) => {
      const producerIds = await this.saveNames(
        manager,
        Producer,
        rows.flatMap((row) => row.producers),
      );
      const studioIds = await this.saveNames(
        manager,
        Studio,
        rows.flatMap((row) => row.studios),
      );
      const movieIds = await this.saveMovies(manager, rows);

      await this.saveLinks(
        manager,
        MOVIE_PRODUCERS_TABLE,
        rows.flatMap((row, index) =>
          row.producers.map((name) => ({
            movie_id: movieIds[index],
            producer_id: producerIds.get(name),
          })),
        ),
      );
      await this.saveLinks(
        manager,
        MOVIE_STUDIOS_TABLE,
        rows.flatMap((row, index) =>
          row.studios.map((name) => ({
            movie_id: movieIds[index],
            studio_id: studioIds.get(name),
          })),
        ),
      );

      return {
        movies: rows.length,
        winners: rows.filter((row) => row.winner).length,
        producers: producerIds.size,
        studios: studioIds.size,
      };
    });
  }

  /**
   * Inserts the names that do not exist yet, reusing the existing ones, and
   * returns the id of every given name.
   */
  private async saveNames(
    manager: EntityManager,
    entity: typeof Producer | typeof Studio,
    names: string[],
  ): Promise<Map<string, number>> {
    const ids = new Map<string, number>();

    for (const batch of chunk([...new Set(names)], BATCH_SIZE)) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(entity)
        .values(batch.map((name) => ({ name })))
        .orIgnore()
        .execute();

      const saved = await manager.find(entity, {
        select: { id: true, name: true },
        where: { name: In(batch) },
      });
      for (const { id, name } of saved) {
        ids.set(name, id);
      }
    }

    return ids;
  }

  /**
   * Inserts the movies in batches and returns their ids in the same order as
   * the given rows. The TypeORM SQLite driver does not return the ids of a
   * multi-row INSERT, so the ids are assigned here, after the highest existing
   * one, and sent in the INSERT. A clash with an id written by someone else
   * fails on the primary key and rolls back the whole transaction.
   */
  private async saveMovies(
    manager: EntityManager,
    rows: MovieRow[],
  ): Promise<number[]> {
    const lastId = (await manager.maximum(Movie, 'id')) ?? 0;
    const movies = rows.map(({ year, title, winner }, index) => ({
      id: lastId + index + 1,
      year,
      title,
      winner,
    }));

    for (const batch of chunk(movies, BATCH_SIZE)) {
      await manager.insert(Movie, batch);
    }

    return movies.map(({ id }) => id);
  }

  private async saveLinks(
    manager: EntityManager,
    table: string,
    links: Record<string, number | undefined>[],
  ): Promise<void> {
    for (const batch of chunk(links, BATCH_SIZE)) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(table)
        .values(batch)
        .execute();
    }
  }
}

/**
 * Identifies a movie by year, title, studios and producers. The name lists are
 * sorted, so "A and B" and "B, A" describe the same movie. The winner flag is
 * not part of the key: the first occurrence is kept, and it becomes a winner
 * when any of its duplicates is one.
 */
function duplicateKey({ year, title, studios, producers }: MovieRow): string {
  return JSON.stringify([
    year,
    title,
    [...studios].sort(),
    [...producers].sort(),
  ]);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}
