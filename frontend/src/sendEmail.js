import dayjs from 'dayjs'
import { API_BASE_URL } from "./config";
import 'dayjs/locale/hu'

dayjs.locale('hu')

async function sendEmail(userId, bookings) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        bookings: JSON.stringify(bookings)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Ismeretlen hiba');
    }

    console.log('Email sikeresen elküldve!');
  } catch (err) {
    console.error('Email küldési hiba:', err.message);
  }
}

export default sendEmail;