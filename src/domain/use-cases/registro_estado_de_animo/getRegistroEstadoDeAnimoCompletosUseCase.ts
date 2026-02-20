import type { PaginationDto } from "../../../presentation/validators/dtos/shared/pagination.dto.js";
import type { RegistroEstadoAnimo, RegistroEstadoAnimoRepository } from "../../init.js";

export interface GetRegistroEstadoDeAnimoCompletosUseCaseInterface {
  execute(userId: string, paginationDto: PaginationDto): Promise<RegistroEstadoAnimo[]>;
}

export class GetRegistroEstadoDeAnimoCompletosUseCase implements GetRegistroEstadoDeAnimoCompletosUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  execute(userId: string, paginationDto: PaginationDto) {
    return this.repository.getRegistroEstadoDeAnimoCompletos(userId, paginationDto.page, paginationDto.limit);
  }
}