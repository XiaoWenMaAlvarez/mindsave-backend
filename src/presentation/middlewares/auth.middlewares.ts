import { type NextFunction, type Request, type Response } from "express";
import { JwtAdapter } from "../../config/jwt.adapter.js";
import { Logger } from "../../config/logger.plugin.js";


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
      const payload = JwtAdapter.validateToken<{id: string, email: string, name: string, role: string}>(token);
      if(!payload) return res.status(401).json({error: "Invalid token"});

      if(!payload.email) return res.status(401).json({error: "Invalid Bearer token - user"});

      if(payload.role !== role) return res.status(401).json({error: "Invalid Bearer token - role"});

      req.body = req.body || {};
      req.body.payload = payload;
      next();

    } catch(error) {
      Logger.error(`${error}`);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }

}
