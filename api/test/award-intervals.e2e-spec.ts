import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, fixturePath, TestApp } from './utils/create-test-app';

const AWARD_INTERVALS_PATH = '/producers/award-intervals';

interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

interface Scenario {
  name: string;
  csvPath: string;
  expected: { min: ProducerInterval[]; max: ProducerInterval[] };
}

const EMPTY_RESULT = { min: [], max: [] };

const scenarios: Scenario[] = [
  {
    name: 'the default movie list',
    csvPath: join(__dirname, '..', 'data', 'Movielist.csv'),
    expected: {
      min: [
        {
          producer: 'Joel Silver',
          interval: 1,
          previousWin: 1990,
          followingWin: 1991,
        },
      ],
      max: [
        {
          producer: 'Matthew Vaughn',
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
      ],
    },
  },
  {
    name: 'ties in the smallest and in the largest interval',
    csvPath: fixturePath('intervals-ties.csv'),
    expected: {
      min: [
        {
          producer: 'Producer A',
          interval: 1,
          previousWin: 2000,
          followingWin: 2001,
        },
        {
          producer: 'Producer E',
          interval: 1,
          previousWin: 2000,
          followingWin: 2001,
        },
        {
          producer: 'Producer B',
          interval: 1,
          previousWin: 2010,
          followingWin: 2011,
        },
      ],
      max: [
        {
          producer: 'Producer C',
          interval: 10,
          previousWin: 2000,
          followingWin: 2010,
        },
        {
          producer: 'Producer D',
          interval: 10,
          previousWin: 2005,
          followingWin: 2015,
        },
      ],
    },
  },
  {
    name: 'the same producer in min and in max',
    csvPath: fixturePath('intervals-same-producer-min-max.csv'),
    expected: {
      min: [
        {
          producer: 'Producer A',
          interval: 1,
          previousWin: 2000,
          followingWin: 2001,
        },
      ],
      max: [
        {
          producer: 'Producer A',
          interval: 20,
          previousWin: 2001,
          followingWin: 2021,
        },
      ],
    },
  },
  {
    // The wins are out of order in the file, and the gap between the first
    // and the last win (14) must not be reported.
    name: 'a producer with four wins',
    csvPath: fixturePath('intervals-four-wins.csv'),
    expected: {
      min: [
        {
          producer: 'Producer A',
          interval: 1,
          previousWin: 2003,
          followingWin: 2004,
        },
      ],
      max: [
        {
          producer: 'Producer A',
          interval: 10,
          previousWin: 1993,
          followingWin: 2003,
        },
      ],
    },
  },
  {
    name: 'two wins of a producer in the same year',
    csvPath: fixturePath('intervals-same-year.csv'),
    expected: {
      min: [
        {
          producer: 'Producer A',
          interval: 0,
          previousWin: 2005,
          followingWin: 2005,
        },
      ],
      max: [
        {
          producer: 'Producer B',
          interval: 4,
          previousWin: 2000,
          followingWin: 2004,
        },
      ],
    },
  },
  {
    name: 'no producer with two wins',
    csvPath: fixturePath('intervals-single-wins.csv'),
    expected: EMPTY_RESULT,
  },
  {
    name: 'no winning movie',
    csvPath: fixturePath('intervals-no-winners.csv'),
    expected: EMPTY_RESULT,
  },
  {
    name: 'winning movies with several producers',
    csvPath: fixturePath('intervals-multiple-producers.csv'),
    expected: {
      min: [
        {
          producer: 'Producer A',
          interval: 3,
          previousWin: 2000,
          followingWin: 2003,
        },
        {
          producer: 'Producer B',
          interval: 3,
          previousWin: 2000,
          followingWin: 2003,
        },
      ],
      max: [
        {
          producer: 'Producer C',
          interval: 10,
          previousWin: 2000,
          followingWin: 2010,
        },
      ],
    },
  },
];

describe('GET /producers/award-intervals (e2e)', () => {
  describe.each(scenarios)('with $name', ({ csvPath, expected }) => {
    let testApp: TestApp;

    beforeAll(async () => {
      testApp = await createTestApp(csvPath);
    });

    afterAll(async () => {
      await testApp.app.close();
    });

    it('returns the smallest and the largest intervals', async () => {
      const response = await request(testApp.app.getHttpServer() as App).get(
        AWARD_INTERVALS_PATH,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expected);
    });
  });

  describe('documentation', () => {
    let testApp: TestApp;

    beforeAll(async () => {
      testApp = await createTestApp(fixturePath('intervals-ties.csv'));
    });

    afterAll(async () => {
      await testApp.app.close();
    });

    it('describes the route and its response in the OpenAPI document', async () => {
      const response = await request(testApp.app.getHttpServer() as App).get(
        '/api-docs-json',
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        paths: {
          [AWARD_INTERVALS_PATH]: {
            get: {
              responses: {
                200: {
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/AwardIntervalsResponseDto',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            AwardIntervalsResponseDto: {
              properties: {
                min: {
                  example: [
                    {
                      producer: 'Producer 1',
                      interval: 1,
                      previousWin: 2008,
                      followingWin: 2009,
                    },
                  ],
                },
                max: {
                  example: [
                    {
                      producer: 'Producer 1',
                      interval: 99,
                      previousWin: 1900,
                      followingWin: 1999,
                    },
                  ],
                },
              },
            },
          },
        },
      });
    });
  });
});
