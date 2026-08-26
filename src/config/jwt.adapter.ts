import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { envs } from "./envs.js";
import { Logger } from "./logger.plugin.js";

export type JwtPurpose = "session" | "email-verification" | "password-reset";

export interface PurposeJwtPayload {
  purpose: JwtPurpose;
}

const JWT_ISSUER = "mindsave-backend";

const JWT_SECRETS: Record<JwtPurpose, string> = {
  session: envs.JWT_SEED,
  "email-verification": envs.JWT_EMAIL_VERIFICATION_SEED,
  "password-reset": envs.JWT_PASSWORD_RESET_SEED,
};

export class JwtAdapter {

  static generateToken(
    payload: Record<string, unknown>,
    purpose: JwtPurpose,
    duration: SignOptions["expiresIn"] = "2h",
  ): string | null {
    try {
      const token = jwt.sign(
        { ...payload, purpose },
        JWT_SECRETS[purpose],
        {
          algorithm: "HS256",
          audience: `mindsave:${purpose}`,
          expiresIn: duration,
          issuer: JWT_ISSUER,
        },
      );
      return token;
    } catch (error) {
      Logger.error(`${error}`);
      return null;
    }
  }

  static validateToken<T extends object>(
    token: string,
    expectedPurpose: JwtPurpose,
  ): (T & PurposeJwtPayload) | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRETS[expectedPurpose], {
        algorithms: ["HS256"],
        audience: `mindsave:${expectedPurpose}`,
        issuer: JWT_ISSUER,
      });

      if (typeof decoded === "string" || decoded.purpose !== expectedPurpose) return null;

      return decoded as T & PurposeJwtPayload;
    } catch (error) {
      return null;
    }
  }

}
