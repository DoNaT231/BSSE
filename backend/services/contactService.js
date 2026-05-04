import { sendContactMessageEmail } from "./email/service.js";

const CONTACT_NOTIFICATION_RECEIVER = {
  email: process.env.CONTACT_NOTIFICATION_EMAIL || "almadistrandroplabda@gmail.com",
  name: process.env.CONTACT_NOTIFICATION_NAME || "Smash Admin",
};

function normalizeString(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactPayload(body) {
  const name = normalizeString(body.name);
  const email = normalizeString(body.email).toLowerCase();
  const phone = normalizeString(body.phone);
  const message = normalizeString(body.message);
  const accepted = Boolean(body.accepted);

  if (!name) {
    return { isValid: false, message: "A név megadása kötelező." };
  }

  if (name.length < 2) {
    return { isValid: false, message: "A név túl rövid." };
  }

  if (!email) {
    return { isValid: false, message: "Az email cím megadása kötelező." };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, message: "Érvénytelen email cím." };
  }

  if (!message) {
    return { isValid: false, message: "Az üzenet megadása kötelező." };
  }

  if (message.length < 5) {
    return { isValid: false, message: "Az üzenet túl rövid." };
  }

  if (!accepted) {
    return {
      isValid: false,
      message: "Az adatkezelési feltételek elfogadása kötelező.",
    };
  }

  return {
    isValid: true,
    data: {
      name,
      email,
      phone,
      message,
      accepted,
    },
  };
}

export async function handleContactMessage(body) {
  const validation = validateContactPayload(body);

  if (!validation.isValid) {
    const error = new Error(validation.message);
    error.statusCode = 400;
    throw error;
  }

  const { name, email, phone, message } = validation.data;

  await sendContactMessageEmail({
    toEmail: CONTACT_NOTIFICATION_RECEIVER.email,
    toName: CONTACT_NOTIFICATION_RECEIVER.name,
    name,
    email,
    phone,
    message,
  });

  return {
    success: true,
    message: "Az üzenet sikeresen elküldve.",
  };
}