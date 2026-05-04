// +------------------------------------------------------------------+
// |                            service.js                            |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * service.js - Uzleti logika szerviz reteg
 * =====================================================================
 *
 * Funkcio:
 * - Domain szabalyok vegrehajtasa es repository hivasok koordinalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import { getBrevoTransactionalApi } from "./brevoClient.js";
import { EMAIL_TEMPLATES } from "./templates.js";
import { formatHungarianDate } from "../../utils/date.js";

const DEFAULT_SENDER = {
  email: "almadistrandroplabda@gmail.com",
  name: "BSSE",
};

function safeName(name) {
  return (name && String(name).trim()) || "Pályafoglaló";
}

async function sendTemplateEmail({
  toEmail,
  toName,
  templateId,
  subject,
  params = {},
  sender = DEFAULT_SENDER,
  replyTo,
}) {
  if (!toEmail) throw new Error("toEmail is required");

  const api = getBrevoTransactionalApi();

  const payload = {
    to: [{ email: toEmail, name: safeName(toName) }],
    sender,
    subject,
    templateId,
    params: {
      year: new Date().getFullYear(),
      name: safeName(toName),
      ...params,
    },
  };

  if (replyTo?.email) {
    payload.replyTo = {
      email: replyTo.email,
      name: safeName(replyTo.name),
    };
  }

  return api.sendTransacEmail(payload);
}

/**
 * 1) Foglalás visszaigazolás
 * params.bookings: a te formatBookings() által visszaadott string (sortörésekkel)
 */
export async function sendReservationSyncConfirmationEmail({
  toEmail,
  toName,
  bookingsText,
}) {
  const t = EMAIL_TEMPLATES.RESERVATION_CONFIRMATION;

  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    params: {
      bookings: bookingsText || "Nincs foglalás.",
    },
  });
}

/**
 * 2) Versenyjelentkezés siker
 * params példák: tournamentName, category, teamName, etc.
 */
export async function sendTournamentRegistrationSuccessEmail({
  toEmail,
  toName,
  tournamentName,
  phoneNumber,
  registrationDate,

  tournamentDate,
  entryFee,
}) {
  const t = EMAIL_TEMPLATES.TOURNAMENT_REG_SUCCESS;
  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    params: {
      tournamentName: tournamentName || "",
      phoneNumber: phoneNumber || "",
      registrationDate: formatHungarianDate(registrationDate) || "",

      tournamentDate: formatHungarianDate(tournamentDate) || "",
      entryFee: entryFee || "",
    },
  });
}

export async function sendTournamentRegistrationWaitlistEmail({
  toEmail,
  toName,
  tournamentName,
  phoneNumber,
  registrationDate,
  tournamentDate,
  entryFee,
}) {
  const t = EMAIL_TEMPLATES.TOURNAMENT_REG_WAITLIST;
  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    params: {
      tournamentName: tournamentName || "",
      phoneNumber: phoneNumber || "",
      registrationDate: formatHungarianDate(registrationDate) || "",
      tournamentDate: formatHungarianDate(tournamentDate) || "",
      entryFee: entryFee || "",
    },
  });
}

/**
 * 3) Foglalás lemondva
 */
export async function sendReservationCancelledEmail({
  toEmail,
  toName,
  bookingsText,
  reason, // opcionális
}) {
  const t = EMAIL_TEMPLATES.RESERVATION_CANCELLED;

  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    params: {
      bookings: bookingsText || "—",
      reason: reason || "",
    },
  });
}

/**
 * 4) Admin ütközés / értesítés
 * Ezt küldheted admin mailboxra (toEmail admin@...)
 */
export async function sendAdminConflictNotificationEmail({
  toEmail,
  toName,
  conflictText, // előre formázott string
}) {
  const t = EMAIL_TEMPLATES.ADMIN_CONFLICT;

  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    params: {
      conflict: conflictText || "—",
    },
  });
}

export async function sendContactMessageEmail({
  toEmail,
  toName,
  name,
  email,
  phone,
  message,
}) {
  const t = EMAIL_TEMPLATES.CONTACT_MESSAGE;

  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    replyTo: {
      email,
      name,
    },
    params: {
      contactName: name || "",
      contactEmail: email || "",
      contactPhone: phone || "Nincs megadva",
      contactMessage: message || "",
      receivedAt: new Date().toLocaleString("hu-HU", {
        timeZone: "Europe/Budapest",
      }),
    },
  });
}

/**
 * Optional: exportáljuk az alap küldőt is ha kell
 */
export { sendTemplateEmail };