import type { PaginationDto } from "../../../presentation/validators/dtos/shared/pagination.dto.js";
import type { RegistroEstadoAnimo, RegistroEstadoAnimoRepository } from "../../init.js";

export interface GetRegistroEstadoDeAnimoPendientesUseCaseInterface {
  execute(userId: string, paginationDto: PaginationDto): Promise<RegistroEstadoAnimo[]>;
}

export class GetRegistroEstadoDeAnimoPendientesUseCase implements GetRegistroEstadoDeAnimoPendientesUseCaseInterface {
  constructor(
    private readonly repository: RegistroEstadoAnimoRepository
  ){}

  execute(userId: string, paginationDto: PaginationDto) {
    return this.repository.getRegistroEstadoDeAnimoPendientes(userId, paginationDto.page, paginationDto.limit);
  }
}