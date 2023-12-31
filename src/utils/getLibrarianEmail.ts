import 'dotenv/config';

type uniqueReturn = ReturnType<typeof generateRandom>;

/**
 * Generates random string for the user.
 * @returns string
 */
export function generateRandom(numLength: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let result = '';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    let count = 0;

    while (count < numLength) {
      result += chars.charAt(Math.floor(Math.random() * (charsLength)));
      count += 1;
    }
    resolve(result);
  });
}


/**
 * Generate email field. A unique email is assigned
 * to each librarian with suffix - `@lms.com`
 */
export async function setUniqueEmail(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    generateRandom(3)
      .then((randomChars) => {
        let nameForEmail;

        // remove leading and trailing whitespaces if any
        const nameArray = name.trim().split(' ');

        // first two names are chosen for the email, but a single name works
        if (nameArray.length >= 2) {
          nameForEmail = nameArray.splice(0, 2).join('_');
        } else {
          nameForEmail = nameArray[0];
        }
        resolve(`${nameForEmail.toLowerCase()}_${randomChars}@lmsmail.com`);
      });
  });
}

/**
 * ### sets a unique password for the librarian
 * @returns a string
 */
export async function setUnqiuePassword(): uniqueReturn {
  const userPassword: Awaited<uniqueReturn> = await generateRandom(12);
  return userPassword;
}