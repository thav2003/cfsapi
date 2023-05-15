import {  Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@src/types';
import { ITinderService } from '@services/Interface';



@injectable()
export class TinderController {

  @inject(TYPES.TinderService) private tinderService: ITinderService; 

  public async findMatches(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    const { currentUser, allUsers, limit, gender } = req.body;
    const matches = await this.tinderService.findMatches(currentUser, allUsers, limit, gender);
    res.json(matches);
  }


}