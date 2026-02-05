import { type Request, type Response } from 'express';
import { CreateTestBreveEstadoDeAnimoDTO } from '../validators/ini.js';
import { Logger } from '../../plugins/logger.plugin.js';
import { CreateTestBreveEstadoDeAnimoUseCase, CustomError, TestBreveEstadoDeAnimoRepository } from '../../domain/init.js';

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

  public saveTestBreveEstadoDeAnimo = (req: Request, res: Response) => {  
    const [error, testBreve] = CreateTestBreveEstadoDeAnimoDTO.create(req.body);
    if(error) return res.status(400).json({error});

    const createTestUseCase = new CreateTestBreveEstadoDeAnimoUseCase(this.testBreveEstadoDeAnimoRepository);
    createTestUseCase.execute(testBreve!)
      .then(() => res.status(201).json({status: "success"}))
      .catch(error => this.handleError(res, error));;
  }

  //TODO IMPLEMENTAR RESTO

}