import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../AuthContext";

/**
 * CourtsList (Admin)
 * ------------------------------------------------------------------
 * Cél:
 * - Admin felületen a pályák (courts) listázása, létrehozása és törlése.
 *
 * API hívások (változatlan logika):
 * - GET    /api/courts              -> pályák lekérése
 * - POST   /api/courts              -> új pálya létrehozása (name, number)
 * - DELETE /api/courts/:id          -> pálya törlése
 *
 * Auth:
 * - Bearer token a localStorage-ből (Authorization header)
 *
 * UI:
 * - Kártyás admin szekció
 * - Új pálya létrehozó űrlap (név + szám)
 * - Lista elemenként: név, sorszám, törlés gomb
 * - Hibák: konzolra logolva (meglévő logika szerint)
 * ------------------------------------------------------------------
 */

export default function CourtsList() {
  const [courts, setCourts] = useState([]);
  const [newCourtName, setNewCourtName] = useState("");
  const [newCourtNumber, setNewCourtNumber] = useState("");

  // Megjegyzés: useAuth import bent van, de a jelenlegi logika localStorage tokennel működik.
  // (A kéréseid alapján ezt nem változtatom.)
  const token = localStorage.getItem("token");

  /**
   * fetchCourts()
   * --------------------------------------------------------------
   * Pályák lekérése (GET)
   * - Siker esetén: setCourts(data)
   * - Hiba esetén: console.error
   */
  const fetchCourts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Hiba a pályák lekérésekor");

      const data = await response.json();
      setCourts(data);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * handleAddCourt()
   * --------------------------------------------------------------
   * Új pálya létrehozása (POST)
   * - Validáció: üres név esetén nem küld requestet
   * - Body: { name, number }
   * - Siker esetén: név reset + lista frissítés (fetchCourts)
   * - Hiba esetén: console.error
   */
  const handleAddCourt = async () => {
    if (!newCourtName.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCourtName,
          number: newCourtNumber,
        }),
      });

      if (!response.ok) throw new Error("Nem sikerült létrehozni a pályát");

      setNewCourtName("");
      fetchCourts();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * handleDeleteCourt(id)
   * --------------------------------------------------------------
   * Pálya törlése (DELETE)
   * - Endpoint: /api/courts/:id
   * - Siker esetén: lista frissítés (fetchCourts)
   * - Hiba esetén: console.error
   */
  const handleDeleteCourt = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Törlés sikertelen");

      fetchCourts();
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Mount: kezdeti lista betöltés
   */
  useEffect(() => {
    fetchCourts();
    console.log("courts: " + courts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="w-full p-4 bg-white shadow rounded-2xl md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold md:text-2xl">🏐 Pályák kezelése</h3>
          <p className="mt-1 text-sm text-gray-600">
            Új pálya hozzáadása és meglévők törlése az admin felületen.
          </p>
        </div>

        <button
          onClick={fetchCourts}
          className="px-3 py-2 text-sm border shrink-0 rounded-xl hover:bg-gray-50"
          title="Lista frissítése"
        >
          Frissítés
        </button>
      </div>

      {/* Create card */}
      <div className="p-4 mt-6 border rounded-2xl md:p-5">
        <h4 className="font-semibold">Új pálya létrehozása</h4>

        <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm text-gray-700">Pálya neve *</label>
            <input
              type="text"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              placeholder="Pl. Center Court"
              className="w-full px-3 py-2 mt-1 border rounded-xl"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm text-gray-700">Pálya száma</label>
            <input
              type="text"
              value={newCourtNumber}
              onChange={(e) => setNewCourtNumber(e.target.value)}
              placeholder="Pl. 1"
              className="w-full px-3 py-2 mt-1 border rounded-xl"
            />
          </div>

          <div className="flex items-end gap-2 md:col-span-1">
            <button
              onClick={handleAddCourt}
              className="w-full px-4 py-2 text-sm text-white bg-black rounded-xl hover:opacity-90"
              title="Pálya hozzáadása"
            >
              ➕ Hozzáadás
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Tipp: ha a név üres, a mentés nem indul el (validáció).
        </p>
      </div>

      {/* List */}
      <div className="mt-6">
        <h4 className="font-semibold">Meglévő pályák</h4>

        {courts.length === 0 ? (
          <div className="mt-3 text-sm text-gray-600">Nincs még pálya felvéve.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {courts.map((court) => (
              <div
                key={court.id}
                className="flex flex-col gap-3 p-4 border rounded-2xl md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold truncate">{court.name}</div>
                    <span className="px-2 py-1 text-xs text-gray-700 border rounded-full">
                      #{court.number ?? "—"}
                    </span>
                    <span className="text-xs text-gray-500">ID: {court.id}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleDeleteCourt(court.id)}
                    className="px-3 py-2 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 hover:bg-red-100"
                    title="Pálya törlése"
                  >
                    🗑️ Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
