export const EMAIL_TEMPLATES = {
  RESERVATION_CONFIRMATION: {
    id: 2,
    subject: "A foglalásodat mentettük!",
  },
  TOURNAMENT_REG_SUCCESS: {
    id: 2, // majd Brevo-ban létrehozod
    subject: "Sikeres versenyjelentkezés!",
  },
  RESERVATION_CANCELLED: {
    id: 3, // majd Brevo-ban létrehozod
    subject: "Foglalás lemondva",
  },
  ADMIN_CONFLICT: {
    id: 4, // majd Brevo-ban létrehozod
    subject: "Ütközés / admin értesítés",
  },
};