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
  org_email: string;
  password: string;
} & TBase;


export type TBook = {
  quantity: number;
  publisher: string | null;
  users?: Array<string>;
  authors?: Array<string>;
  genres?: Array<string>;
} & TBase;



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