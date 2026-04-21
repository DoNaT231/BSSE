// +------------------------------------------------------------------+
// |                             Court.js                             |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * Court.js - Sequelize modell definicio
 * =====================================================================
 *
 * Funkcio:
 * - Adatstruktura es relaciok deklaralasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

export default class Court {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}