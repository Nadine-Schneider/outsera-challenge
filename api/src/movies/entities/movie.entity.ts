import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producer } from './producer.entity';
import { Studio } from './studio.entity';

export const MOVIE_PRODUCERS_TABLE = 'movie_producers';
export const MOVIE_STUDIOS_TABLE = 'movie_studios';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index('idx_movies_year')
  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @Index('idx_movies_winner')
  @Column({ type: 'boolean', default: false })
  winner!: boolean;

  @ManyToMany(() => Producer, (producer) => producer.movies)
  @JoinTable({
    name: MOVIE_PRODUCERS_TABLE,
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'producer_id', referencedColumnName: 'id' },
  })
  producers!: Producer[];

  @ManyToMany(() => Studio, (studio) => studio.movies)
  @JoinTable({
    name: MOVIE_STUDIOS_TABLE,
    joinColumn: { name: 'movie_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studio_id', referencedColumnName: 'id' },
  })
  studios!: Studio[];
}
