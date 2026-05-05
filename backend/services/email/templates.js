// +------------------------------------------------------------------+
// |                           templates.js                           |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * templates.js - Uzleti logika szerviz reteg
 * =====================================================================
 *
 * Funkcio:
 * - Domain szabalyok vegrehajtasa es repository hivasok koordinalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

export const EMAIL_TEMPLATES = {
  RESERVATION_CONFIRMATION: {
    id: 2,
    subject: "A foglalásodat mentettük!",
  },
  TOURNAMENT_REG_SUCCESS: {
    id: 3, 
    subject: "Versenyjelentkezés sikeres",
  },
  TOURNAMENT_REG_WAITLIST: {
    id: 5, 
    subject: "Versenyjelentkezés várólistán",
  },
  RESERVATION_CANCELLED: {
    id: 4, // majd Brevo-ban létrehozod
    subject: "Foglalás lemondva",
  },
  CONTACT_MESSAGE: {
    id: 6, // ezt majd írd át arra az ID-ra, amit a Brevo template kap
    subject: "Új üzenet érkezett a Smash weboldalról",
  },
    TOURNAMENT_STATUS_CONFIRMED: {
    id: 7, 
    subject: "Versenyjelentkezésed aktiválva",
  },
    TOURNAMENT_STATUS_WAITLISTED: {
    id: 8, 
    subject: "Versenyjelentkezésed várólistára került",
  },
};