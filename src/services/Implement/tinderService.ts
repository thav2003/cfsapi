import { User } from '@models';
import { ITinderAlgorithm } from '@src/algorithm/KnnAlgorithm';
import logger from '@src/logger';
import { TYPES } from '@src/types';
import { inject } from 'inversify';



export class TinderService {
  private tinderAlgorithm: ITinderAlgorithm;
  
  constructor(@inject(TYPES.TinderAlgorithm) tinderAlgorithm:ITinderAlgorithm) {
    this.tinderAlgorithm = tinderAlgorithm;
    logger.info('Tinder service initialized');
  }
  
  public async findMatches(currentUser: User, allUsers: User[], limit: number, gender: 'male' | 'female' | undefined): Promise<User[]> {
    return this.tinderAlgorithm.findMatches(currentUser, allUsers, limit, gender);
  }
}