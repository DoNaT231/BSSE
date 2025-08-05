import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate, Link} from 'react-router-dom';
import WeeklyTimeGrid from '../../components/WeeklyTimeGrid';
import { useAuth } from '../../AuthContext';
import UserList from './UserList';
import { API_BASE_URL } from "../../config";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtNumber, setNewCourtNumber] = useState('')
  
  const {setLoggedIn, setIsAdmin, setUsername} = useAuth()

  const token = localStorage.getItem('token');

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
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Felület</h1>
        <div className="admin-actions">
          <span>👤 Admin</span>
          <Link to='/'><button>Vissza</button></Link>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-sidebar">
          <ul>
            <li><a href="#">📊 Dashboard</a></li>
            <li><a href="#">👥 Felhasználók</a></li>
            <li><a href="#">📅 Foglalások</a></li>
            <li><a href="#">⚙️ Beállítások</a></li>
          </ul>
        </nav>

        <main className="admin-content">
          <h2>Üdvözlünk az admin panelen!</h2>
          <div className="admin-cards">
            <div className="admin-card">
              <h3>Felhasználók</h3>
              <p>123 regisztrált felhasználó</p>
            </div>
            <div className="admin-card">
              <h3>Foglalások</h3>
              <p>45 aktív foglalás</p>
            </div>
            <div className="admin-card">
              <h3>Statisztika</h3>
              <p>Napi látogatók: 87</p>
            </div>
          </div>
          <section className='admin-calendarium-section'>
              <h1>Foglalások</h1>
              <WeeklyTimeGrid/>
          </section>
          <section className='admin-user-list'>
            <h1>Felhasználók</h1>
               <UserList />
          </section>
          <section className='admin-court-list'>
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
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
