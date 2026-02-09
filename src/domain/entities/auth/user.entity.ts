export interface userOptions {
  id: string;
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
}

export class UserEntity {

  public id: string;
  public email: string;
  public name: string;
  public password: string;
  public emailVerified: boolean;

  constructor(options: userOptions){
    const {id, email, name, password, emailVerified} = options;
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.emailVerified = emailVerified;
  }

  static fromJson(object: {[key: string]: any}): UserEntity {
    const {id, email, name, password, emailVerified} = object; 
    const options = {id, email, name, password, emailVerified};
    return new UserEntity(options);
  }

  toJson() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      emailVerified: this.emailVerified
    }
  }

}
