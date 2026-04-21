# 🏐 Balatoni Strandsport Egyesület (BSSE) – Webalkalmazás

Ez a repository a **Balatoni Strandsport Egyesület (BSSE)** webalkalmazását tartalmazza, **frontend + backend** komponensekkel.

A rendszer célja:
- a strandsport közösség online bemutatása,
- a **pályafoglalások digitális kezelése**,
- versenyek és nevezések adminisztrációja,
- felhasználói és admin folyamatok támogatása egy helyen.

---

## 🚀 Fő funkciók

- 🏠 Modern landing oldal (hero, bemutatkozás, szponzor szekciók)
- 📸 Galéria oldal
- 📅 Heti nézetű online pályafoglalás
- 🖨️ Nyomtatható heti foglalási nézet
- 🔐 JWT-alapú autentikáció (regisztráció / bejelentkezés / jelszókezelés)
- 👤 Saját profil oldal
- 🛠️ Admin felület:
  - felhasználókezelés (aktiválás, deaktiválás, módosítás, törlés)
  - pályák kezelése
  - foglalások kezelése
  - versenyek és nevezések kezelése
- 🏆 Verseny modul:
  - verseny létrehozás/szerkesztés/törlés
  - idősávok (slotok) kezelése
  - nevezés, nevezés módosítás, státuszkezelés
- 📊 Csütörtöki bajnokság ranglista (Top lista)
- 🗺️ Térképes helyszínmegjelenítés (Leaflet)
- 📱 Reszponzív felület mobil / tablet / desktop nézetre

---

## 🧱 Technológiai stack

### Frontend
- React 19
- React Router
- Tailwind CSS
- Leaflet + React Leaflet
- dayjs / date-fns

### Backend
- Node.js + Express
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`)
- Auth middleware + role-based védelem (admin)
- Környezeti változók (`dotenv`)

---

## 📂 Projektstruktúra

```text
BSSE/
├── frontend/                 # React kliensalkalmazás
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── features/
│       │   ├── auth/
│       │   ├── booking/
│       │   ├── tournament/
│       │   ├── tournamentRegistration/
│       │   └── thursdayChampionship/
│       └── pages/
└── backend/                  # Express REST API
    ├── middleware/
    ├── repositories/
    ├── routes/
    ├── services/
    └── utils/
```

---

## 🧭 Frontend oldalak (fő route-ok)

- `/` – Főoldal
- `/palyafoglalas` – Foglalási felület
- `/versenyek` – Versenyek és nevezés
- `/csutortoki-bajnoksag` – Ranglista oldal
- `/galeria` – Galéria
- `/profil` – Saját profil
- `/admin` – Admin dashboard
- `/adatkezelesitajekoztatoesaszf` – Adatkezelési tájékoztató és ÁSZF

---

## 🔌 API modulok (backend)

- `/api/auth` – auth folyamatok, jelszókezelés
- `/api/user` – saját profil, user műveletek
- `/api/courts` – pályák lekérése/kezelése
- `/api/calendar` – naptár slotok, admin nézet, nyomtatási adatok
- `/api/reservations` – heti foglalások szinkronizálása, törlés
- `/api/tournaments` – verseny CRUD + slotok + nevezések
- `/api/tournament-registrations` – saját/admin nevezéskezelés
- `/api/thursday-leaderboard` – csütörtöki top lista
- `/api/admin/users` – admin felhasználókezelés

---

## ⚙️ Telepítés és futtatás (lokálisan)

### 1) Repository klónozása

```bash
git clone https://github.com/DoNaT231/BSSE.git
cd BSSE
```

### 2) Függőségek telepítése

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 3) Környezeti változók beállítása

A `backend` mappában hozz létre egy `.env` fájlt (a konkrét értékek a saját környezetedhez igazodnak):

```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### 4) Fejlesztői szerverek indítása

Két külön terminálban:

```bash
# backend
cd backend
npm run dev
```

```bash
# frontend
cd frontend
npm start
```

Elérés:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🔒 Jogosultsági szintek

- **Vendég:** nyilvános oldalak megtekintése, bejelentkezés/regisztráció
- **Felhasználó:** saját foglalások és nevezések kezelése, profil használata
- **Admin:** teljes admin felület, felhasználók/pályák/foglalások/versenyek kezelése

---

## 🧪 Elérhető parancsok

### Frontend (`frontend`)
- `npm start` – fejlesztői szerver
- `npm run build` – production build
- `npm test` – teszt futtatás

### Backend (`backend`)
- `npm run dev` – fejlesztői mód (`nodemon`)
- `npm start` – szerver indítás

---

## 🧰 Deployment megjegyzés

A backend konfigurálva van a frontend build statikus kiszolgálására is, így production környezetben egy szerverről is futtatható.

Éles elérés: [https://balatonsse.hu](https://balatonsse.hu)

---

## 👤 Készítette

Komoróczy Donát

---

## 📜 Licenc

© Balatoni Strandsport Egyesület (BSSE) / Komoróczy Donát – Minden jog fenntartva.

Ez a repository és annak teljes tartalma (forráskód, design elemek, szövegek, képi anyagok, arculati elemek) **jogi védelem alatt áll**.

- A kód részbeni vagy teljes másolása, újraközlése, továbbértékesítése vagy saját projektben történő felhasználása kizárólag előzetes, írásbeli engedéllyel lehetséges.
- A név, logó, vizuális arculat és tartalmi elemek engedély nélküli felhasználása tilos.
- A jogosulatlan felhasználás jogi következményeket vonhat maga után.

Felhasználási vagy együttműködési igény esetén vedd fel a kapcsolatot a jogtulajdonossal.
