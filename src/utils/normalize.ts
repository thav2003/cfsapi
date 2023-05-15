import { User } from '@models';

/**
 * User without sensitive fields.
 * This is useful when returning data to client.
 */
export type NormalizedUser = Pick<User, '_id' | 'name' | 'email' | 'role'>;