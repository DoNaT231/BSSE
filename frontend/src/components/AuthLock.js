import { useState } from "react";
import Modal from "./Modal";
import LoginRegist from "../pages/LoginRegist/LoginRegist";

export default function AuthFrostLock({ loggedIn, children }) {
  const [showModal, setShowModal] = useState(!loggedIn);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="relative">
      
      {/* CHILDREN */}
      <div
        className={`
          transition-all duration-300
          ${!loggedIn ? "blur-md pointer-events-none select-none" : ""}
        `}
      >
        {children}
      </div>

      {/* FROST OVERLAY */}
      {!loggedIn && (
        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-white/20">
          
          {showModal && (
             <div className="p-12 pt-4 bg-white border-2 rounded-xl">
              <LoginRegist />
             </div>
          )}

        </div>
      )}
    </div>
  );
}
