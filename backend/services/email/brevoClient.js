// +------------------------------------------------------------------+
// |                          brevoClient.js                          |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * brevoClient.js - Uzleti logika szerviz reteg
 * =====================================================================
 *
 * Funkcio:
 * - Domain szabalyok vegrehajtasa es repository hivasok koordinalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import https from "https";
import SibApiV3Sdk from "sib-api-v3-sdk";

let cachedApi = null;
let tlsWarningLogged = false;

function configureTlsAgent(client) {
  const isProduction = process.env.NODE_ENV === "production";
  const explicitlyInsecure =
    process.env.BREVO_TLS_REJECT_UNAUTHORIZED === "false";
  const explicitlySecure =
    process.env.BREVO_TLS_REJECT_UNAUTHORIZED === "true";

  let rejectUnauthorized = true;
  if (explicitlyInsecure) {
    rejectUnauthorized = false;
  } else if (!isProduction && !explicitlySecure) {
    rejectUnauthorized = false;
  }

  if (!rejectUnauthorized && !tlsWarningLogged) {
    console.warn(
      "[brevo] TLS tanúsítvány ellenőrzés kikapcsolva (dev környezet). Production-ben NODE_ENV=production."
    );
    tlsWarningLogged = true;
  }

  client.requestAgent = new https.Agent({ rejectUnauthorized });
}

export function getBrevoTransactionalApi() {
  if (cachedApi) return cachedApi;

  if (!process.env.BREVO_API_KEY) {
    throw new Error("Missing BREVO_API_KEY env var");
  }

  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
  configureTlsAgent(client);

  cachedApi = new SibApiV3Sdk.TransactionalEmailsApi();
  return cachedApi;
}