import bcryptLib from 'bcrypt'
import { config } from '../config/index.js'

export async function hashPassword(password: string): Promise<string> {
  return bcryptLib.hash(password, config.bcrypt.saltRounds)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptLib.compare(password, hash)
}
