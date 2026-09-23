import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity({ name: 'studios' })
export class Studio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @ManyToMany(() => Movie, (movie) => movie.studios)
  movies!: Movie[];
}
