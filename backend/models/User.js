export default class User {
  constructor(
    id,
    username,
    email,
    passwordHashed,
    user_type,
    is_active,
    is_local,
    phone,
    updated_at,
    created_at
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHashed = passwordHashed;
    this.user_type = user_type;
    this.is_active = is_active;
    this.is_local = is_local;
    this.phone = phone;
    this.updated_at = updated_at;
    this.created_at = created_at;
  }
}