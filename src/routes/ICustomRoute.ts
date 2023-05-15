

export interface ICustomRoute {
  protectedRoute();
  isRole(role:Array<string>);
}