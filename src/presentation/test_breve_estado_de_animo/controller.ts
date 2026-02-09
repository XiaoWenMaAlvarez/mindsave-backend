import { type Request, type Response } from 'express';
import { Logger } from '../../plugins/logger.plugin.js';
import { CreateTestBreveEstadoDeAnimoUseCase, CustomError, TestBreveEstadoDeAnimoRepository, GetTestBreveEstadoDeAnimoByYearUseCase, EliminarTestBreveEstadoDeAnimoDeHoyUseCase, EditarTestBreveEstadoDeAnimoDeHoyUseCase, GetTodayTestBreveEstadoDeAnimoUseCase, TestBreveEstadoDeAnimo } from '../../domain/init.js';
import { TestBreveEstadoDeAnimoDTO } from '../validators/dtos/init.js';

export class TestBreveEstadoDeAnimoController {

  constructor(
    private readonly testBreveEstadoDeAnimoRepository: TestBreveEstadoDeAnimoRepository
  ) {}

  private handleError = (res: Response, error: any) => {
    if(error instanceof CustomError) {
      res.status(error.statusCode).json({error: error.message});
      return;
    } 
    Logger.error(`${error}`);
    res.status(500).json({error: "Internal Server Error"});
  }

  private isFechaValida(year: number, month: number, day: number): boolean {
    if(isNaN(year) || isNaN(month) || isNaN(day)) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
  }

  public saveTestBreveEstadoDeAnimo = (req: Request, res: Response) => {
    const [error, testBreve] = TestBreveEstadoDeAnimoDTO.create(req.body);
    if(error) return res.status(400).json({error});
    const createTestUseCase = new CreateTestBreveEstadoDeAnimoUseCase(this.testBreveEstadoDeAnimoRepository);
    createTestUseCase.execute(testBreve!)
      .then(() => res.status(201).json({status: "success"}))
      .catch(error => this.handleError(res, error));
  }

  public getTestBreveEstadoDeAnimoByYear = (req: Request, res: Response) => {  
    const year: number = parseInt(req.params.year?.toString() ?? "");
    if(isNaN(year)) return res.status(400).json({error: "Año inválido"});

    const getTestBreveEstadoDeAnimoByYearUseCase = new GetTestBreveEstadoDeAnimoByYearUseCase(this.testBreveEstadoDeAnimoRepository);
    getTestBreveEstadoDeAnimoByYearUseCase.execute(year)
      .then((results) => res.status(200).json(results))
      .catch(error => this.handleError(res, error));
  }

  public editarTestBreveEstadoDeAnimoDeHoy = (req: Request, res: Response) => {  
    const [error, testBreve] = TestBreveEstadoDeAnimoDTO.edit(req.body);
    if(error) return res.status(400).json({error});
    const editarTestBreveEstadoDeAnimoDeHoyUseCase = new EditarTestBreveEstadoDeAnimoDeHoyUseCase(this.testBreveEstadoDeAnimoRepository);
    editarTestBreveEstadoDeAnimoDeHoyUseCase.execute(testBreve!)
      .then(() => res.status(200).json({status: "success"}))
      .catch(error => this.handleError(res, error));
  }

  public eliminarTestBreveEstadoDeAnimoDeHoy = (req: Request, res: Response) => {
    const year: number = parseInt(req.params.year?.toString() ?? "");
    const month: number = parseInt(req.params.month?.toString() ?? "");
    const day: number = parseInt(req.params.day?.toString() ?? "");
    if(!this.isFechaValida(year, month, day)) return res.status(400).json({error: "Fecha inválida"});
    
    const eliminarTestBreveEstadoDeAnimoDeHoyUseCase = new EliminarTestBreveEstadoDeAnimoDeHoyUseCase(this.testBreveEstadoDeAnimoRepository);
    eliminarTestBreveEstadoDeAnimoDeHoyUseCase.execute(year, month, day)
      .then(() => res.status(200).json({status: "success"}))
      .catch(error => this.handleError(res, error));
  }

  public getTodayTestBreveEstadoDeAnimo = (req: Request, res: Response) => { 
    const year: number = parseInt(req.params.year?.toString() ?? "");
    const month: number = parseInt(req.params.month?.toString() ?? "");
    const day: number = parseInt(req.params.day?.toString() ?? "");
    if(!this.isFechaValida(year, month, day)) return res.status(400).json({error: "Fecha inválida"});
    
    const getTodayTestBreveEstadoDeAnimoUseCase = new GetTodayTestBreveEstadoDeAnimoUseCase(this.testBreveEstadoDeAnimoRepository);
    getTodayTestBreveEstadoDeAnimoUseCase.execute(year, month, day)
      .then((result) => res.status(200).json(result))
      .catch(error => this.handleError(res, error));
  }

}