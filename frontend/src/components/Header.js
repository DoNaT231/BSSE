import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Modal from "./Modal";
import LoginRegist from "../pages/LoginRegist/LoginRegist";
import AddPasswordForm from "../pages/LoginRegist/SettingPassword";

/**
 * Header komponens
 * ----------------
 * Fix fejléc navigációval.
 * - Reszponzív (600px breakpoint)
 * - Mobilon hamburger menü
 * - Modalos login / logout / jelszóbeállítás
 * - AuthContext alapján feltételes linkek
 */
function Header() {
  /**
   * Menü nyitottsága
   * - desktop (>600px): mindig nyitva
   * - mobil: toggle-elhető
   */
  const [isOpen, setIsOpen] = useState(window.innerWidth > 600);

  /**
   * Aktív modal típusa:
   * - ""           → nincs modal
   * - "login"      → bejelentkezés
   * - "logout"     → kijelentkezés megerősítés
   * - "setPassword"→ jelszó beállítás
   */
  const [modal, setModal] = useState("");

  const closeModal = () =>{
    setModal("")
  }

  const { loggedIn, username, role, logout } = useAuth();

  /**
   * Menü nyit/zár mobilon
   */
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Kijelentkezés kezelése
   */
  const handleLogOut = () => {
    logout();
    setModal("");
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[200]
        transition-all duration-300
        flex
        justify-center
      `}
    >
      {/* ===================== MODALOK ===================== */}

      {/* KIJELENTKEZÉS MODAL */}
      {modal === "logout" && (
        <Modal>
          <h1 className="mb-4 text-xl font-bold">
            Biztosan kijelentkezel?
          </h1>
          <div className="flex flex-row justify-center gap-4">
            <button
              className="px-4 py-2 font-semibold rounded-lg bg-yellow"
              onClick={handleLogOut}
            >
              Kijelentkezés
            </button>
          </div>
        </Modal>
      )}

      {/* LOGIN MODAL */}
      {modal === "login" && !loggedIn && (
        <Modal closeModal={closeModal}>
          <LoginRegist/>
        </Modal>
      )}

      {/* JELSZÓ BEÁLLÍTÁS MODAL */}
      {modal === "setPassword" && (
        <Modal>
          <AddPasswordForm exit={() => setModal("")} />
          <button
            className="px-4 py-2 mt-4 bg-gray-200 rounded-lg"
            onClick={() => setModal("")}
          >
            Mégse
          </button>
        </Modal>
      )}

      {/* ===================== LOGÓ ===================== */}
      <div
        className="fixed z-30 w-20 h-20 overflow-hidden transition-transform duration-300 rounded-full cursor-pointer top-2 left-[50%-40px] md:left-2 hover:scale-105 md:left-2"
      >
        <img
          src="./images/Képernyőkép 2025-06-11 200633.png"
          alt="BSSE logo"
          className="object-cover w-full h-full"
        />
      </div>

      {/* ===================== FELSŐ FEKETE SÁV ===================== */}
      <div
        className="
          fixed top-0 left-0 right-0
          h-[54px]
          bg-blackSoft text-white
          flex items-center
          z-10
        "
      >
        <h1 className="pl-[120px] text-lg font-semibold hidden md:block">
          BALATONI STRANDSPORT EGYESÜLET
        </h1>
      </div>

      {/* ===================== NAVBAR ===================== */}
      <div className={`            
        flex
        w-full
        bg-lightBlue
        shadow-lg
        items-center md:items-end
        transition
        h-100 md:h-24
        md:translate-y-0
        md:justify-end justify-center
        ${isOpen ? "translate-y-0" : "-translate-y-52"}`}>
        <nav
          className={`
            w-fit
            items-center
            pt-28 md:pt-0
            flex flex-col md:flex-row
            gap-8 md:gap-11
            text-white
            mb-16 md:mr-3 md:mb-2
            text-center md:text-end`}  
        >
          {/* Navigációs linkek */}
          <Link className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all" to="/">
            Kezdőlap
          </Link>

          <Link className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all" to="/palyafoglalas">
            Foglalás
          </Link>

          <Link className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all" to="/versenyek">
            Versenyek
          </Link>

          {!loggedIn && (
            <span
              className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              onClick={() => setModal("login")}
            >
              Bejelentkezés
            </span>
          )}

          {role === "admin" && (
            <Link className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all" to="/admin">
              Admin felület
            </Link>
          )}

          {loggedIn && (
            <span
              className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              onClick={() => setModal("logout")}
            >
              Kijelentkezés
            </span>
          )}
        </nav>
      </div>

      {/* ===================== HAMBURGER IKON (MOBIL) ===================== */}
      <div
        className="fixed z-30 w-10 h-10 cursor-pointer md:hidden top-2 right-2"
        onClick={toggleMenu}
      >
        <img
          src="./5402398_list_menu_options_settings_checklist_icon.png"
          alt="menu"
          className="w-full h-full md:"
        />
      </div>
    </header>
  );
}

export default Header;
