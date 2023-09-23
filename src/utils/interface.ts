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

/**
 * Book Interface
 */
export interface BookInterface {
  id: string;
  name: string;
  quantity: number;
  publisher?: string | null;
  users?: Array<string>;
  createdAt?: Date;
}

/**
 * ### interface for a new user
 */
export interface UserInterface {
  name: string;
  email: string;
  id?: string;
  books?: Array<string>;
  createdAt?: Date;
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
}

export type EntityType = Author | Book | Genre | Librarian | User;

export const entityConstructors: Record<string, new () => EntityType> = {
  Author, Book, Genre, Librarian, User
}
