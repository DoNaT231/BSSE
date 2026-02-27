import { getBrevoTransactionalApi } from "./brevoClient.js";
import { EMAIL_TEMPLATES } from "./templates.js";

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
  detailsText, // opcionális: előre formázott, \n sortörésekkel
}) {
  const t = EMAIL_TEMPLATES.TOURNAMENT_REG_SUCCESS;

  return sendTemplateEmail({
    toEmail,
    toName,
    templateId: t.id,
    subject: t.subject,
    params: {
      tournamentName: tournamentName || "",
      details: detailsText || "",
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

/**
 * Optional: exportáljuk az alap küldőt is ha kell
 */
export { sendTemplateEmail };