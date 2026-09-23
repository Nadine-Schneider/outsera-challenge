import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DataSource } from 'typeorm';
import type { Movie, Studio } from '../src/movies/entities';
import type { Producer } from '../src/producers/entities';
import { createTestApp, fixturePath, TestApp } from './utils/create-test-app';

interface ImportedMovie {
  year: number;
  title: string;
  winner: boolean;
  producers: string[];
  studios: string[];
}

async function findMovies(dataSource: DataSource): Promise<ImportedMovie[]> {
  const movies = await dataSource.getRepository<Movie>('Movie').find({
    relations: { producers: true, studios: true },
    order: { id: 'ASC' },
  });

  return movies.map(({ year, title, winner, producers, studios }) => ({
    year,
    title,
    winner,
    producers: producers.map(({ name }) => name).sort(),
    studios: studios.map(({ name }) => name).sort(),
  }));
}

async function findNames(
  dataSource: DataSource,
  entity: 'Producer' | 'Studio',
): Promise<string[]> {
  const rows = await dataSource
    .getRepository<Producer | Studio>(entity)
    .find({ order: { name: 'ASC' } });
  return rows.map(({ name }) => name);
}

describe('CSV import (e2e)', () => {
  describe('with the default movie list', () => {
    let testApp: TestApp;

    beforeAll(async () => {
      testApp = await createTestApp(
        join(__dirname, '..', 'data', 'Movielist.csv'),
      );
    });

    afterAll(async () => {
      await testApp.app.close();
    });

    it('imports every movie, producer and studio', async () => {
      const { dataSource } = testApp;

      expect({
        movies: await dataSource.getRepository('Movie').count(),
        winners: await dataSource
          .getRepository('Movie')
          .count({ where: { winner: true } }),
        producers: await dataSource.getRepository('Producer').count(),
        studios: await dataSource.getRepository('Studio').count(),
      }).toEqual({ movies: 206, winners: 42, producers: 359, studios: 59 });
    });

    it('splits producers joined by "and"', async () => {
      const producers = await findNames(testApp.dataSource, 'Producer');

      expect(producers).toEqual(
        expect.arrayContaining(['Andrew Bergman', 'Mike Lobell']),
      );
      expect(producers.filter((name) => name.includes(' and '))).toEqual([]);
    });
  });

  describe('with separator and winner variations', () => {
    let testApp: TestApp;

    beforeAll(async () => {
      testApp = await createTestApp(fixturePath('name-formats.csv'));
    });

    afterAll(async () => {
      await testApp.app.close();
    });

    it('parses names and the winner flag of every movie', async () => {
      expect(await findMovies(testApp.dataSource)).toEqual([
        {
          year: 2000,
          title: 'Movie A',
          winner: true,
          producers: ['Producer A', 'Producer B', 'Producer C'],
          studios: ['Studio X', 'Studio Y', 'Studio Z'],
        },
        {
          year: 2001,
          title: 'Movie B',
          winner: true,
          producers: ['Producer A', 'Producer B', 'Producer D'],
          studios: ['Studio W', 'Studio X'],
        },
        {
          year: 2002,
          title: 'Movie C',
          winner: false,
          producers: ['Alexander Payne', 'Andrew Bergman'],
          studios: ['Studio Y'],
        },
        {
          year: 2003,
          title: 'Movie D',
          winner: false,
          producers: ['Producer E', 'Producer F'],
          studios: ['Studio Z'],
        },
        {
          year: 2004,
          title: 'Movie E',
          winner: true,
          producers: ['Brandon Anderson'],
          studios: ['Studio W'],
        },
        {
          year: 2005,
          title: 'Movie F',
          winner: false,
          producers: ['Andy Sandler', 'Producer G', 'Producer H'],
          studios: ['Studio W', 'Studio X', 'Studio Y'],
        },
      ]);
    });

    it('reuses producers and studios shared by several movies', async () => {
      const { dataSource } = testApp;

      expect({
        producers: await findNames(dataSource, 'Producer'),
        studios: await findNames(dataSource, 'Studio'),
      }).toEqual({
        producers: [
          'Alexander Payne',
          'Andrew Bergman',
          'Andy Sandler',
          'Brandon Anderson',
          'Producer A',
          'Producer B',
          'Producer C',
          'Producer D',
          'Producer E',
          'Producer F',
          'Producer G',
          'Producer H',
        ],
        studios: ['Studio W', 'Studio X', 'Studio Y', 'Studio Z'],
      });
    });
  });

  describe('with invalid rows', () => {
    let testApp: TestApp;

    beforeAll(async () => {
      testApp = await createTestApp(fixturePath('invalid-rows.csv'));
    });

    afterAll(async () => {
      await testApp.app.close();
    });

    it('imports only the valid rows', async () => {
      const { dataSource } = testApp;

      expect({
        movies: await findMovies(dataSource),
        producers: await findNames(dataSource, 'Producer'),
        studios: await findNames(dataSource, 'Studio'),
      }).toEqual({
        movies: [
          {
            year: 2000,
            title: 'Valid One',
            winner: true,
            producers: ['Producer A'],
            studios: ['Studio A'],
          },
          {
            year: 2003,
            title: 'Valid Two',
            winner: true,
            producers: ['Producer A'],
            studios: ['Studio B'],
          },
        ],
        producers: ['Producer A'],
        studios: ['Studio A', 'Studio B'],
      });
    });
  });

  describe('with duplicate rows', () => {
    let testApp: TestApp;

    beforeAll(async () => {
      testApp = await createTestApp(fixturePath('duplicate-rows.csv'));
    });

    afterAll(async () => {
      await testApp.app.close();
    });

    it('keeps one movie per title, year, studios and producers, a winner when any of its rows is', async () => {
      expect(await findMovies(testApp.dataSource)).toEqual([
        // Two winning rows and a later row without winner: one winning movie.
        {
          year: 2000,
          title: 'Movie A',
          winner: true,
          producers: ['Producer A', 'Producer B'],
          studios: ['Studio A'],
        },
        {
          year: 2000,
          title: 'Movie A',
          winner: true,
          producers: ['Producer A'],
          studios: ['Studio A'],
        },
        {
          year: 2001,
          title: 'Movie A',
          winner: true,
          producers: ['Producer A', 'Producer B'],
          studios: ['Studio A'],
        },
        {
          year: 2000,
          title: 'Movie A',
          winner: true,
          producers: ['Producer A', 'Producer B'],
          studios: ['Studio B'],
        },
        {
          year: 2000,
          title: 'Movie B',
          winner: true,
          producers: ['Producer A', 'Producer B'],
          studios: ['Studio A'],
        },
        // A row without winner followed by a winning duplicate.
        {
          year: 2002,
          title: 'Movie C',
          winner: true,
          producers: ['Producer C'],
          studios: ['Studio C'],
        },
      ]);
    });
  });

  describe('with more movies than a single insert batch', () => {
    // 1,201 movies need three batches of 500 rows.
    const movieCount = 1201;
    const expectedMovies: ImportedMovie[] = Array.from(
      { length: movieCount },
      (_, index) => {
        const number = index + 1;
        return {
          year: 1900 + (number % 100),
          title: `Movie ${number}`,
          winner: number % 3 === 0,
          producers: [`Producer ${number}`],
          studios: [`Studio ${number % 10}`],
        };
      },
    );

    let tempDir: string;
    let testApp: TestApp;

    beforeAll(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'movielist-'));
      const csvPath = join(tempDir, 'many-movies.csv');
      const lines = expectedMovies.map(
        ({ year, title, winner, producers, studios }) =>
          [year, title, studios[0], producers[0], winner ? 'yes' : ''].join(
            ';',
          ),
      );
      await writeFile(
        csvPath,
        ['year;title;studios;producers;winner', ...lines].join('\n'),
      );

      testApp = await createTestApp(csvPath);
    });

    afterAll(async () => {
      await testApp.app.close();
      await rm(tempDir, { recursive: true, force: true });
    });

    it('assigns sequential ids in the order of the file', async () => {
      const movies = await testApp.dataSource
        .getRepository<Movie>('Movie')
        .find({ select: { id: true, title: true }, order: { id: 'ASC' } });

      expect(movies).toEqual(
        expectedMovies.map(({ title }, index) => ({ id: index + 1, title })),
      );
    });

    it('links every movie to its own producers and studios', async () => {
      expect(await findMovies(testApp.dataSource)).toEqual(expectedMovies);
    });
  });

  describe('with an invalid file', () => {
    it('fails to start when the file does not exist', async () => {
      const csvPath = fixturePath('does-not-exist.csv');
      const startup = createTestApp(csvPath);

      await expect(startup).rejects.toThrow(
        `Could not read the movie list CSV file at "${csvPath}" (check MOVIELIST_CSV_PATH)`,
      );
      await expect(startup).rejects.toMatchObject({ name: 'CsvImportError' });
    });

    it('fails to start when the file is empty', async () => {
      const csvPath = fixturePath('empty.csv');
      const startup = createTestApp(csvPath);

      await expect(startup).rejects.toThrow(
        `The movie list CSV file at "${csvPath}" is empty.`,
      );
      await expect(startup).rejects.toMatchObject({ name: 'CsvImportError' });
    });

    it('fails to start when a required column is missing', async () => {
      const startup = createTestApp(fixturePath('missing-column.csv'));

      await expect(startup).rejects.toThrow(
        'is missing the required column(s): winner.',
      );
      await expect(startup).rejects.toMatchObject({ name: 'CsvImportError' });
    });

    it('fails to start when the file is malformed, keeping the parser error as the cause', async () => {
      const csvPath = fixturePath('malformed.csv');
      const startup = createTestApp(csvPath);

      await expect(startup).rejects.toThrow(
        `Could not parse the movie list CSV file at "${csvPath}" (check MOVIELIST_CSV_PATH): Quote Not Closed`,
      );
      await expect(startup).rejects.toMatchObject({ name: 'CsvImportError' });
      await expect(startup).rejects.toHaveProperty(
        'cause.code',
        'CSV_QUOTE_NOT_CLOSED',
      );
    });
  });
});
