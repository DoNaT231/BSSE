import { API_BASE_URL } from "../../../config";

export default async function fetchCourts(){
    try {
      const url = `${API_BASE_URL}/api/courts`;

      const response = await fetch(`${API_BASE_URL}/api/courts`);
      if (!response.ok) throw new Error("Hiba a pályák lekérésekor");

      const data = await response.json();
      return data;

    } catch (err) {
      console.error(err);
    }
  };