import jwt from "jsonwebtoken";
import { envs } from "./envs.js";
import {type StringValue} from 'ms';
import { Logger } from "../plugins/logger.plugin.js";

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {

  static generateToken(payload: any, duration: StringValue = '2h') {
    try {
      const token = jwt.sign(payload, JWT_SEED, { expiresIn: duration });
      return token;
    } catch (error) {
      Logger.error(`${error}`);
      return null;
    }
  }

  static validateToken<T>(token: string): T | null{
    try {
      const decoded = jwt.verify(token, JWT_SEED);
      return decoded as T;
    } catch (error) {
      Logger.error(`${error}`);
      return null;
    }
  }

}