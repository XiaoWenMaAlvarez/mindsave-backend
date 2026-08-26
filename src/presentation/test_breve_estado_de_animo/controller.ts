import { type NextFunction, type Request, type Response } from 'express';
import { CreateTestBreveEstadoDeAnimoUseCase, TestBreveEstadoDeAnimoRepository, 
  GetTestBreveEstadoDeAnimoByYearUseCase, EliminarTestBreveEstadoDeAnimoDeHoyUseCase, EditarTestBreveEstadoDeAnimoDeHoyUseCase, 
  GetTodayTestBreveEstadoDeAnimoUseCase } from '../../domain/init.js';
import { TestBreveEstadoDeAnimoDTO } from '../validators/dtos/init.js';

export class TestBreveEstadoDeAnimoController {

  constructor(
    private readonly testBreveEstadoDeAnimoRepository: TestBreveEstadoDeAnimoRepository
  ) {}

  private isFechaValida(year: number, month: number, day: number): boolean {
    if(isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if(month < 1 || month > 12 || day < 1 || day > 31) return false;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
  }

  public saveTestBreveEstadoDeAnimo = (req: Request, res: Response, next: NextFunction) => {
    const [error, testBreve] = TestBreveEstadoDeAnimoDTO.create({...req.body, idUsuario: req.user!.id});
    if(error) return res.status(400).json({error});
    const createTestUseCase = new CreateTestBreveEstadoDeAnimoUseCase(this.testBreveEstadoDeAnimoRepository);
    createTestUseCase.execute(testBreve!)
      .then(() => res.status(201).json({status: "success"}))
      .catch(next);
  }

  public getTestBreveEstadoDeAnimoByYear = (req: Request, res: Response, next: NextFunction) => {  
    const year: number = parseInt(req.params.year?.toString() ?? "");
    if(isNaN(year)) return res.status(400).json({error: "Año inválido"});

    const getTestBreveEstadoDeAnimoByYearUseCase = new GetTestBreveEstadoDeAnimoByYearUseCase(this.testBreveEstadoDeAnimoRepository);
    getTestBreveEstadoDeAnimoByYearUseCase.execute(year, req.user!.id)
      .then((results) => res.status(200).json(results))
      .catch(next);
  }

  public editarTestBreveEstadoDeAnimoDeHoy = (req: Request, res: Response, next: NextFunction) => {  
    const [error, testBreve] = TestBreveEstadoDeAnimoDTO.edit({...req.body, idUsuario: req.user!.id});
    if(error) return res.status(400).json({error});
    const editarTestBreveEstadoDeAnimoDeHoyUseCase = new EditarTestBreveEstadoDeAnimoDeHoyUseCase(this.testBreveEstadoDeAnimoRepository);
    editarTestBreveEstadoDeAnimoDeHoyUseCase.execute(testBreve!)
      .then(() => res.status(200).json({status: "success"}))
      .catch(next);
  }

  public eliminarTestBreveEstadoDeAnimoDeHoy = (req: Request, res: Response, next: NextFunction) => {
    const year: number = parseInt(req.params.year?.toString() ?? "");
    const month: number = parseInt(req.params.month?.toString() ?? "");
    const day: number = parseInt(req.params.day?.toString() ?? "");
    if(!this.isFechaValida(year, month, day)) return res.status(400).json({error: "Fecha inválida"});
    
    const eliminarTestBreveEstadoDeAnimoDeHoyUseCase = new EliminarTestBreveEstadoDeAnimoDeHoyUseCase(this.testBreveEstadoDeAnimoRepository);
    eliminarTestBreveEstadoDeAnimoDeHoyUseCase.execute(year, month, day, req.user!.id)
      .then(() => res.status(200).json({status: "success"}))
      .catch(next);
  }

  public getTodayTestBreveEstadoDeAnimo = (req: Request, res: Response, next: NextFunction) => { 
    const year: number = parseInt(req.params.year?.toString() ?? "");
    const month: number = parseInt(req.params.month?.toString() ?? "");
    const day: number = parseInt(req.params.day?.toString() ?? "");
    if(!this.isFechaValida(year, month, day)) return res.status(400).json({error: "Fecha inválida"});
    
    const getTodayTestBreveEstadoDeAnimoUseCase = new GetTodayTestBreveEstadoDeAnimoUseCase(this.testBreveEstadoDeAnimoRepository);
    getTodayTestBreveEstadoDeAnimoUseCase.execute(year, month, day, req.user!.id)
      .then((result) => res.status(200).json(result))
      .catch(next);
  }

}