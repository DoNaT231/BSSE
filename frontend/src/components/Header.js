import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./Modal";
import LoginModal from "../features/auth/components/LoginModal";
import LogoutModal from "../features/auth/components/LogoutModal";

/**
 * Header komponens
 * ----------------
 * - Reszponzív navigáció
 * - Mobil hamburger menü
 * - Bejelentkezés modal
 * - Kijelentkezés megerősítő modal
 * - AuthContext alapján feltételes linkek
 */
function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.user_type === "ADMIN";

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNavClick = (page) => {
    setIsOpen(false);
    navigate(page);
  };

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-[200]
        flex justify-center
        transition-all duration-300
      "
    >
      {/* ===================== LOGIN MODAL ===================== */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* ===================== KIJELENTKEZÉS MODAL ===================== */}
      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />

      {/* ===================== LOGÓ ===================== */}
      <div className="fixed z-30 w-20 h-20 overflow-hidden transition-transform duration-300 rounded-full cursor-pointer top-2 left-[calc(50%-40px)] md:left-2 hover:scale-105">
        <img
          src="./images/Képernyőkép 2025-06-11 200633.png"
          alt="BSSE logo"
          className="object-cover w-full h-full"
          onClick={() => handleNavClick("/")}
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
      <div
        className={`
          flex w-full
          bg-lightBlue shadow-lg
          items-center md:items-end
          transition
          h-100 md:h-24
          md:translate-y-0
          md:justify-end justify-center
          ${isOpen ? "translate-y-0" : "-translate-y-[calc(100%-108px)]"}
        `}
      >
        <nav
          className="flex flex-col items-center gap-8 mb-16 text-center text-white w-fit md:flex-row md:gap-11 pt-28 md:pt-0 md:mr-3 md:mb-2 md:text-end"
        >
          <p
            className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
            onClick={() => handleNavClick("/")}
          >
            Kezdőlap
          </p>

          <p
            className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
            onClick={() => handleNavClick("/palyafoglalas")}
          >
            Foglalás
          </p>

          <p
            className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
            onClick={() => handleNavClick("/versenyek")}
          >
            Versenyek
          </p>

          {isAdmin && (
            <Link
              className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              to="/admin"
              onClick={() => setIsOpen(false)}
            >
              Admin felület
            </Link>
          )}

          {user ? (
            <div>
                <button
                  className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
                  onClick={() => setShowLogout(true)}
                >
                  Kijelentkezés
                </button>
            </div>
          ) : (
            <button
              className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              onClick={() => {
                setIsLoginOpen(true);
                setIsOpen(false);
              }}
            >
              Bejelentkezés
            </button>
          )}
        </nav>
      </div>

      {/* ===================== HAMBURGER IKON ===================== */}
      <div
        className="fixed z-30 w-10 h-10 cursor-pointer md:hidden top-2 right-2"
        onClick={toggleMenu}
      >
        <img
          src="./5402398_list_menu_options_settings_checklist_icon.png"
          alt="menu"
          className="w-full h-full"
        />
      </div>
    </header>
  );
}

export default Header;