import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { API_BASE_URL } from "../../config";

function AddPasswordForm({exit}) {
    const [password, setPassword] = useState("")
    const [passwordAgain, setPasswordAgain] = useState("")
    const [alertMessage, setAlertMessage] = useState("")
    const token = localStorage.getItem("token");
    const {setRole} = useAuth()
    const addPasswordFetch = async() =>{
        console.log(token)
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/set-password`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Szerverhiba:", res.status, data);
                setAlertMessage(data.error || "Ismeretlen hiba");
                return;
            }

            console.log("Siker:", data);
            setRole("user-with-password")
            exit();
            } catch (err) {
            setAlertMessage(`Hiba a jelszó beállítása közben: ${err.message}`);
            }
    }
    const handleSubmit = (e) =>{
        e.preventDefault()
        if(password === passwordAgain){
            addPasswordFetch()
        }
        else setAlertMessage("A két jelszó nem egyezik")
    }
    return(
        <div className="loginRegistrationDiv">
            <form onSubmit={handleSubmit}>
                <h1>Jelszó beállítás</h1>
                {alertMessage!=="" && <p style={{ color: 'red' , fontSize: '12px' , marginBottom: '16px'}}>{alertMessage}</p>}
                <p>Ha szeretné profilját jelszóval védeni adja meg a jelszót</p>
                <input type="password" value={password} placeholder="Jelszó" onChange={e => setPassword(e.target.value)} />
                <input type="password" value={passwordAgain} placeholder="Jelszó megint" onChange={e => setPasswordAgain(e.target.value)}/>
                <button type="submit">Tovább</button>
            </form>
        </div>
    )
}
export default AddPasswordForm