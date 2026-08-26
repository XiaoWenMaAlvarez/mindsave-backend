import { type NextFunction, type Request, type Response } from "express";
import { JwtAdapter } from "../../config/jwt.adapter.js";
import { Logger } from "../../config/logger.plugin.js";
import type { UserRepository } from "../../domain/init.js";

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

  constructor(
    private readonly userRepository: Pick<UserRepository, "findActiveUserById">,
  ) {}

  validateJWTUser = async (req: Request, res: Response, next: NextFunction) => {
    return this.validateJWT(req, res, next, "USER_ROL")
  }

  validateJWTAdmin = async (req: Request, res: Response, next: NextFunction) => {
    return this.validateJWT(req, res, next, "PROFESIONAL_ROL")
  }

  private async validateJWT(req: Request, res: Response, next: NextFunction, role: string) {
    const authorization = req.header("Authorization");
    if(!authorization) return res.status(401).json({error: "No token provided"});
    if(!authorization.startsWith("Bearer ")) return res.status(401).json({error: "Invalid Bearer token"});

    const token = authorization.split(" ").at(1) || "";
    try {
      const payload = JwtAdapter.validateToken<UserPayload>(token, "session");
      if(!payload) return res.status(401).json({error: "Invalid token"});

      if(typeof payload.id !== "string" || payload.id.trim() === "") {
        return res.status(401).json({error: "Invalid Bearer token - user"});
      }

      const activeUser = await this.userRepository.findActiveUserById(payload.id);
      if(!activeUser) return res.status(401).json({error: "Invalid Bearer token - user"});

      if(activeUser.role !== role) return res.status(401).json({error: "Invalid Bearer token - role"});

      const currentUser: UserPayload = {
        id: activeUser.id,
        email: activeUser.email,
        name: activeUser.name,
        role: activeUser.role,
      };

      req.user = currentUser;
      res.locals.user = currentUser;
      next();

    } catch(error) {
      Logger.error(`${error}`);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }

}
