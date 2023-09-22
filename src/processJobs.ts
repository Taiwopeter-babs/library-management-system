import Queue from "bull";

import Book from "./controllers/BookController";
import dataSource from "./utils/dataSource";
import Author from "./controllers/AuthorController";
import Genre from "./controllers/GenreController";


/**
 * ### add authors in array to queue with authorName and bookId.
 * - Processing: query each author by name, if null create a new author. Link each author
 * with the book. This is done at the background to reduce latency in API response.
 * 
 * ### Same process is repeated with `genres` objects
 */

const authorsQueue = new Queue('authorsQueue');
const genresQueue = new Queue('genresQueue');

/**
 * ### Add authors to queue with name and book to link with 
 */
export async function addAuthorsToQueueAndProcess(authorsArray: Array<string>, book: Book) {
  if (authorsArray.length === 0) {
    throw new Error('Author absent');
  }
  for (let authorName of authorsArray) {
    authorsQueue.add({ authorName: authorName.toLowerCase(), book });
  }
}

/**
 * ### Add genres to queue with name and book to link with 
 */
export async function addGenresToQueueAndProcess(genresArray: Array<string>, book: Book) {
  if (genresArray.length === 0) {
    throw new Error('Genre absent');
  }
  for (let genreName of genresArray) {
    genresQueue.add({ genreName: genreName.toLowerCase(), book });
  }
}

// PROCESS JOBS IN authorsQueue
authorsQueue.process((job, done) => {
  // check job data
  if (!job.data.authorName) done(new Error('authorName absent in job'));
  if (!job.data.book) done(new Error('Book absent in job'));

  // check if author exists, if not create author and link with book
  job.progress(50);
  dataSource.getAuthorByName(job.data.authorName)
    .then(async (author) => {
      // create author if not exists
      if (!author) {
        const newAuthor = new Author();
        newAuthor.name = job.data.authorName;
        const savedAuthor = await dataSource.saveEntity(newAuthor);
        // link aauthor with book
        dataSource.saveAuthorBooks(savedAuthor, job.data.book)
          .then((result) => {
            job.progress(100);
            console.log(`'${job.data.book.name}' now linked with ${savedAuthor.name}`);
            // end job
            done();
          }).catch((error) => {
            console.log(`Error linking ${savedAuthor.name} with ${job.data.book.name}`, error);
          });
      } else {
        // author exists; link author with book
        dataSource.saveAuthorBooks(author, job.data.book)
          .then((result) => {
            job.progress(100);
            console.log(`${job.data.book.name} now linked with ${author.name}`);
            done();
          }).catch((error) => {
            console.log(`Error while linking ${author.name} with ${job.data.book.name}`);
          });
      }
    });
});

// PROCESS JOBS IN genresQueue
genresQueue.process((job, done) => {
  // check job data
  if (!job.data.genreName) done(new Error('genreName absent in job'));
  if (!job.data.book) done(new Error('Book absent in job'));

  // check if author exists, if not create author and link with book
  job.progress(50);
  dataSource.getGenreByName(job.data.genreName)
    .then(async (genre) => {
      // create genre if not exists
      if (!genre) {
        const newGenre = new Genre();
        newGenre.name = job.data.genreName;
        const savedGenre = await dataSource.saveEntity(newGenre);
        // link author with book
        dataSource.saveGenreBooks(savedGenre, job.data.book)
          .then(() => {
            job.progress(100);
            console.log(`'${job.data.book.name}' now linked with genre ${savedGenre.name}`);
            done();
          }).catch((error) => {
            console.log(`Error linking ${savedGenre.name} with ${job.data.book.name}`, error);
          });
      } else {
        // author exists; link author with book
        dataSource.saveGenreBooks(genre, job.data.book)
          .then(() => {
            console.log(`${job.data.book.name}' now linked with genre ${genre.name}`);
            job.progress(100);
            done();
          }).catch((error) => {
            console.log(`Error while linking ${genre.name} with ${job.data.book.name}`);
          });
      }
    });
});


// TRACK JOBS' PROGRESS
authorsQueue.on('progress', (job, progress) => {
  console.log(`${job.id} has reached completion ${progress}%`)
});

genresQueue.on('progress', (job, progress) => {
  console.log(`${job.id} has reached completion ${progress}%`)
});
