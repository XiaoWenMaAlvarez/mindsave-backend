import { type NextFunction, type Request, type Response } from "express";
import { JwtAdapter } from "../../config/jwt.adapter.js";
import { Logger } from "../../config/logger.plugin.js";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
    interface Locals {
      user?: UserPayload;
    }
  }
}

export class AuthMiddleware {

  static async validateJWTUser(req: Request, res: Response, next: NextFunction) {
    return AuthMiddleware.validateJWT(req, res, next, "USER_ROL")
  }

  static async validateJWTAdmin(req: Request, res: Response, next: NextFunction) {
    return AuthMiddleware.validateJWT(req, res, next, "PROFESIONAL_ROL")
  }

  static async validateJWT(req: Request, res: Response, next: NextFunction, role: string) {
    const authorization = req.header("Authorization");
    if(!authorization) return res.status(401).json({error: "No token provided"});
    if(!authorization.startsWith("Bearer ")) return res.status(401).json({error: "Invalid Bearer token"});

    const token = authorization.split(" ").at(1) || "";
    try {
      const payload = JwtAdapter.validateToken<UserPayload>(token);
      if(!payload) return res.status(401).json({error: "Invalid token"});

      if(!payload.email) return res.status(401).json({error: "Invalid Bearer token - user"});

      if(payload.role !== role) return res.status(401).json({error: "Invalid Bearer token - role"});

      req.user = payload;
      res.locals.user = payload;
      next();

    } catch(error) {
      Logger.error(`${error}`);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }

}
