import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../AuthContext";

export default function CourtsList(){
      const [courts, setCourts] = useState([]);
      const [newCourtName, setNewCourtName] = useState('');
      const [newCourtNumber, setNewCourtNumber] = useState('')
      const token = localStorage.getItem("token")
      // Pályák lekérése (GET)
const fetchCourts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Hiba a pályák lekérésekor');
    const data = await response.json();
    setCourts(data);
  } catch (err) {
    console.error(err);
  }
};

// Új pálya létrehozása (POST)
const handleAddCourt = async () => {
  if (!newCourtName.trim()) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/courts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newCourtName,
        number: newCourtNumber
         // vagy akár dinamikusan megadható
      }),
    });

    if (!response.ok) throw new Error('Nem sikerült létrehozni a pályát');
    setNewCourtName('');
    fetchCourts();
  } catch (err) {
    console.error(err);
  }
};

// Pálya törlése (DELETE)
const handleDeleteCourt = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Törlés sikertelen');
    fetchCourts();
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    fetchCourts();
        console.log("courts: "+courts)
  }, []);
    return(
        <div>
            <h3>🏐 Pályák kezelése</h3>

            <div className="add-court">
              <input
                type="text"
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                placeholder="Új pálya neve"
              />
              <input
                type="text"
                value={newCourtNumber}
                onChange={(e) => setNewCourtNumber(e.target.value)}
                placeholder="Új pálya száma"
              />
              <button onClick={handleAddCourt}>➕ Hozzáadás</button>
            </div>

            <ul className="court-list">
              {courts.map((court) => (
                <li key={court.id}>
                  {court.name} ({court.number})
                  <button onClick={() => handleDeleteCourt(court.id)}>🗑️ Törlés</button>
                </li>
              ))}
            </ul>
        </div>
    )
}