export interface IUser {
  id: number;
  email: string;
  roles: string;
  username: string;
  pictureUrl: string;
}

export class User implements IUser {
  public id: number;
  public email: string;
  public roles: string;
  public username: string;
  public pictureUrl: string;

  constructor(data: IUser) {
    this.id = data.id
    this.email = data.email
    this.roles = data.roles
    this.username = data.username
    this.pictureUrl = data.pictureUrl
  }

  public static fromJson(json: string) {
    let user = JSON.parse(json)
    return new User(user);
  }
}
