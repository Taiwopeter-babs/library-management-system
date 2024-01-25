import { ObjectId } from "mongodb";

type TBase = {
  id?: string | ObjectId;
  name: string;
  updatedAt?: Date;
  createdAt?: Date;
}

/**
 * Mongodb document type for librarians
 * A reference to books are stored to prevent
 * duplication of documents' data.
 * 
 */
export type TLibrarian = {
  email: string;
  orgEmail: string;
  password?: string;
  books?: Array<string | null>
} & TBase;

/** 
 * ### Mongodb document type for books
 */
export type TBook = {
  quantity: number;
  publisher: string | null;
} & TBase & { [key in 'authors' | 'genres']: Array<string | null> };


/**
 * Mongodb document type for users 
 * A reference to books are stored instead of being embedded
 */
export type TUser = {
  email: string;
  books?: Array<string>;
} & TBase;

/**
 * ### interface for caching data
 */
export type TCache = {
  [key: string]: string;
};
