/**
 * Fields you want to order by. For mongodb it is a key-value pair.
 * Key is the name of the field and Value is 1 (ascending) or -1 (descending).
 * Example: { username: 1 } (Sort result by username in ascending order)
 */
export interface Sort {
  [key: string]: 1 | -1;
}