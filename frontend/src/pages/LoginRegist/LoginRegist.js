import { useState } from "react";
import Modal from "../../components/Modal"
import { useAuth } from "../../AuthContext";
import { API_BASE_URL } from "../../config";

export default function LoginRegist(){
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [stage, setStage] = useState("askEmail")
    const [alertMessage, setAlertMessage] = useState("")
    const {login} = useAuth()

    async function checkEmail(email) {
        const res = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if(!res.ok){
            console.log(data.error)
           setAlertMessage(data.error)
        }

        // Kezelés a status szerint
        switch (data.status) {
            case 'ok':
            // Jelszó nélkül beléphető → hívjuk login-t
                login(data.token);
                break;
            case 'password_required':
            // Jelszót kér be
                setStage('askPassword');
                break;
            case 'name_required':
            // Név bekérés regisztrációhoz
                setStage('askName');
                break;
            default:
            console.error('Ismeretlen válasz:', data);
        }
    }

    //regisztralas
    async function register(name, email) {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            login(data.token)
        } else if (data.status === 'user_exists') {
            setAlertMessage('Ez az email már létezik.');
        } else {
            console.error('Regisztrációs hiba:', data);
        }
    }

    //belepes jelszoval
    async function loginWithPassword(email, password) {
        console.log("password:", password + "email: ", email)
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            login(data.token)
        } else if (data.status === 'invalid_password') {
            setAlertMessage('Hibás jelszó!');
        } else if (data.status === 'no_password_set') {
            setAlertMessage('Ehhez a fiókhoz nem tartozik jelszó.');
        } else if (data.status === 'not_found') {
            setAlertMessage('Nincs ilyen felhasználó.');
        } else {
            console.error('Bejelentkezési hiba:', data);
        }
    }
    const handleEmailSubmit = (e) =>{
        e.preventDefault()
        checkEmail(email)
    }
    const handleNameSubmit = (e) => {
        e.preventDefault()
        register(name, email)
    }
    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        loginWithPassword(email, password)
    }
    return(
        <div className="loginRegistrationDiv">
            {stage === 'askEmail' && (
                <form onSubmit={handleEmailSubmit}>
                    <h1>BEJELENTKEZÉS</h1>
                    <p>Adja meg az Email címét hogy tudjon foglalni</p>
                    {alertMessage!=="" && <p style={{ color: 'red' , fontSize: '12px' , marginBottom: '16px'}}>{alertMessage}</p>}
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <button type="submit">Tovább</button>
                </form>
                )}

            {stage === 'askPassword' && (
                <form onSubmit={handlePasswordSubmit}>
                    <p>Adja meg a jelszót</p>
                    {alertMessage!=="" && <p style={{ color: 'red' , fontSize: '12px' , marginBottom: '16px'}}>{alertMessage}</p>}
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="submit">Bejelentkezés</button>
                </form>
                )}

            {stage === 'askName' && (
                <form onSubmit={handleNameSubmit}>
                    <p>Adja meg a nevét hogy regsiztráljuk</p>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                    <button type="submit">Regisztráció</button>
                </form>
                )}
        </div>
    )
}