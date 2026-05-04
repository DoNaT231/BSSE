import { API_BASE_URL } from "../../../config";
export async function sendContactMessage(payload) {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    const data = await response.json().catch(() => null);
  
    if (!response.ok) {
      throw new Error(data?.message || "Nem sikerült elküldeni az üzenetet.");
    }
  
    return data;
  }