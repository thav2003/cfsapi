import { User } from '@models';


export interface ITinderService {
  findMatches(currentUser: User, allUsers: User[], limit: number, gender: 'male' | 'female' | undefined): Promise<User[]> 
}