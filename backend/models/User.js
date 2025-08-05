export default class User {
  constructor(id, username, email, passwordHashed, is_admin, created) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHashed = passwordHashed;
    this.is_admin = is_admin;
    this.created = created;
  }
}