export async function debugApiRequest(url, options = {}) {
  console.group("🌐 API REQUEST");

  console.log("URL:", url);
  console.log("METHOD:", options.method || "GET");
  console.log("HEADERS:", options.headers || {});
  console.log("BODY:", options.body || null);

  try {
    const response = await fetch(url, options);

    console.log("STATUS:", response.status);
    console.log("STATUS TEXT:", response.statusText);

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log("RESPONSE HEADERS:", headers);

    const rawText = await response.text();

    console.log("RAW RESPONSE:", rawText);

    let parsed;

    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch (err) {
      console.warn("⚠️ JSON parse error:", err);
      parsed = rawText;
    }

    console.log("PARSED RESPONSE:", parsed);

    console.groupEnd();

    return {
      ok: response.ok,
      status: response.status,
      data: parsed,
    };

  } catch (error) {
    console.error("🚨 NETWORK ERROR:", error);
    console.groupEnd();
    throw error;
  }
}