import { type NextFunction, type Request, type Response } from 'express';
import { RegistroEstadoDeAnimoDTO } from '../validators/dtos/init.js';
import { CreateRegistroEstadoDeAnimoUseCase, CustomError, RegistroEstadoAnimoRepository,
   GetRegistroEstadoDeAnimoPendientesUseCase, GetRegistroEstadoDeAnimoCompletosUseCase,
  EditarRegistroEstadoDeAnimoUseCase, EliminarRegistroEstadoDeAnimoUseCase, GetRegistroEstadoDeAnimoByIdUseCase } from '../../domain/init.js';
import { PaginationDto } from '../validators/dtos/shared/pagination.dto.js';
import { isValidUuid } from '../validators/ini.js';

export class RegistroEstadoDeAnimoController {

  constructor(
    private readonly registroEstadoAnimoRepository: RegistroEstadoAnimoRepository
  ) {}

  public getRegistroEstadoDeAnimoPendientes = (req: Request, res: Response, next: NextFunction) => {
    const {page = 1, limit = 10} = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if(error) return next(CustomError.badRequest(error));

    const getRegistroEstadoDeAnimo = new GetRegistroEstadoDeAnimoPendientesUseCase(this.registroEstadoAnimoRepository);
      getRegistroEstadoDeAnimo.execute(req.user!.id, paginationDto!)
        .then((results) => res.json({results: results.map(r => r.toJson()), page, limit}))
        .catch(next);
  }

  public getRegistroEstadoDeAnimoCompletos = (req: Request, res: Response, next: NextFunction) => {
    const {page = 1, limit = 10} = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if(error) return next(CustomError.badRequest(error));

    const getRegistroEstadoDeAnimo = new GetRegistroEstadoDeAnimoCompletosUseCase(this.registroEstadoAnimoRepository);
      getRegistroEstadoDeAnimo.execute(req.user!.id, paginationDto!)
        .then((results) => res.json({results: results.map(r => r.toJson()), page, limit}))
        .catch(next);
  }

  public saveRegistroEstadoDeAnimo = (req: Request, res: Response, next: NextFunction) => {
    const [error, registroEstadoAnimo] = RegistroEstadoDeAnimoDTO.create({...req.body, idUsuario: req.user!.id});
    if(error) return res.status(400).json({error});
    const createTestUseCase = new CreateRegistroEstadoDeAnimoUseCase(this.registroEstadoAnimoRepository);
    createTestUseCase.execute(registroEstadoAnimo!)
      .then((id: string) => res.status(201).json({status: "success", id: id}))
      .catch(next);
  }

  public editarRegistroEstadoDeAnimo = (req: Request, res: Response, next: NextFunction) => {
    const [error, registroEstadoAnimo] = RegistroEstadoDeAnimoDTO.edit({...req.body, idUsuario: req.user!.id});
    if(error) return res.status(400).json({error});
    const isValidId: boolean | string = isValidUuid(req.body.id ?? "");
    if(isValidId !== true) return res.status(400).json({error: isValidId});
    const editarRegistroUseCase = new EditarRegistroEstadoDeAnimoUseCase(this.registroEstadoAnimoRepository);
    editarRegistroUseCase.execute(registroEstadoAnimo!)
      .then(() => res.json({status: "success"}))
      .catch(next);
  }

  public eliminarRegistroEstadoDeAnimo = (req: Request, res: Response, next: NextFunction) => {
    const idRegistro: string = req.params.idRegistro?.toString() ?? "";
    if(idRegistro === "") return res.status(400).json({error: "Id de registro inválido"});
    const eliminarRegistroUseCase = new EliminarRegistroEstadoDeAnimoUseCase(this.registroEstadoAnimoRepository);
    eliminarRegistroUseCase.execute(idRegistro, req.user!.id)
      .then(() => res.json({status: "success"}))
      .catch(next);
  }

  public getRegistroEstadoDeAnimoById = (req: Request, res: Response, next: NextFunction) => {
    const idRegistro = req.params.idRegistro?.toString() ?? "";
    const isValidId: boolean | string = isValidUuid(idRegistro);
    if(isValidId !== true) return res.status(400).json({error: isValidId});
    const getRegistroByIdUseCase = new GetRegistroEstadoDeAnimoByIdUseCase(this.registroEstadoAnimoRepository);
    getRegistroByIdUseCase.execute(idRegistro, req.user!.id)
      .then((reg) => {
        if (!reg) return next(CustomError.notFound("Registro no encontrado"));
        return res.json(reg.toJson());
      })
      .catch(next);
  }

}
