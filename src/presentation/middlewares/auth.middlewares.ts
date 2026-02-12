import { type NextFunction, type Request, type Response } from "express";
import { JwtAdapter } from "../../config/jwt.adapter.js";
import { Logger } from "../../plugins/logger.plugin.js";


export class AuthMiddleware {

  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header("Authorization");
    if(!authorization) return res.status(401).json({error: "No token provided"});
    if(!authorization.startsWith("Bearer ")) return res.status(401).json({error: "Invalid Bearer token"});

    const token = authorization.split(" ").at(1) || "";
    try {
      const payload = JwtAdapter.validateToken<{id: string, email: string, name: string}>(token);
      if(!payload) return res.status(401).json({error: "Invalid token"});

      if(!payload.email) return res.status(401).json({error: "Invalid Bearer token - user"});

      req.body = req.body || {};
      req.body.payload = payload;
      next();

    } catch(error) {
      Logger.error(`${error}`);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }

}
