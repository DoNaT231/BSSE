import SibApiV3Sdk from "sib-api-v3-sdk";

let cachedApi = null;

export function getBrevoTransactionalApi() {
  if (cachedApi) return cachedApi;

  if (!process.env.BREVO_API_KEY) {
    throw new Error("Missing BREVO_API_KEY env var");
  }

  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

  cachedApi = new SibApiV3Sdk.TransactionalEmailsApi();
  return cachedApi;
}