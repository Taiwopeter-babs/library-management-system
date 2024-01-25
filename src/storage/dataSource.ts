import { mongoConfig } from './config';
import { MongoClient, Db } from 'mongodb';



const { host, port, database } = mongoConfig;

/**
 * class to load database and control connections
 */
class DataClass {

  private readonly url = `mongodb://${host}:${port}`;
  private readonly database = database;
  db: Db;
  client: MongoClient;

  constructor() {
    this.client = new MongoClient(this.url);
    this.client.connect()
      .then(async () => {
        console.log(`Connected to mongodb server on port ${port}`);
        this.db = this.client.db(this.database);

        // Collections
        await this.db.createCollection('books');
        await this.db.createCollection('librarians');

        console.log('collections created')

        // Indices
        await this.db.createIndex('books',
          { name: "text", publisher: "text" }, { name: "booksIndex" }
        );

        await this.db.createIndex('librarians',
          { orgEmail: "text" }, { unique: true, name: "orgEmailIndex" });

      })
      .catch((error) => {
        console.error('Error connecting to mongodb', error);
      })
  }

}




const dbClient = new DataClass();

export default dbClient;
