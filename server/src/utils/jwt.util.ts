import jwtLib from 'jsonwebtoken'
import { config } from '../config/index.js'

export interface JwtPayload {
  userId: string
  email: string
}

export function signToken(payload: JwtPayload): string {
  return jwtLib.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

export function verifyToken(token: string): JwtPayload {
  return jwtLib.verify(token, config.jwt.secret) as JwtPayload
}
