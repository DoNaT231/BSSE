// +------------------------------------------------------------------+
// |                    TournamentRegistrations.js                    |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * TournamentRegistrations.js - Sequelize modell definicio
 * =====================================================================
 *
 * Funkcio:
 * - Adatstruktura es relaciok deklaralasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

export default class TournamentRegistration {
  constructor(
    id,
    tournament_id,
    user_id,
    team_name,
    players,
    tel_number,
    contact_email,
    registration_status,
    billing_name,
    company_name,
    tax_number,
    address,
    created_at
  ) {
    this.id = id;
    this.tournament_id = tournament_id;
    this.user_id = user_id;
    this.team_name = team_name;
    this.players = players;
    this.tel_number = tel_number;
    this.contact_email = contact_email;
    this.registration_status = registration_status;
    this.billing_name = billing_name;
    this.company_name = company_name;
    this.tax_number = tax_number;
    this.address = address;
    this.created_at = created_at;
  }
}