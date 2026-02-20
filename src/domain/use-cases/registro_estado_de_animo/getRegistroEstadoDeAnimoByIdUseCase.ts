import type { PaginationDto } from "../../../presentation/validators/dtos/shared/pagination.dto.js";
import type { RegistroEstadoAnimo, RegistroEstadoAnimoRepository } from "../../init.js";

export interface GetRegistroEstadoDeAnimoByIdUseCaseInterface {
  execute(regId: string, userId: string): Promise<RegistroEstadoAnimo | null>;
}

export class GetRegistroEstadoDeAnimoByIdUseCase implements GetRegistroEstadoDeAnimoByIdUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  execute(regId: string, userId: string) {
    return this.repository.getRegistroEstadoDeAnimoById(userId, regId);
  }
}