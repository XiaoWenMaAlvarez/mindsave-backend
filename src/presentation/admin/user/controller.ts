import type { Request, Response } from "express";
import { CustomError, UserEntity, type AdminUserRepository } from "../../../domain/init.js";
import { Logger } from "../../../config/logger.plugin.js";
import { UserAdminDTO, PaginationDto } from "../../validators/ini.js";
import { CreateUserAdmin } from "../../../domain/init.js";
import { isValidUuid } from '../../validators/ini.js';

export class AdminUserController {

  constructor(
    private readonly adminAuthRepository: AdminUserRepository,
  ){}

  private handleError = (error: any, res: Response) => {
    if(error instanceof CustomError){
      res.status(error.statusCode).json({error: error.message});
      return;
    }
    Logger.error(`ERROR: ${error}`);
    res.status(500).json({error: "Internal server error"});
  }

  createUser = (req: Request, res: Response) => {
    const [error, userEntity] = UserAdminDTO.createUser(req.body);
    if(error) return res.status(400).json({error});

    new CreateUserAdmin(this.adminAuthRepository)
      .execute(userEntity!)
      .then((data: UserEntity) => res.status(201).json(data.toJson()))
      .catch((error) => this.handleError(error, res));
  }


  public getUsers = (req: Request, res: Response) => {
    const {page = 1, limit = 10} = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if(error) return this.handleError(CustomError.badRequest(error), res);

    this.adminAuthRepository.getUsers(paginationDto!.page, paginationDto!.limit)
      .then((results) => res.json({results: results.map(r => r.toJson()), page, limit}))
      .catch(error => this.handleError(res, error));
    }

  public getUserById = (req: Request, res: Response) => {
    const idUsuario = req.params.idUsuario?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idUsuario);
    if(isValidId !== true) return res.status(400).json({error: isValidId});

    this.adminAuthRepository.getUserById(idUsuario)
      .then((reg) => {
        if(typeof reg === "string") return this.handleError(reg, res)
        return res.json(reg.toJson())
      })
      .catch(error => this.handleError(res, error));

    }
  
  public updateUser = (req: Request, res: Response) => {
    console.log("Llegué")
    const idUsuario = req.params.idUsuario?.toString() ?? "";
    const [error, userEntity] = UserAdminDTO.editeUser(req.body, idUsuario);
    if(error) return res.status(400).json({error});
    
    this.adminAuthRepository.updateUser(userEntity!)
      .then(() => res.json({status: "success"}))
      .catch(error => this.handleError(res, error));

    }
  
  public deleteUser = (req: Request, res: Response) => {
    const idUsuario: string = req.params.idUsuario?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idUsuario);
    if(isValidId !== true) return res.status(400).json({error: isValidId});

    this.adminAuthRepository.deleteUser(idUsuario)
      .then(() => res.json({status: "success"}))
      .catch(error  => this.handleError(res, error));
  }

  public restoreUser = (req: Request, res: Response) => {
    const idUsuario: string = req.params.idUsuario?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idUsuario);
    if(isValidId !== true) return res.status(400).json({error: isValidId});

    this.adminAuthRepository.restoreUser(idUsuario)
      .then(() => res.json({status: "success"}))
      .catch(error  => this.handleError(res, error));
  }

}