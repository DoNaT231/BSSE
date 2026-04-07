import React, { useMemo, useState } from "react";
import "./AdminDashboard.css";
import { Link } from "react-router-dom";
import WeeklyCalendar from "../../features/booking/pages/WeeklyCalendar";
import UsersSection from "./users/components/UsersSection";
import CourtsList from "../../features/courts/components/CourtsList";
import TournamentsAdminSection from "../../features/tournament/components/TournamentsAdminSection";

const SECTIONS = {
  DASHBOARD: "dashboard",
  USERS: "users",
  BOOKINGS: "bookings",
  TOURNAMENTS: "tournaments",
  COURTS: "courts",
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS.DASHBOARD);

  const sectionTitle = useMemo(() => {
    switch (activeSection) {
      case SECTIONS.USERS:
        return "Felhasználók";
      case SECTIONS.BOOKINGS:
        return "Foglalások";
      case SECTIONS.TOURNAMENTS:
        return "Verseny / Versenyjelentkezés";
      case SECTIONS.COURTS:
        return "Pályák";
      default:
        return "Dashboard";
    }
  }, [activeSection]);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Felület</h1>
        <div className="admin-actions">
          <span>👤 Admin</span>
          <Link to="/">
            <button>Vissza</button>
          </Link>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-sidebar">
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(SECTIONS.DASHBOARD);
                }}
              >
                📊 Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(SECTIONS.USERS);
                }}
              >
                👥 Felhasználók
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(SECTIONS.BOOKINGS);
                }}
              >
                📅 Foglalások
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(SECTIONS.TOURNAMENTS);
                }}
              >
                🏆 Verseny / Nevezések
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(SECTIONS.COURTS);
                }}
              >
                🏐 Pályák
              </a>
            </li>
          </ul>
        </nav>

        <main className="flex flex-col admin-content gap-7">
          <h2>{sectionTitle}</h2>

          {activeSection === SECTIONS.DASHBOARD && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#d9e2ec] bg-white p-4">
                <h3 className="text-lg font-semibold text-[#2c3e50]">
                  Gyors navigáció
                </h3>
                <p className="mt-1 text-sm text-[#5c6b7a]">
                  Válaszd ki, melyik admin szekcióval szeretnél dolgozni.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveSection(SECTIONS.USERS)}
                  className="group rounded-xl border border-[#d9e2ec] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
                        Felhasználók
                      </div>
                      <h4 className="mt-1 text-xl font-semibold text-[#2c3e50]">
                        Profilok kezelése
                      </h4>
                    </div>
                    <span className="text-xl">👥</span>
                  </div>
                  <p className="mt-2 text-sm text-[#5c6b7a]">
                    Profilok, jogosultságok, státuszok gyors szerkesztése.
                  </p>
                  <span className="inline-flex items-center mt-4 text-sm font-semibold text-[#2c3e50] group-hover:text-[#1f2d3a]">
                    Megnyitás →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection(SECTIONS.BOOKINGS)}
                  className="group rounded-xl border border-[#d9e2ec] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
                        Foglalások
                      </div>
                      <h4 className="mt-1 text-xl font-semibold text-[#2c3e50]">
                        Heti naptár
                      </h4>
                    </div>
                    <span className="text-xl">📅</span>
                  </div>
                  <p className="mt-2 text-sm text-[#5c6b7a]">
                    Foglalások kezelése, ütközések ellenőrzése és nyomtatás.
                  </p>
                  <span className="inline-flex items-center mt-4 text-sm font-semibold text-[#2c3e50] group-hover:text-[#1f2d3a]">
                    Megnyitás →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection(SECTIONS.TOURNAMENTS)}
                  className="group rounded-xl border border-[#d9e2ec] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
                        Verseny / Nevezések
                      </div>
                      <h4 className="mt-1 text-xl font-semibold text-[#2c3e50]">
                        Versenymenedzsment
                      </h4>
                    </div>
                    <span className="text-xl">🏆</span>
                  </div>
                  <p className="mt-2 text-sm text-[#5c6b7a]">
                    Versenyek, slotok és nevezések adminisztrációja egy helyen.
                  </p>
                  <span className="inline-flex items-center mt-4 text-sm font-semibold text-[#2c3e50] group-hover:text-[#1f2d3a]">
                    Megnyitás →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection(SECTIONS.COURTS)}
                  className="group rounded-xl border border-[#d9e2ec] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
                        Pályák
                      </div>
                      <h4 className="mt-1 text-xl font-semibold text-[#2c3e50]">
                        Pályakezelés
                      </h4>
                    </div>
                    <span className="text-xl">🏐</span>
                  </div>
                  <p className="mt-2 text-sm text-[#5c6b7a]">
                    Új pályák felvétele, meglévők módosítása és törlése.
                  </p>
                  <span className="inline-flex items-center mt-4 text-sm font-semibold text-[#2c3e50] group-hover:text-[#1f2d3a]">
                    Megnyitás →
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeSection === SECTIONS.BOOKINGS && (
            <section className="admin-calendarium-section">
              <WeeklyCalendar />
            </section>
          )}

          {activeSection === SECTIONS.USERS && (
            <section className="admin-user-list">
              <UsersSection />
            </section>
          )}

          {activeSection === SECTIONS.COURTS && (
            <section className="admin-court-list">
              <CourtsList />
            </section>
          )}

          {activeSection === SECTIONS.TOURNAMENTS && (
            <section>
              <TournamentsAdminSection />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
