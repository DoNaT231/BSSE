// +------------------------------------------------------------------+
// |                           EventSlot.js                           |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * EventSlot.js - Sequelize modell definicio
 * =====================================================================
 *
 * Funkcio:
 * - Adatstruktura es relaciok deklaralasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

export default class EventSlot {
  constructor(
    id,
    event_id,
    court_id,
    start_time,
    end_time,
    all_day,
    slot_status,
    created_at,
    updated_at
  ) {
    this.id = id;
    this.event_id = event_id;
    this.court_id = court_id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.all_day = all_day;
    this.slot_status = slot_status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}