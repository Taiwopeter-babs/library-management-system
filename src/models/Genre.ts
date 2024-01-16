import { Column, Entity, OneToMany } from 'typeorm';
import Base from './Base';
import BooksGenres from './BooksGenres';

/**
 * Genre class - A genre can be linked to multiple books
 * and vice versa. Mapped to `genres` table
 */
@Entity('genres')
class Genre extends Base {

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false
  })
  name: string;

  // relationship books-genres
  @OneToMany(() => BooksGenres, booksGenres => booksGenres.genre)
  booksToGenres: BooksGenres[];

}

export default Genre;