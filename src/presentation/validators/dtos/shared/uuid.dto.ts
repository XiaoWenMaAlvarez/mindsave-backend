import { isValidUuid } from "../../schemas/init.js";

export class UuidDto {

  static verify(id: unknown): string | null {
    const result = isValidUuid(id);
    if(typeof result === "string") return result;
    return null;
  }

}
