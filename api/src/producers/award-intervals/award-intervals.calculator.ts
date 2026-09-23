import {
  AwardIntervals,
  ProducerInterval,
  ProducerWin,
} from './award-intervals.types';

export function calculateAwardIntervals(
  wins: readonly ProducerWin[],
): AwardIntervals {
  const intervals = consecutiveIntervals(groupYearsByProducer(wins));

  if (intervals.length === 0) {
    return { min: [], max: [] };
  }

  const { min, max } = intervals.reduce(
    (bounds, { interval }) => ({
      min: interval < bounds.min ? interval : bounds.min,
      max: interval > bounds.max ? interval : bounds.max,
    }),
    { min: intervals[0].interval, max: intervals[0].interval },
  );

  return {
    min: intervals.filter(({ interval }) => interval === min).sort(byWin),
    max: intervals.filter(({ interval }) => interval === max).sort(byWin),
  };
}

function groupYearsByProducer(
  wins: readonly ProducerWin[],
): Map<string, number[]> {
  const yearsByProducer = new Map<string, number[]>();

  for (const { producer, year } of wins) {
    const years = yearsByProducer.get(producer);
    if (years) {
      years.push(year);
    } else {
      yearsByProducer.set(producer, [year]);
    }
  }

  return yearsByProducer;
}

function consecutiveIntervals(
  yearsByProducer: Map<string, number[]>,
): ProducerInterval[] {
  const intervals: ProducerInterval[] = [];

  for (const [producer, years] of yearsByProducer) {
    years.sort((a, b) => a - b);

    for (let index = 1; index < years.length; index++) {
      const previousWin = years[index - 1];
      const followingWin = years[index];
      intervals.push({
        producer,
        interval: followingWin - previousWin,
        previousWin,
        followingWin,
      });
    }
  }

  return intervals;
}

/**
 * Orders by previous win, then by producer. The producer names are compared
 * by code unit, not with `localeCompare`, so the order does not depend on the
 * locale of the machine.
 */
function byWin(a: ProducerInterval, b: ProducerInterval): number {
  if (a.previousWin !== b.previousWin) {
    return a.previousWin - b.previousWin;
  }
  if (a.producer !== b.producer) {
    return a.producer < b.producer ? -1 : 1;
  }
  return a.followingWin - b.followingWin;
}
