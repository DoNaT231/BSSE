import './Header.css'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Modal from './Modal';
import LoginRegist from '../pages/LoginRegist/LoginRegist';
import AddPasswordForm from '../pages/LoginRegist/SettingPassword';
function Header(){
    const [isOpen, setIsOpen] = useState(window.innerWidth>600? true : false);
    const [modal, setModal] = useState("")
    const { loggedIn, username, role, logout } = useAuth();
    console.log("role: ", role + " username: ", username)
    console.log(role)
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };
  useEffect(() => {
  const handleResize = () => {
    if (window.matchMedia("(min-width: 600px)").matches) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  window.addEventListener("resize", handleResize);
  handleResize(); // lefuttatjuk azonnal is

  return () => window.removeEventListener("resize", handleResize);
}, []);


  const handleLogOut = () => {
    logout()
    setModal(false)
  }
    return(
        <header className={`App-header ${isOpen ? "open" : ""}`}>
          {modal==="logout" && <Modal>
                <h1>Biztosan kijelentkezel?</h1>
                <button onClick={handleLogOut}>Kijelentkezés</button>
                <button onClick={()=>setModal(false)}>Mégsem</button>
              </Modal>}
          {modal==="login" && !loggedIn && <Modal>
              <LoginRegist/>
              <button onClick={()=>setModal("")}>mégse</button>
            </Modal>}
          {modal==="setPassword" && <Modal>
            <AddPasswordForm exit={()=>setModal('')}/>
            <button onClick={()=>setModal("")}>mégse</button>
            </Modal>}
        <div className='App-header-logo'>
          <img src='.\images\Képernyőkép 2025-06-11 200633.png'/>
        </div>
        <div className='App-header-upper-slice'>
          <h1>BALATONI STRANDSPORT EGYESÜLET</h1>
        </div>
        {isOpen && (
            <nav className="navbar">
            <Link to="/">Kezdőlap</Link>
            <Link to="/foglalas">Foglalás</Link>
            {!loggedIn && <Link onClick={()=>setModal("login")}>Bejelentkezés</Link>}
            {role==="admin" && <Link to={'/admin'}>Admin felület</Link>}
            {loggedIn && <Link onClick={()=>setModal("logout")}>Kijelentkezés</Link>}
            </nav>
        )}
        <div className='App-header-options-icon' onClick={toggleMenu}>
            <img src='.\5402398_list_menu_options_settings_checklist_icon.png'/>
        </div>
      </header>
    )
}
export default Header

/*            {modal && <Modal>
                <h1>Biztosan kijelentkezel?</h1>
                <button onClick={()=>logout}>Kijelentkezés</button>
                <button onCanPlay={()=>setModal(false)}>Mégsem</button>
              </Modal>}*/