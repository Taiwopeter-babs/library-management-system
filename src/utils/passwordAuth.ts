import bcrypt from 'bcrypt';

export default class PassowordAuth {

  /** 
   * ### verifies a password
   */
  static async verifyPassword(password: string, hash: string) {

    try {
      const isVerified = await bcrypt.compare(password, hash);
      return isVerified
    } catch (error) {
      throw error;
    }

  }

  /**
   * ### hashes a user password
   */
  static async hashPassword(password: string): Promise<string> {
    // salt rounds to hash password with
    const saltRounds = 10;

    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw error;
    }
  }
}
