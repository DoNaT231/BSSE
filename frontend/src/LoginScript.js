import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
export default function Login(userData){
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch("https://balatonsse.hu/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userData.Email, password: userData.Password })
    });

    const data = await response.json();

    if (response.ok) {
      const token = data.token;
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; // vagy decoded.role

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      alert(data.message);
    }
  };
}