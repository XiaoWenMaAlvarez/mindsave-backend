import type { NextFunction, Request, Response } from "express";
import { CustomError, UserEntity, type AdminUserRepository } from "../../../domain/init.js";
import { UserAdminDTO, PaginationDto } from "../../validators/ini.js";
import { CreateUserAdmin } from "../../../domain/init.js";
import { isValidUuid } from '../../validators/ini.js';
import { bcryptAdapter } from "../../../config/bcrypt.adapter.js";

export class AdminUserController {

  constructor(
    private readonly adminAuthRepository: AdminUserRepository,
  ){}

  createUser = (req: Request, res: Response, next: NextFunction) => {
    const [error, userEntity] = UserAdminDTO.createUser(req.body);
    if(error) return res.status(400).json({error});

    new CreateUserAdmin(this.adminAuthRepository)
      .execute(userEntity!)
      .then((data: UserEntity) => res.status(201).json(data.toJson()))
      .catch(next);
  }


  public getUsers = (req: Request, res: Response, next: NextFunction) => {
    const {page = 1, limit = 10} = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if(error) return next(CustomError.badRequest(error));

    this.adminAuthRepository.getUsers(paginationDto!.page, paginationDto!.limit)
      .then((results) => res.json({results: results.map(r => r.toJson()), page, limit}))
      .catch(next);
  }

  public getUserById = (req: Request, res: Response, next: NextFunction) => {
    const idUsuario = req.params.idUsuario?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idUsuario);
    if(isValidId !== true) return res.status(400).json({error: isValidId});

    this.adminAuthRepository.getUserById(idUsuario)
      .then((reg) => {
        if(typeof reg === "string") return next(CustomError.badRequest(reg));
        return res.json(reg.toJson())
      })
      .catch(next);
  }
  
  public updateUser = (req: Request, res: Response, next: NextFunction) => {
    const idUsuario = req.params.idUsuario?.toString() ?? "";
    const [error, userEntity] = UserAdminDTO.editeUser(req.body, idUsuario);
    if(error) return res.status(400).json({error});

    userEntity!.password = bcryptAdapter.hash(userEntity!.password);
    
    this.adminAuthRepository.updateUser(userEntity!)
      .then((result: string | null) => {
        if(result) return next(CustomError.badRequest(result));
        return res.json({status: "success"});
      })
      .catch(next);
  }
  
  public deleteUser = (req: Request, res: Response, next: NextFunction) => {
    const idUsuario: string = req.params.idUsuario?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idUsuario);
    if(isValidId !== true) return res.status(400).json({error: isValidId});

    this.adminAuthRepository.deleteUser(idUsuario)
      .then((result: string | null) => {
        if(result) return next(CustomError.badRequest(result));
        return res.json({status: "success"});
      })
      .catch(next);
  }

  public restoreUser = (req: Request, res: Response, next: NextFunction) => {
    const idUsuario: string = req.params.idUsuario?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idUsuario);
    if(isValidId !== true) return res.status(400).json({error: isValidId});

    this.adminAuthRepository.restoreUser(idUsuario)
      .then((result: string | null) => {
        if(result) return next(CustomError.badRequest(result));
        return res.json({status: "success"});
      })
      .catch(next);
  }

}