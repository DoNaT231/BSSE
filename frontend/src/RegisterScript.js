export default async function register(userData) {
  try {
    const response = await fetch('https://localhost:7097/api/auth/register', {//elv ha sajat domainunk lesz ez kell: https://api.balatonsse.hu/api/auth/login
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: userData.UserName,
        email: userData.Email,
        password: userData.Password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sikertelen regisztráció');
    }

    // JWT token mentése localStorage-be vagy contextbe
    localStorage.setItem('token', data.token);
    alert(data.message);
  } catch (error) {
    console.error('Regisztrációs hiba:', error.message);
  }
}