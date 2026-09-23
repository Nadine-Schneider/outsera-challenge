import { Movie } from '../app/core/api/models/movie.model';

export const CANT_STOP_THE_MUSIC: Movie = {
  id: 1,
  year: 1980,
  title: "Can't Stop the Music",
  studios: ['Associated Film Distribution'],
  producers: ['Allan Carr'],
  winner: true,
};

export const CRUISING: Movie = {
  id: 2,
  year: 1980,
  title: 'Cruising',
  studios: ['Lorimar Productions', 'United Artists'],
  producers: ['Jerry Weintraub'],
  winner: false,
};

export const HOWARD_THE_DUCK: Movie = {
  id: 36,
  year: 1986,
  title: 'Howard the Duck',
  studios: ['Universal Studios'],
  producers: ['Gloria Katz'],
  winner: true,
};

export const UNDER_THE_CHERRY_MOON: Movie = {
  id: 37,
  year: 1986,
  title: 'Under the Cherry Moon',
  studios: ['Warner Bros.'],
  producers: ['Bob Cavallo', 'Joe Ruffalo', 'Steve Fargnoli'],
  winner: true,
};

export const LEONARD_PART_6: Movie = {
  id: 41,
  year: 1987,
  title: 'Leonard Part 6',
  studios: ['Columbia Pictures'],
  producers: ['Bill Cosby'],
  winner: true,
};
