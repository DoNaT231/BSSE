import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate, Link} from 'react-router-dom';
import WeeklyTimeGrid from '../../components/WeeklyTimeGrid';
import { useAuth } from '../../AuthContext';
import UserList from './components/UserList';
import { API_BASE_URL } from "../../config";
import CourtsList from './components/CourtsList';
import TournamentsAdminSection from './components/TournamentsAdmin';


const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const {setLoggedIn, setIsAdmin, setUsername} = useAuth()

  const token = localStorage.getItem('token');

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

        <main className="flex flex-col admin-content gap-7">
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
              <WeeklyTimeGrid/>
          </section>
          <section className='admin-user-list'>
               <UserList />
          </section>
          <section className='admin-court-list'>
            <CourtsList />
          </section>
          <section>
            <TournamentsAdminSection/>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
