import bcrypt from 'bcrypt';

export default class PassowordAuth {
  /** 
   * ### verifies a password
   * @param password password to compare
   * @param hashedPassword hashed password to compare with password
   * @returns a promise with a boolean, otherwise a promise error
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hashedPassword)
        .then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(new Error('Unable to verify password'));
        });
    });
  }

  /**
   * ### hashes a user password
   */
  static async hashPassword(password: string): Promise<string> {
    // salt rounds to hash password with
    const saltRounds = 10;

    return new Promise((resolve, reject) => {
      // generate salt to hash password
      bcrypt.genSalt(saltRounds, (error, salt) => {
        if (error) reject(new Error('Unable to hash password'));

        // hash password with salt
        bcrypt.hash(password, salt)
          .then((hashedPassword) => {
            resolve(hashedPassword);
          }).catch((error) => {
            reject(new Error('Unable to hash password'));
          })
      });
    });
  }
}
