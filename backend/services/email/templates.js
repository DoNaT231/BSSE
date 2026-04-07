export const EMAIL_TEMPLATES = {
  RESERVATION_CONFIRMATION: {
    id: 2,
    subject: "A foglalásodat mentettük!",
  },
  TOURNAMENT_REG_SUCCESS: {
    id: 3, 
    subject: "Versenyjelentkezés sikeres",
  },
  TOURNAMENT_REG_WAITLIST: {
    id: 5, 
    subject: "Versenyjelentkezés várólistán",
  },
  RESERVATION_CANCELLED: {
    id: 4, // majd Brevo-ban létrehozod
    subject: "Foglalás lemondva",
  },
  ADMIN_CONFLICT: {
    id: 6, // majd Brevo-ban létrehozod
    subject: "Ütközés / admin értesítés",
  },
};