import { ro } from "date-fns/locale";
import { createContext, useContext, useState, useEffect } from "react";
// 1. Kontextus létrehozása
const AuthContext = createContext();

// 2. Provider komponens
export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState()
  // 3. Token ellenőrzése a localStorage-ből
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isJwtValid(token)) {
      setLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("payload: ", payload)
        setUserId(payload.id);
        setUsername(payload.username);
        setRole(payload.role);
        setLoggedIn(true)
        console.log(userId, " ", loggedIn, " ", username, " ", role)
      } catch {
        logout();
      }
    }else{
      logout()
    }
  }, []);


      useEffect(() => {
      console.log("Állapotváltozás: ", { loggedIn, username, role });
    }, [loggedIn, username, role]);
 // 4. Kijelentkezés és bejelentkezés logika
  const login = (token) => {
    console.log()
    localStorage.setItem("token", token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUserId(payload.id);
    setUsername(payload.username);
    setRole(payload.role)
    console.log(payload.role)
    setLoggedIn(true);
    console.log(userId, " ", loggedIn, " ", username, " ", role)
  }; 
 
  const logout = () => {
    localStorage.removeItem("token");
    setUserId("")
    setLoggedIn(false);
    setRole("")
    setUsername("");
  };

  function isJwtValid(token) {
    if (!token || typeof token !== 'string') return false;

    try {
      const parts = token.split('.');

      if (parts.length !== 3) return false; // nem jó formátum

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000); // másodpercben

      if (!payload.exp) return false; // nincs exp mező

      return payload.exp > now; // true ha még érvényes
    } catch (err) {
      console.error('Érvénytelen JWT:', err);
      return false;
    }
  }

  // 5. A globálisan elérhető értékek
  return (
    <AuthContext.Provider value={{ loggedIn, role, username, setLoggedIn, setRole, setUsername, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Saját hook a könnyebb használathoz
export const useAuth = () => useContext(AuthContext);