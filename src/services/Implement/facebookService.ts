import axios from 'axios';
import { User } from '@models';

const API_VERSION = 'v13.0';

export class FacebookService {
  async getUserInfo(accessToken: string): Promise<User> {
    const response = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/me?fields=id,name,email,picture&access_token=${accessToken}`,
    );

    const userData = response.data;
    const user = {
      facebookId: userData.id,
      name: userData.name,
      email: userData.email,
    } as User;

    return user;
  }
}