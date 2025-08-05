import express from 'express';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dayjs from 'dayjs';
import db from '../db.js';
import hu from 'dayjs/locale/hu.js';

dayjs.locale(hu);

const router = express.Router();

async function formatBookings(bookings) {
  if (!bookings || bookings.length === 0) return 'Nincs foglalás.';

  const courtId = bookings[0].Court_id;
  console.log("ezt kapta a function: ", bookings, " ez a courtid: ", courtId)

  const courtResult = await db.query(
    'SELECT number, name FROM courts WHERE id = $1',
    [courtId]
  );

  console.log("results: ", courtResult)

  if (courtResult.rows.length === 0) {
    return 'Ismeretlen pálya';
  }

  const { number, name } = courtResult.rows[0];

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  const lines = sorted.map(b => {
    const date = dayjs(b.startTime);
    return `🗓️ ${date.format('YYYY. MMMM D. (dddd)')} – ${date.format('HH:mm')}`;
  });

  return `📍 Pálya neve: ${name} (${number}. pálya)\n\n${lines.join('\n')}`;
}

router.post('/send-email', async (req, res) => {
  const { userId, bookings } = req.body;

  if (!userId || !bookings) {
    return res.status(400).json({ error: 'userId és bookings kötelező.' });
  }
  console.log("na elv itt jo helyen van: ", bookings)

  try {
    const bookingsFormatted = await formatBookings(JSON.parse(bookings));

    const result = await db.query(
      'SELECT email, username FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Felhasználó nem található.' });
    }

    const { email, username } = result.rows[0];

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

    const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      to: [{ email, name: username || 'Pályafoglaló' }],
      sender: { email: 'almadistrandroplabda@gmail.com', name: 'BSSE' },
      subject: 'A foglalásodat mentettük!',
      templateId: 1,
      params: {
        name: username,
        bookings: bookingsFormatted,
      },
    };

    await emailApi.sendTransacEmail(sendSmtpEmail);

    res.status(200).json({ message: 'Email elküldve.' });
  } catch (err) {
    console.error('Hiba email küldéskor:', err);
    res.status(500).json({ error: 'Nem sikerült elküldeni az emailt.' });
  }
});

export default router;
