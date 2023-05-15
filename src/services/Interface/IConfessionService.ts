import { RawConfessionCreateDTO, RawConfessionGetDTO } from '@dto/rawConfessionDTO';
import { RawConfession } from '@models';
import { Pagination } from '@utils/pagination';




export interface IConfessionService {
  getAllRaws(data: RawConfessionGetDTO): Promise<Pagination<RawConfession>>;
  createRaw(data:RawConfessionCreateDTO):Promise<RawConfession>
}