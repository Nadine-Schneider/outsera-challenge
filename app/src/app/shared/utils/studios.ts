import { StudioWithWinCount } from '../../core/api/models/studio-with-win-count.model';

export function topStudios(
  studios: readonly StudioWithWinCount[],
  count = 3,
): StudioWithWinCount[] {
  return [...studios]
    .sort((a, b) => b.winCount - a.winCount || a.name.localeCompare(b.name, 'en'))
    .slice(0, Math.max(count, 0));
}
