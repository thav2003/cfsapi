/**
 * Fields you want to select. For mongodb it is a key-value pair.
 * Key is the name of the field and Value is 0 (exclude) or 1 (include).
 * Example: { username: 1, email: 1 } (Select only username and email)
 */
export interface Select {
  [key: string]: 1 | 0;
}
  