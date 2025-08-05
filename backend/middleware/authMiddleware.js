import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  // 1️⃣ Token header ellenőrzése
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn('⛔ Nincs Authorization header');
    return res.status(401).json({ message: 'Hiányzó token' });
  }

  // 2️⃣ Token kinyerése a "Bearer ..." formátumból
  const token = authHeader.split(' ')[1];

  try {
    // 3️⃣ Token dekódolása és ellenőrzése
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //console.log("decoded: ",decoded)

    // 4️⃣ req.user beállítása, hogy a route handler is használhassa
    req.user = decoded;
    req.user.role = decoded.role;

    console.log('✅ Token OK, felhasználó:', req.user);
    
    // 5️⃣ Továbbengedés a következő middleware-hez vagy route-hoz
    next();
  } catch (err) {
    // 6️⃣ Token hibás (lejárt vagy hamis)
    console.warn('⛔ Érvénytelen token:', err.message);
    res.status(403).json({ message: 'Érvénytelen token' });
  }
}