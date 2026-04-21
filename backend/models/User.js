// +------------------------------------------------------------------+
// |                             User.js                              |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * User.js - Sequelize modell definicio
 * =====================================================================
 *
 * Funkcio:
 * - Adatstruktura es relaciok deklaralasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

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
    thursday_points,
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
    this.thursday_points = thursday_points;
    this.updated_at = updated_at;
    this.created_at = created_at;
  }
}