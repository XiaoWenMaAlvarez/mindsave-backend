export interface userOptions {
  id: string;
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
  role: string;
}

export class UserEntity {

  public id: string;
  public email: string;
  public name: string;
  public password: string;
  public emailVerified: boolean;
  public role: string;

  constructor(options: userOptions){
    const {id, email, name, password, emailVerified, role} = options;
    this.id = id;
    this.email = email;
    this.name = name;
    this.password = password;
    this.emailVerified = emailVerified;
    this.role = role;
  }

  static fromJson(object: {[key: string]: any}): UserEntity {
    const {id, email, name, password, emailVerified, role} = object; 
    const options = {id, email, name, password, emailVerified, role};
    return new UserEntity(options);
  }

  toJson() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      password: this.password,
      emailVerified: this.emailVerified,
      role: this.role
    }
  }

}
