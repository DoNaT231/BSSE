import { useState } from "react";
import LoginModal from "../features/auth/components/LoginModal";
import { useAuth } from "../contexts/AuthContext";

/**
 * AuthFrostLock
 * ---------------------------------------
 * Egy UI védelmi komponens, amely lezárja
 * a tartalmat, ha a felhasználó nincs
 * bejelentkezve.
 *
 * Működés:
 * - ha nincs user → a tartalom elmosódik
 * - overlay jelenik meg
 * - LoginModal jelenik meg
 *
 * Ha a felhasználó bejelentkezik:
 * - a blur eltűnik
 * - az overlay eltűnik
 * - a tartalom használható lesz
 *
 * Tipikus használat:
 *
 * <AuthFrostLock>
 *   <ReservationPage />
 * </AuthFrostLock>
 *
 * A komponens az AuthContext-ből olvassa
 * ki a user állapotot.
 */

export default function AuthFrostLock({children }) {


    /**
   * AuthContext
   * ------------------------
   * A globális auth állapot elérése.
   *
   * user:
   * - null → nincs bejelentkezve
   * - object → bejelentkezett user
   */
  const { user } = useAuth();
  
  /**
   * showModal
   * ------------------------
   * Meghatározza, hogy a login modal
   * látható-e.
   *
   * Alapértelmezés:
   * ha nincs bejelentkezve → modal nyitva
   */
  const [showModal, setShowModal] = useState(!user);


  /**
   * closeModal
   * ------------------------
   * Bezárja a login modalt.
   * Ezt a LoginModal hívja meg
   * sikeres login után.
   */
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="relative">

      {/* ===============================
         CHILDREN TARTALOM
         ===============================
         Ha nincs user:
         - blur
         - nem kattintható
      */}
      <div
        className={`
          transition-all duration-300
          ${!user ? "blur-md pointer-events-none select-none" : ""}
        `}
      >
        {children}
      </div>

      {/* ===============================
         FROST OVERLAY
         ===============================
         Csak akkor jelenik meg,
         ha a user nincs bejelentkezve.
      */}
      {!user && (
        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-white/20">

          {/* ===============================
             LOGIN MODAL
             ===============================
             A bejelentkezési folyamat UI-ja.
          */}
          {showModal && (
            <LoginModal
              isOpen={showModal}
              onClose={closeModal}
            />
          )}

        </div>
      )}
    </div>
  );
}