import type { NextFunction, Request, Response } from "express";
import { CustomError, UserEntity, type AdminAuthRepository } from "../../../domain/init.js";
import { UserDTO } from "../../validators/dtos/auth/user.dto.js";
import { JwtAdapter } from "../../../config/jwt.adapter.js";
import { RegisterAdmin } from "../../../domain/init.js";

export class AdminAuthController {

  constructor(
    private readonly adminAuthRepository: AdminAuthRepository,
  ){}

  registerUser = (req: Request, res: Response, next: NextFunction) => {
    const [error, userEntity] = UserDTO.register(req.body);
    if(error) return res.status(400).json({error});

    new RegisterAdmin(this.adminAuthRepository)
      .execute(userEntity!)
      .then((data: UserEntity) => res.status(201).json(data.toJson()))
      .catch(next);
  }


  loginUser = (req: Request, res: Response, next: NextFunction) => {
    const [error, userLogin] = UserDTO.login(req.body);
    if(error) return res.status(400).json({error});

    this.adminAuthRepository.login(userLogin!.email, userLogin!.password)
      .then((result: UserEntity | string) => {
        if(typeof result === 'string') {
          if(result === "EMAIL_NOT_VERIFIED") return res.status(401).json({error: result})
          return res.status(400).json({error: result})
        };
        if(result instanceof UserEntity) {
          const {password, ...user} = result.toJson();
          const token = JwtAdapter.generateToken({id: user.id, email: user.email, name: user.name, role: user.role});
          if(!token) throw CustomError.internalServerError("Error generating token");
          return res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            token
          });
        }
      })
      .catch(next);
  }

  checkStatus = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, email, name, role } = req.user!;
      const token = JwtAdapter.generateToken({ id, email, name, role });
      if(!token) throw CustomError.internalServerError("Error generating token");
      return res.status(200).json({
        id,
        email,
        name,
        token,
        role
      });
    } catch (error) {
      next(error);
    }
  }

}