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