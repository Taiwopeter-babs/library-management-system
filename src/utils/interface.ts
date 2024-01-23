type TBase = {
  id?: string;
  name: string;
  updatedAt?: Date;
  createdAt?: Date;
}

/**
 * interface for a new Librarian
 */
export type TLibrarian = {
  email: string;
  orgEmail: string;
  password?: string;
  books?: Array<string | null>
} & TBase;


export type TBook = {
  quantity: number;
  publisher: string | null;
  users?: Array<string>;
} & TBase & { [key in 'authors' | 'genres']: string | null };



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