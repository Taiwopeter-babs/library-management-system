import Author from "../controllers/AuthorController";
import Book from "../controllers/BookController";
import Genre from "../controllers/GenreController";
import Librarian from "../controllers/LibControllers";
import User from "../controllers/UserController";

/**
 * interface for a new Librarian
 */
export interface NewLibrarian {
  name: string;
  email: string;
  org_email: string;
  password: string;
}

export interface NewBook {
  name: string;
  quantity: number;
  publisher: string | null;
}

interface BaseInterface {
  id?: string;
  name: string;
  updatedAt?: Date;
  createdAt?: Date;
}

/**
 * Book Interface
 */
export interface BookInterface extends BaseInterface {
  quantity?: number;
  publisher?: string | null;
  users?: Array<string>;
  authors?: Array<string>;
  genres?: Array<string>;
}

/**
 * ### interface for a new user
 */
export interface UserInterface extends BaseInterface {
  email: string;
  books?: Array<string>;
}

/**
 * ### interface for caching data
 */
export interface CacheInterface extends BaseInterface {
  users?: string[];
  books?: string[];
  email?: string;
  quantity?: number;
  publisher?: string;
}

/**
 * ### Interface for all entities
 */
export interface EntityInterface {
  id: string;
  name?: string;
  quantity?: number;
  updatedAt: Date;
  email?: string;
  org_email?: string;
  password?: string;
  publisher?: string;
}


export type EntityType = Author | Book | Genre | Librarian | User;

/**
 * ### entity constructor that maps entity name to the type
 */
export const entityConstructors: Record<string, new () => EntityType> = {
  Author, Book, Genre, Librarian, User
}

export type EntityNameType = 'Author' | 'Book' | 'Genre' | 'Librarian' | 'User';