# 🏐 Balatoni Strandsport Egyesület (BSSE) – Weboldal

Ez a repository a **Balatoni Strandsport Egyesület (BSSE)** hivatalos weboldalának forráskódját tartalmazza.

A weboldal célja a strandsport közösség bemutatása, az **online pályafoglalás biztosítása**, valamint információ nyújtása eseményekről és szponzorációs lehetőségekről.

---

## 🚀 Funkciók

- 🏖️ Landing page (hero szekció, bemutatkozás)
- 📸 Végtelenül görgethető képgaléria
- 📅 Online pályafoglalási rendszer
- 🔐 Bejelentkezés / regisztráció (vendég és felhasználói mód)
- 🛠️ Admin jogosultságok (foglalások kezelése)
- 📍 Beágyazott térkép (helyszín megjelenítése)
- 🤝 Szponzorációs információk
- 📱 Teljesen reszponzív design (mobil / tablet / desktop)

---

## 🧑‍💻 Technológiai stack

### Frontend
- **React**
- **React Router**
- **Tailwind CSS**
- CSS animációk és SVG elválasztók
- Modern, komponens-alapú architektúra

### Backend *(külön szolgáltatás / repository)*
- REST API
- JWT-alapú autentikáció
- Foglalások kezelése
- Email értesítések

---

## 📂 Projektstruktúra (frontend)

src/
├── components/
│ ├── Header
│ ├── Modal
│ ├── InfiniteGallery
│ ├── WaveDivider
│ ├── WeeklyTimeGrid
│ └── Map
├── pages/
│ ├── Home
│ ├── LoginRegist
│ └── Admin
├── AuthContext.js
├── config.js
└── App.js

yaml
Copy code

---

## ⚙️ Telepítés és futtatás

### 1️⃣ Repository klónozása
```bash
git clone https://github.com/DoNaT231/BSSE.git
cd bsse-frontend
2️⃣ Függőségek telepítése
bash
Copy code
npm install
3️⃣ Fejlesztői szerver indítása
bash
Copy code
npm start
Az alkalmazás elérhető lesz itt:
👉 http://localhost:3000

🎨 Design & UI elvek
Letisztult, sportos megjelenés

Nagyméretű hero tipográfia

SVG alapú elválasztók

Tailwind theme színek használata

Minimális globális CSS, komponens-szintű stílusok

🔒 Jogosultságok
Vendég: megtekintés, bejelentkezés

Felhasználó: pályafoglalás

Admin: foglalások kezelése, törlése

📌 További tervek
📊 Statisztikák és kihasználtsági adatok

🏆 Eseménykezelő modul

🌙 Dark mode

🌐 Többnyelvű támogatás

👤 Készítette
Komoróczy Donát

📜 Licenc
Ez a projekt jelenleg magánhasználatra készült.
Az egyesület hivatalos megalakulását követően a jogok átadásra kerülnek a BSSE részére.
