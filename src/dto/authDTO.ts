

export interface GetUserLoginDTO {
  email: string;
  password: string;
}
export interface EmailRegistrationDTO {
  name: string;
  email: string;
  role: 'user';
  password: string;
}

export type RegistrationDTO = EmailRegistrationDTO ;