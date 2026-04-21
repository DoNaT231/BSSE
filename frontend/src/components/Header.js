import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  const { isAdmin, isLoggedIn } = useAuth();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNavClick = (page) => {
    setIsOpen(false);
    navigate(page);
  };

  useEffect(() => {
    function handleOpenLoginModalEvent() {
      setIsLoginOpen(true);
      setIsOpen(false);
      setShowLogout(false);
    }

    window.addEventListener("bsse:open-login-modal", handleOpenLoginModalEvent);
    return () => {
      window.removeEventListener(
        "bsse:open-login-modal",
        handleOpenLoginModalEvent
      );
    };
  }, []);

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-[200]
        flex justify-center transition-all duration-300
      "
    >
      {/* ===================== LOGIN MODAL ===================== */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        dismissible
      />

      {/* ===================== KIJELENTKEZÉS MODAL ===================== */}
      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
      />

      {/* ===================== LOGÓ (SMASH by Melodiak) ===================== */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleNavClick("/")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavClick("/");
          }
        }}
        className="
          fixed z-30 top-4 left-4 md:left-4 md:translate-x-0
          w-[min(11rem,calc(100%-5.5rem))] h-[4rem]
          flex items-center justify-center
          rounded-[2rem] bg-white shadow-md px-2 py-1
          cursor-pointer transition-transform duration-300 hover:scale-[1.02]
        "
      >
        <img
          src={`${process.env.PUBLIC_URL}/logos/smash_by_melodiak_final.svg`}
          alt="SMASH by Melodiak"
          className="max-h-full w-full object-contain object-center pointer-events-none"
        />
      </div>

      {/* ===================== FELSŐ FEKETE SÁV ===================== */}
      <div
        className="
          fixed top-0 left-0 right-0
          h-[54px]
          bg-blackSoft text-white
          flex items-center
          z-20
        "
      >
        <h1 className="pl-[200px] text-lg font-semibold hidden md:block">
          SMASH Strandröplabda Bajnokság
        </h1>
      </div>

      {/* ===================== NAVBAR ===================== */}
      <div
        className={`
          fixed left-0 right-0 top-[54px]
          z-10
          flex w-full
          pt-4 pb-4 md:pb-0 md:pt-0
          bg-lightBlue shadow-lg
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "-translate-y-[calc(100%)]"}
          ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
          overflow-hidden
          max-h-[calc(100vh-54px)]

          md:static md:z-auto md:translate-y-0 md:pointer-events-auto
          md:overflow-visible md:max-h-none

          md:min-h-24 md:h-auto md:py-2
          items-start md:items-end
          md:justify-end justify-center
        `}
      >
        <nav
          className="
            w-full
            flex flex-col items-center md:items-end
            gap-6 justify-end
            py-8
            text-center text-white
            md:flex-row md:flex-wrap md:gap-x-4 md:gap-y-2 md:text-center lg:gap-x-7 xl:gap-11
            md:py-0
            md:mr-3 md:mb-2 md:text-end
          "
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

          <p
            className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
            onClick={() => handleNavClick("/csutortoki-bajnoksag")}
          >
            Csütörtöki bajnokság
          </p>

          <p
            className="cursor-pointer relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
            onClick={() => handleNavClick("/galeria")}
          >
            Galéria
          </p>

          {isAdmin && (
            <Link
              className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              to="/admin"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Admin felület
            </Link>
          )}

          {isLoggedIn && (
            <Link
              className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              to="/profil"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Profil
            </Link>
          )}

          {isLoggedIn ? (
            <button
              className="relative hover:after:w-full after:block after:h-[1px] after:bg-white after:w-0 after:transition-all"
              onClick={() => setShowLogout(true)}
            >
              Kijelentkezés
            </button>
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