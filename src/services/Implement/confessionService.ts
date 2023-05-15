import { IRepository } from '@core/repository/IRepository';
import { RawConfessionCreateDTO, RawConfessionGetDTO } from '@dto/rawConfessionDTO';
import { RawConfession } from '@models';
import { IConfessionService } from '@services/Interface';
import logger from '@src/logger';
import { TYPES } from '@src/types';
import paginate, { Pagination } from '@utils/pagination';
import { inject, injectable } from 'inversify';




@injectable()
export class ConfessionService implements IConfessionService {

  private rawConfessionRepositoryProxy: IRepository<RawConfession>;


  constructor(@inject(TYPES.RawConfessionRepositoryProxy) rawConfessionRepositoryProxy: IRepository<RawConfession>) {
    this.rawConfessionRepositoryProxy = rawConfessionRepositoryProxy;

    logger.info('Raw confessions service initialized');

  }

  public async createRaw(data: RawConfessionCreateDTO): Promise<RawConfession> {
    const raw = {
      content:data.content,
      sender:data.sender || null,
      status:'pending',
    } as RawConfession;
    const res = await this.rawConfessionRepositoryProxy.create(raw);
    return res;
  }

  public async getAllRaws(data: RawConfessionGetDTO): Promise<Pagination<RawConfession>> {
    let documents: RawConfession[];
    const filter = data.filter || {};
    documents = await this.rawConfessionRepositoryProxy.find(filter, data.limit, data.pageNumber);
    const totalRecord = await this.rawConfessionRepositoryProxy.countAll(filter);
    return paginate(documents, data.limit, data.pageNumber, totalRecord, data.path);
  }
}