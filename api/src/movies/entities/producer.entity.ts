import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity({ name: 'producers' })
export class Producer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @ManyToMany(() => Movie, (movie) => movie.producers)
  movies!: Movie[];
}
