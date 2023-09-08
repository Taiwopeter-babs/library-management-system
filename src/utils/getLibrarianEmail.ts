import 'dotenv/config';

/**
 * Generates random string for the user.
 * @returns string
 */
function generateRandom(numLength: number): string {

  let result = '';

  const chars = process.env.RANDOM_CHARACTERS;
  const charsLength = chars?.length;

  let count = 0;

  while (count < numLength) {
    result += chars?.charAt(Math.floor(Math.random() * (charsLength ?? 10)));
    count += 1;
  }
  return result;
}


/**
 * Generate email field. A unique email is assigned
 * to each librarian with suffix - `@lms.com`
 */
async function setUniqueEmail(username: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let nameForEmail;

    // remove leading and trailing whitespaces if any
    const nameArray = username.trim().split(' ');

    // first two names are chosen for the email, a single name works
    if (nameArray.length >= 2) {
      nameForEmail = nameArray.splice(0, 2).join('_');
    } else {
      nameForEmail = nameArray[0];
    }
    resolve(`${nameForEmail.toLowerCase()}_${generateRandom(3)}@lmsmail.com`);
  });
}

export default setUniqueEmail;